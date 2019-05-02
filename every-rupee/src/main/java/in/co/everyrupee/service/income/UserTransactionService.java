package in.co.everyrupee.service.income;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;
import in.co.everyrupee.security.core.userdetails.MyUser;

@Transactional
@Service
public class UserTransactionService implements IUserTransactionService {

    // TODO enable transactional commit of user transactions with changes to
    // configuration
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
    public List<UserTransaction> fetchUserTransaction(String pFinancialPortfolioId) {

	MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	List<UserTransaction> userTransactions = userTransactionsRepository
		.findByFinancialPortfolioId(pFinancialPortfolioId);

	if (CollectionUtils.isEmpty(userTransactions)) {
	    logger.warn("user transactions data is empty for user ", user.getUsername());
	}
	return userTransactions;
    }

    /**
     * Save User Transaction to the database
     * 
     * @param formData
     * @return
     */
    @Override
    public UserTransaction saveUserTransaction(MultiValueMap<String, String> formData, String pFinancialPortfolioId) {

	if (CollectionUtils.isEmpty(formData.get("amount")) || CollectionUtils.isEmpty(formData.get("description"))) {
	    throw new ResourceNotFoundException("UserTransactions", "formData", formData);
	}

	UserTransaction userTransaction = new UserTransaction();
	userTransaction.setFinancialPortfolioId(pFinancialPortfolioId);
	userTransaction.setDescription(formData.get("description").get(0));
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
    public void deleteUserTransactions(String transactionalIds) {
	String[] arrayOfTransactionIds = transactionalIds.split(GenericConstants.COMMA);
	List<String> transactionIdsAsList = Arrays.asList(arrayOfTransactionIds);
	List<Integer> transactionIdsAsIntegerList = transactionIdsAsList.stream().map(s -> Integer.parseInt(s))
		.collect(Collectors.toList());

	userTransactionsRepository.deleteUsersWithIds(transactionIdsAsIntegerList);

    }

    @Override
    public void updateCategoriesForTransactions(MultiValueMap<String, String> formData) {

	Optional<UserTransaction> userTransaction = userTransactionsRepository
		.findById(Integer.parseInt(formData.get("transactionId").get(0)));
	userTransaction.get().setCategoryId(Integer.parseInt(formData.get("categoryId").get(0)));
	userTransactionsRepository.save(userTransaction.get());

    }

}
