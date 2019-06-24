package in.co.everyrupee.service.income;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.events.income.OnFetchCategoryTotalCompleteEvent;
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;
import in.co.everyrupee.security.core.userdetails.MyUser;
import in.co.everyrupee.utils.ERStringUtils;

@Transactional
@Service
@CacheConfig(cacheNames = { DashboardConstants.Transactions.TRANSACTIONS_CACHE_NAME })
public class UserTransactionService implements IUserTransactionService {

    @Autowired
    private UserTransactionsRepository userTransactionsRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * fetches User Transactions for a particular user
     * 
     * @param formData
     * @return
     */
    @Override
    @Cacheable(key = "{#pFinancialPortfolioId,#dateMeantFor}")
    public Object fetchUserTransaction(String pFinancialPortfolioId, String dateMeantFor) {

	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	Date date = new Date();
	try {
	    date = format.parse(dateMeantFor);
	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user Transaction");
	}

	List<UserTransaction> userTransactions = userTransactionsRepository
		.findByFinancialPortfolioIdAndDate(pFinancialPortfolioId, date);

	if (CollectionUtils.isEmpty(userTransactions)) {
	    MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	    logger.warn("user transactions data is empty for user ", user.getUsername());
	    return userTransactions;
	}

	return sortByCategoryIdForHtmlTransactionsPage(userTransactions, pFinancialPortfolioId);
    }

    private Map<Integer, List<UserTransaction>> sortByCategoryIdForHtmlTransactionsPage(
	    List<UserTransaction> userTransactions, String pFinancialPortfolioId) {
	Map<Integer, List<UserTransaction>> userTransactionsMapTemp = new HashMap<Integer, List<UserTransaction>>();
	Map<Integer, List<UserTransaction>> userTransactionsMap = new HashMap<Integer, List<UserTransaction>>();

	// Build a map with category and transactions
	for (UserTransaction userTransaction : userTransactions) {
	    if (!userTransactionsMapTemp.containsKey(userTransaction.getCategoryId())) {
		List<UserTransaction> list = new ArrayList<UserTransaction>();
		list.add(userTransaction);

		userTransactionsMapTemp.put(userTransaction.getCategoryId(), list);
	    } else {
		userTransactionsMapTemp.get(userTransaction.getCategoryId()).add(userTransaction);
	    }
	}

	// Sort older transactions at the bottom
	Iterator<Entry<Integer, List<UserTransaction>>> it = userTransactionsMapTemp.entrySet().iterator();
	while (it.hasNext()) {
	    Map.Entry<Integer, List<UserTransaction>> categoryAndTransactionsPair = it.next();
	    List<UserTransaction> userTransactionsList = categoryAndTransactionsPair.getValue();
	    Collections.reverse(userTransactionsList);
	    userTransactionsMap.put(categoryAndTransactionsPair.getKey(), userTransactionsList);
	}

	logger.debug("finished sorting for the financial portfolio - " + pFinancialPortfolioId);

	return userTransactionsMap;
    }

    /**
     * Save User Transaction to the database
     * 
     * @param formData
     * @return
     */
    @Override
    @CacheEvict(key = "{#pFinancialPortfolioId,#formData.get(\"dateMeantFor\").get(0)}")
    public UserTransaction saveUserTransaction(MultiValueMap<String, String> formData, String pFinancialPortfolioId) {

	if (CollectionUtils.isEmpty(formData.get(DashboardConstants.Transactions.TRANSACTIONS_AMOUNT))) {
	    throw new ResourceNotFoundException("UserTransactions", "formData", formData);
	}

	UserTransaction userTransaction = new UserTransaction();
	userTransaction.setFinancialPortfolioId(pFinancialPortfolioId);
	if (CollectionUtils.isNotEmpty(formData.get(DashboardConstants.Transactions.DESCRIPTION))) {
	    userTransaction.setDescription(formData.get(DashboardConstants.Transactions.DESCRIPTION).get(0));
	}
	userTransaction
		.setCategoryId(Integer.parseInt(formData.get(DashboardConstants.Transactions.CATEGORY_OPTIONS).get(0)));
	userTransaction.setAmount(
		Double.parseDouble(formData.get(DashboardConstants.Transactions.TRANSACTIONS_AMOUNT).get(0)));

	String dateString = formData.get(DashboardConstants.Budget.DATE_MEANT_FOR).get(0);
	try {
	    userTransaction.setDateMeantFor(new SimpleDateFormat(DashboardConstants.DATE_FORMAT).parse(dateString));
	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}

	UserTransaction userTransactionResponse = userTransactionsRepository.save(userTransaction);

	return userTransactionResponse;
    }

    /**
     * Deletes all the transactions with the id separated with commas
     * 
     * @param transactionalIds
     * @return
     */
    @Override
    @CacheEvict(key = "{#financialPortfolioId,#dateMeantFor}")
    public void deleteUserTransactions(String transactionalIds, String financialPortfolioId, String dateMeantFor) {
	String[] arrayOfTransactionIds = transactionalIds.split(GenericConstants.COMMA);
	Set<String> transactionIdsAsSet = new HashSet<String>();
	transactionIdsAsSet.addAll(Arrays.asList(arrayOfTransactionIds));
	transactionIdsAsSet.remove(ERStringUtils.EMPTY);
	List<Integer> transactionIdsAsIntegerList = transactionIdsAsSet.stream().filter(Objects::nonNull)
		.map(s -> Integer.parseInt(s)).collect(Collectors.toList());

	userTransactionsRepository.deleteUsersWithIds(transactionIdsAsIntegerList, financialPortfolioId);

    }

    /**
     * Update the transactions with the new value
     */
    @Override
    @CacheEvict(key = "{#financialPortfolioId,#formData.get(\"dateMeantFor\").get(0)}")
    public UserTransaction updateTransactions(MultiValueMap<String, String> formData, String formFieldName,
	    String financialPortfolioId) {

	Optional<UserTransaction> userTransaction = userTransactionsRepository
		.findById(Integer.parseInt(formData.get(DashboardConstants.Transactions.TRANSACTIONS__ID_JSON).get(0)));

	if (ERStringUtils.equalsIgnoreCase(formFieldName, DashboardConstants.Transactions.DESCRIPTION)) {
	    userTransaction.get().setDescription(formData.get(DashboardConstants.Transactions.DESCRIPTION).get(0));
	}

	if (ERStringUtils.equalsIgnoreCase(formFieldName, DashboardConstants.Transactions.AMOUNT_FIELD_NAME)) {
	    userTransaction.get().setAmount(
		    Double.parseDouble(formData.get(DashboardConstants.Transactions.TRANSACTIONS_AMOUNT).get(0)));
	}

	if (ERStringUtils.equalsIgnoreCase(formFieldName, DashboardConstants.Transactions.CATEGORY_FORM_FIELD_NAME)) {
	    userTransaction.get().setCategoryId(
		    Integer.parseInt(formData.get(DashboardConstants.Transactions.CATEGORY_ID_JSON).get(0)));
	}

	UserTransaction userTransactionSaved = userTransactionsRepository.save(userTransaction.get());

	return userTransactionSaved;
    }

    /**
     * Fetch category total
     */
    @Override
    public Map<Integer, Double> fetchCategoryTotalAndUpdateUserBudget(String financialPortfolioId,
	    String dateMeantFor) {

	Map<Integer, Double> categoryAndTotalAmountMap = new HashMap<Integer, Double>();
	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	Date date = new Date();
	try {
	    date = format.parse(dateMeantFor);
	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user transaction");
	}

	List<UserTransaction> userTransactions = userTransactionsRepository
		.findByFinancialPortfolioIdAndDate(financialPortfolioId, date);

	if (CollectionUtils.isEmpty(userTransactions)) {
	    MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	    logger.warn("user transactions data is empty for user ", user.getUsername());
	    return categoryAndTotalAmountMap;
	}

	for (UserTransaction userTransaction : userTransactions) {
	    if (categoryAndTotalAmountMap.containsKey(userTransaction.getCategoryId())) {
		Double categoryTotalAmountPrevious = categoryAndTotalAmountMap.get(userTransaction.getCategoryId());
		categoryAndTotalAmountMap.put(userTransaction.getCategoryId(),
			categoryTotalAmountPrevious + userTransaction.getAmount());
	    } else {
		categoryAndTotalAmountMap.put(userTransaction.getCategoryId(), userTransaction.getAmount());
	    }
	}

	// Auto Create Budget on saving the transaction
	eventPublisher.publishEvent(
		new OnFetchCategoryTotalCompleteEvent(categoryAndTotalAmountMap, dateMeantFor, financialPortfolioId));

	return categoryAndTotalAmountMap;
    }

}
