package in.co.everyrupee.service.income;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;
import in.co.everyrupee.security.core.userdetails.MyUser;

@Service
public class UserTransactionService implements IUserTransactionService {

    // TODO enable transactional commit of user transactions
    @Autowired
    UserTransactionsRepository userTransactionsRepository;

    /**
     * @param formData
     * @param user
     * @return
     */
    @Override
    public UserTransaction saveUserTransaction(MultiValueMap<String, String> formData) {

	if (CollectionUtils.isEmpty(formData.get("amount")) || CollectionUtils.isEmpty(formData.get("description"))) {
	    throw new ResourceNotFoundException("UserTransactions", "formData", formData);
	}

	MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	UserTransaction userTransaction = new UserTransaction();
	Integer amount = Integer.parseInt(formData.get("amount").get(0));
	userTransaction.setUserId(user.getId());
	userTransaction.setDescription(formData.get("description").get(0));
	userTransaction
		.setCategory(CollectionUtils.isNotEmpty(formData.get("category")) ? formData.get("category").get(0)
			: GenericConstants.EMPTY_CHARACTER);
	userTransaction.setAmount(amount);

	UserTransaction userTransactionResponse = userTransactionsRepository.save(userTransaction);
	return userTransactionResponse;
    }

}
