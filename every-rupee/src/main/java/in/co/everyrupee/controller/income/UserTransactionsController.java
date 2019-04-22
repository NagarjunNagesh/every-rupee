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

import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;
import in.co.everyrupee.security.core.userdetails.MyUser;
import in.co.everyrupee.service.income.IUserTransactionService;

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

    @Autowired
    IUserTransactionService userTransactionService;

    // Get a Single User Transaction
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public List<UserTransaction> getUserTransactionByUserId() {
	MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	List<UserTransaction> userTransactions = userTransactionsRepository.findByUserId(user.getId());
	if (CollectionUtils.isEmpty(userTransactions)) {
	    throw new ResourceNotFoundException("UserTransactions", "userId", user.getId());
	}
	return userTransactions;
    }

    // Update a UserTransaction
    @RequestMapping(value = "/save", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserTransaction update(@RequestBody MultiValueMap<String, String> formData) {

	UserTransaction userTransactionResponse = userTransactionService.saveUserTransaction(formData);
	return userTransactionResponse;
    }

    // Delete a User Transaction
    @RequestMapping(value = "/{transactionId}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteUserTransactionById(@PathVariable String transactionId) {
	UserTransaction userTransaction = userTransactionsRepository.findById(transactionId)
		.orElseThrow(() -> new ResourceNotFoundException("UserTransactions", "customerId", transactionId));

	userTransactionsRepository.delete(userTransaction);

	return ResponseEntity.ok().build();
    }

}