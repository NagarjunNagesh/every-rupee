package in.co.everyrupee.service.income;

import org.springframework.util.MultiValueMap;

import in.co.everyrupee.pojo.income.UserTransaction;

public interface IUserTransactionService {

    Object fetchUserTransaction(String financialPortfolioId);

    UserTransaction saveUserTransaction(MultiValueMap<String, String> formData, String financialPortfolioId);

    void deleteUserTransactions(String transactionalIds, String financialPortfolioId);

    UserTransaction updateTransactions(MultiValueMap<String, String> formData, String formFieldName,
	    String financialPortfolioId);

}
