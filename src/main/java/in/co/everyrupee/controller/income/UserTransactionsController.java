package in.co.everyrupee.controller.income;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;
import in.co.everyrupee.service.income.IUserTransactionService;
import in.co.everyrupee.utils.GenericResponse;

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
    public Object getUserTransactionByUserId(@PathVariable String financialPortfolioId, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	return userTransactionService.fetchUserTransaction(financialPortfolioId);
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
    @RequestMapping(value = "/{financialPortfolioId}/{transactionIds}", method = RequestMethod.DELETE)
    public GenericResponse deleteUserTransactionById(@PathVariable String financialPortfolioId,
	    @PathVariable String transactionIds, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	userTransactionService.deleteUserTransactions(transactionIds, financialPortfolioId);

	return new GenericResponse("success");
    }

    // Update description, transaction & category in user transactions
    @RequestMapping(value = "/{financialPortfolioId}/update/{formFieldName}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserTransaction updateDescriptionByUserTransactionById(@PathVariable String financialPortfolioId,
	    @PathVariable String formFieldName, @RequestBody MultiValueMap<String, String> formData,
	    Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserTransaction userTransactionSaved = userTransactionService.updateTransactions(formData, formFieldName,
		financialPortfolioId);

	return userTransactionSaved;
    }

}