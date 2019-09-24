package in.co.everyrupee.controller.user;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.pojo.user.BankAccount;
import in.co.everyrupee.service.login.ProfileService;
import in.co.everyrupee.service.user.IBankAccountService;

/**
 *
 * Manage Bank Account with API
 * 
 * @author Nagarjun
 * 
 **/
@RestController
@RequestMapping("/api/bankaccount")
@Validated
public class BankAccountController {

    @Autowired
    private IBankAccountService bankAccountService;

    @Autowired
    private ProfileService profileService;

    /**
     * Get All Bank Accounts
     * 
     * @param userPrincipal
     * @return
     */
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public List<BankAccount> getAllBankAccounts(Principal userPrincipal) {
	Integer financialPortfolioId = profileService.validateUser(userPrincipal);
	return getBankAccountService().getAllBankAccounts(financialPortfolioId);
    }

    /**
     * Post Add New account
     * 
     * @param userPrincipal
     * @param formData
     * @return
     */
    @RequestMapping(value = "/add", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public BankAccount addNewBankAccount(Principal userPrincipal, @RequestBody MultiValueMap<String, String> formData) {
	Integer pFinancialPortfolioId = getProfileService().validateUser(userPrincipal);
	return getBankAccountService().addNewBankAccount(pFinancialPortfolioId, formData);
    }

    /**
     * Get All User Budgets
     * 
     * @param userPrincipal
     * @return
     */
    @RequestMapping(value = "/preview", method = RequestMethod.GET)
    public List<BankAccount> previewBankAccounts(Principal userPrincipal) {
	Integer financialPortfolioId = profileService.validateUser(userPrincipal);
	return getBankAccountService().previewBankAccounts(financialPortfolioId);
    }

    public ProfileService getProfileService() {
	return profileService;
    }

    public IBankAccountService getBankAccountService() {
	return bankAccountService;
    }

}
