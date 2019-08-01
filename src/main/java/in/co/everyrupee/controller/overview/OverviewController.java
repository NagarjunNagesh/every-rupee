package in.co.everyrupee.controller.overview;

import java.security.Principal;

import javax.validation.constraints.Size;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.service.income.IUserTransactionService;
import in.co.everyrupee.service.login.ProfileService;

/**
 *
 * Manage Overview page in Dashboard
 * 
 * @author Nagarjun
 * 
 **/
@RestController
@RequestMapping("/api/overview")
@Validated
public class OverviewController {

    @Autowired
    private IUserTransactionService userTransactionService;

    @Autowired
    private ProfileService profileService;

    /**
     * Get user transactions sorted by creation date - DESC
     * 
     * @param pFinancialPortfolioId
     * @param userPrincipal
     * @return
     */
    @RequestMapping(value = "/recentTransactions", method = RequestMethod.GET)
    public Object getUserTransactionByFinancialPortfolioId(Principal userPrincipal,
	    @RequestParam(DashboardConstants.Transactions.DATE_MEANT_FOR) @Size(min = 0, max = 10) String dateMeantFor) {

	Integer pFinancialPortfolioId = getProfileService().validateUser(userPrincipal);

	return getUserTransactionService().fetchUserTransactionByCreationDate(pFinancialPortfolioId, dateMeantFor);
    }

    private ProfileService getProfileService() {
	return profileService;
    }

    private IUserTransactionService getUserTransactionService() {
	return userTransactionService;
    }

}
