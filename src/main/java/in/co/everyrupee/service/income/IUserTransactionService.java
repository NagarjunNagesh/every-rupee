package in.co.everyrupee.service.income;

import java.util.List;
import java.util.Map;

import org.springframework.util.MultiValueMap;

import in.co.everyrupee.pojo.TransactionType;
import in.co.everyrupee.pojo.income.UserTransaction;

public interface IUserTransactionService {

    Object fetchUserTransaction(String financialPortfolioId, String dateMeantFor);

    UserTransaction saveUserTransaction(MultiValueMap<String, String> formData, String financialPortfolioId);

    void deleteUserTransactions(String transactionalIds, String financialPortfolioId, String dateMeantFor);

    UserTransaction updateTransactions(MultiValueMap<String, String> formData, String formFieldName,
	    String financialPortfolioId);

    Map<Integer, Double> fetchCategoryTotalAndUpdateUserBudget(String financialPortfolioId, String dateMeantFor,
	    boolean updateBudget);

    List<UserTransaction> fetchUserTransactionByCreationDate(Integer financialPortfolioId, String dateMeantFor);

    Object fetchLifetimeCalculations(TransactionType type, boolean fetchAverage, Integer pFinancialPortfolioId);

}
