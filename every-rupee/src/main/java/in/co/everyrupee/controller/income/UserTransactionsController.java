package in.co.everyrupee.controller.income;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
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
    @RequestMapping(value = "/{financialPortfolioId}", method = RequestMethod.GET)
    public Object getUserTransactionByUserId(@PathVariable String financialPortfolioId, Principal userPrincipal,
	    @RequestParam(required = false) String format, @RequestParam(required = false) String page) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	return userTransactionService.fetchUserTransaction(financialPortfolioId, format, page);
    }

    // Update a UserTransaction
    @RequestMapping(value = "/save/{financialPortfolioId}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserTransaction update(@PathVariable String financialPortfolioId,
	    @RequestBody MultiValueMap<String, String> formData, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserTransaction userTransactionResponse = userTransactionService.saveUserTransaction(formData,
		financialPortfolioId);
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

    // Update description, transaction & category in user transactions
    @RequestMapping(value = "/update/{formFieldName}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserTransaction updateDescriptionByUserTransactionById(@PathVariable String formFieldName,
	    @RequestBody MultiValueMap<String, String> formData, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserTransaction userTransactionSaved = userTransactionService.updateTransactions(formData, formFieldName);

	return userTransactionSaved;
    }

}