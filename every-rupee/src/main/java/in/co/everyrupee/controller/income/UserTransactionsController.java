/**
 * 
 */
package in.co.everyrupee.controller.income;

import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;
import in.co.everyrupee.security.core.userdetails.MyUser;

/**
 * Manage API User Transactions
 * 
 * @author Nagarjun Nagesh
 *
 */
@RestController
@RequestMapping("/api/transactions")
public class UserTransactionsController {

    @Autowired
    UserTransactionsRepository userTransactionsRepository;

    // Get a Single User Transaction
    @RequestMapping(value = "/{customerId}", method = RequestMethod.GET)
    public List<UserTransaction> getUserTransactionByUserId(@PathVariable String customerId) {
	Integer userId = Integer.parseInt(customerId);
	List<UserTransaction> userTransactions = userTransactionsRepository.findByUserId(userId);
	if (CollectionUtils.isEmpty(userTransactions)) {
	    throw new ResourceNotFoundException("FinancialPortfolio", "customerId", customerId);
	}
	return userTransactions;
    }

    // Update a UserTransaction
    @RequestMapping(value = "/save", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserTransaction update(@RequestBody MultiValueMap<String, String> formData) {

	if (CollectionUtils.isEmpty(formData.get("amount")) || CollectionUtils.isEmpty(formData.get("description"))) {
	    throw new ResourceNotFoundException("FinancialPortfolio", "formData", formData);
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

    // Delete a User Transaction
    @RequestMapping(value = "/{transactionId}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteUserTransactionById(@PathVariable String transactionId) {
	UserTransaction userTransaction = userTransactionsRepository.findById(transactionId)
		.orElseThrow(() -> new ResourceNotFoundException("FinancialPortfolio", "customerId", transactionId));

	userTransactionsRepository.delete(userTransaction);

	return ResponseEntity.ok().build();
    }

}