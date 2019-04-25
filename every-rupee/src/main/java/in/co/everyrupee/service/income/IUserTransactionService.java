package in.co.everyrupee.service.income;

import java.util.List;

import org.springframework.util.MultiValueMap;

import in.co.everyrupee.pojo.income.UserTransaction;

public interface IUserTransactionService {

    List<UserTransaction> fetchUserTransaction();

    UserTransaction saveUserTransaction(MultiValueMap<String, String> formData);

    void deleteUserTransactions(String transactionalIds);
}
