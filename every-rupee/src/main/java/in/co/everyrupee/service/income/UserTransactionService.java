package in.co.everyrupee.service.income;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;
import in.co.everyrupee.security.core.userdetails.MyUser;
import in.co.everyrupee.utils.ERStringUtils;

@Service
@CacheConfig(cacheNames = { "userTransaction" })
public class UserTransactionService implements IUserTransactionService {

    @Autowired
    UserTransactionsRepository userTransactionsRepository;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * fetches User Transactions for a particular user
     * 
     * @param formData
     * @return
     */
    @Override
    @Cacheable
    public Object fetchUserTransaction(String pFinancialPortfolioId) {

	MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	List<UserTransaction> userTransactions = userTransactionsRepository
		.findByFinancialPortfolioId(pFinancialPortfolioId);

	if (CollectionUtils.isEmpty(userTransactions)) {
	    logger.warn("user transactions data is empty for user ", user.getUsername());
	    return userTransactions;
	}

	return sortByCategoryIdForHtmlTransactionsPage(userTransactions, pFinancialPortfolioId);
    }

    private Map<Integer, List<UserTransaction>> sortByCategoryIdForHtmlTransactionsPage(
	    List<UserTransaction> userTransactions, String pFinancialPortfolioId) {
	Map<Integer, List<UserTransaction>> userTransactionsMap = new HashMap<Integer, List<UserTransaction>>();

	for (UserTransaction userTransaction : userTransactions) {
	    if (!userTransactionsMap.containsKey(userTransaction.getCategoryId())) {
		List<UserTransaction> list = new ArrayList<UserTransaction>();
		list.add(userTransaction);

		userTransactionsMap.put(userTransaction.getCategoryId(), list);
	    } else {
		userTransactionsMap.get(userTransaction.getCategoryId()).add(userTransaction);
	    }
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
    @CacheEvict(key = "#pFinancialPortfolioId")
    public UserTransaction saveUserTransaction(MultiValueMap<String, String> formData, String pFinancialPortfolioId) {

	if (CollectionUtils.isEmpty(formData.get("amount"))) {
	    throw new ResourceNotFoundException("UserTransactions", "formData", formData);
	}

	UserTransaction userTransaction = new UserTransaction();
	userTransaction.setFinancialPortfolioId(pFinancialPortfolioId);
	if (CollectionUtils.isNotEmpty(formData.get("description"))) {
	    userTransaction.setDescription(formData.get("description").get(0));
	}
	userTransaction.setCategoryId(Integer.parseInt(formData.get("categoryOptions").get(0)));
	userTransaction.setAmount(Double.parseDouble(formData.get("amount").get(0)));

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
    @CacheEvict(key = "#financialPortfolioId")
    public void deleteUserTransactions(String transactionalIds, String financialPortfolioId) {
	String[] arrayOfTransactionIds = transactionalIds.split(GenericConstants.COMMA);
	List<String> transactionIdsAsList = Arrays.asList(arrayOfTransactionIds);
	List<Integer> transactionIdsAsIntegerList = transactionIdsAsList.stream().map(s -> Integer.parseInt(s))
		.collect(Collectors.toList());

	userTransactionsRepository.deleteUsersWithIds(transactionIdsAsIntegerList);

    }

    @Override
    @CacheEvict(key = "#financialPortfolioId")
    public UserTransaction updateTransactions(MultiValueMap<String, String> formData, String formFieldName,
	    String financialPortfolioId) {

	Optional<UserTransaction> userTransaction = userTransactionsRepository
		.findById(Integer.parseInt(formData.get("transactionId").get(0)));

	if (ERStringUtils.equalsIgnoreCase(formFieldName, "description")) {
	    userTransaction.get().setDescription(formData.get("description").get(0));
	}

	if (ERStringUtils.equalsIgnoreCase(formFieldName, "transaction")) {
	    userTransaction.get().setAmount(Double.parseDouble(formData.get("amount").get(0)));
	}

	if (ERStringUtils.equalsIgnoreCase(formFieldName, "category")) {
	    userTransaction.get().setCategoryId(Integer.parseInt(formData.get("categoryId").get(0)));
	}

	UserTransaction userTransactionSaved = userTransactionsRepository.save(userTransaction.get());

	return userTransactionSaved;
    }

}
