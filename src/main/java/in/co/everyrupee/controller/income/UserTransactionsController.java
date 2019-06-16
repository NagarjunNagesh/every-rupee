package in.co.everyrupee.controller.income;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.events.income.OnSaveTransactionCompleteEvent;
import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.security.core.userdetails.MyUser;
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
    IUserTransactionService userTransactionService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * Get a Single User Transaction
     * 
     * @param pFinancialPortfolioId
     * @param userPrincipal
     * @return
     */
    @RequestMapping(value = "/{pFinancialPortfolioId}", method = RequestMethod.GET)
    public Object getUserTransactionByUserId(@PathVariable String pFinancialPortfolioId, Principal userPrincipal,
	    @RequestParam(DashboardConstants.Transactions.DATE_MEANT_FOR) String dateMeantFor) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	return userTransactionService.fetchUserTransaction(pFinancialPortfolioId, dateMeantFor);
    }

    /**
     * Saves a UserTransaction
     * 
     * @param pFinancialPortfolioId
     * @param formData
     * @param userPrincipal
     * @return
     */
    @RequestMapping(value = "/save/{pFinancialPortfolioId}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserTransaction save(@PathVariable String pFinancialPortfolioId,
	    @RequestBody MultiValueMap<String, String> formData, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserTransaction userTransactionResponse = userTransactionService.saveUserTransaction(formData,
		pFinancialPortfolioId);

	// Auto Create Budget on saving the transaction
	MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	eventPublisher.publishEvent(new OnSaveTransactionCompleteEvent(user, pFinancialPortfolioId, formData));

	return userTransactionResponse;
    }

    /**
     * Delete a User Transaction
     * 
     * @param pFinancialPortfolioId
     * @param transactionIds
     * @param userPrincipal
     * @return
     */
    @RequestMapping(value = "/{pFinancialPortfolioId}/{transactionIds}", method = RequestMethod.DELETE)
    public GenericResponse deleteUserTransactionById(@PathVariable String pFinancialPortfolioId,
	    @PathVariable String transactionIds, Principal userPrincipal,
	    @RequestParam(DashboardConstants.Transactions.DATE_MEANT_FOR) String dateMeantFor) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	userTransactionService.deleteUserTransactions(transactionIds, pFinancialPortfolioId, dateMeantFor);

	return new GenericResponse("success");
    }

    /**
     * 
     * Update description, transaction & category in user transactions
     * 
     * @param pFinancialPortfolioId
     * @param formFieldName
     * @param formData
     * @param userPrincipal
     * @return
     */
    @RequestMapping(value = "/{pFinancialPortfolioId}/update/{formFieldName}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserTransaction updateDescriptionByUserTransactionById(@PathVariable String pFinancialPortfolioId,
	    @PathVariable String formFieldName, @RequestBody MultiValueMap<String, String> formData,
	    Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserTransaction userTransactionSaved = userTransactionService.updateTransactions(formData, formFieldName,
		pFinancialPortfolioId);

	return userTransactionSaved;
    }

}