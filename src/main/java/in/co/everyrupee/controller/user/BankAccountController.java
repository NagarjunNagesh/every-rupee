package in.co.everyrupee.controller.user;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
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

    // Get All User Budgets
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public List<BankAccount> getAllBankAccounts(Principal userPrincipal) {
	Integer financialPortfolioId = profileService.validateUser(userPrincipal);
	return bankAccountService.getAllBankAccounts(financialPortfolioId);
    }
}
