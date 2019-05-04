package in.co.everyrupee.service.income;

import java.util.List;

import org.springframework.util.MultiValueMap;

import in.co.everyrupee.pojo.income.UserTransaction;

public interface IUserTransactionService {

    List<UserTransaction> fetchUserTransaction(String financialPortfolioId);

    UserTransaction saveUserTransaction(MultiValueMap<String, String> formData, String financialPortfolioId);

    void deleteUserTransactions(String transactionalIds);

    void updateCategoriesForTransactions(MultiValueMap<String, String> formData);

    void updateTransactions(MultiValueMap<String, String> formData, String formFieldName);
}
