package in.co.everyrupee.service.income;

import org.springframework.util.MultiValueMap;

import in.co.everyrupee.pojo.income.UserTransaction;

public interface IUserTransactionService {

    UserTransaction saveUserTransaction(MultiValueMap<String, String> formData);

    void deleteUserTransactions(String transactionalIds);
}
