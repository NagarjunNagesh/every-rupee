package in.co.everyrupee.controller.income;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;
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
    public List<UserTransaction> getUserTransactionByUserId(Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	return userTransactionService.fetchUserTransaction();
    }

    // Update a UserTransaction
    @RequestMapping(value = "/save", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserTransaction update(@RequestBody MultiValueMap<String, String> formData, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserTransaction userTransactionResponse = userTransactionService.saveUserTransaction(formData);
	return userTransactionResponse;
    }

    // Delete a User Transaction
    @RequestMapping(value = "/{transactionIds}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteUserTransactionById(@PathVariable String transactionIds, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	userTransactionService.deleteUserTransactions(transactionIds);

	return ResponseEntity.ok().build();
    }
}