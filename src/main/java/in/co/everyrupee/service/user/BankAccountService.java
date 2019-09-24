package in.co.everyrupee.service.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.user.BankAccountConstants;
import in.co.everyrupee.exception.InvalidAttributeValueException;
import in.co.everyrupee.pojo.user.AccountType;
import in.co.everyrupee.pojo.user.BankAccount;
import in.co.everyrupee.repository.user.BankAccountRepository;
import in.co.everyrupee.service.login.ProfileService;
import in.co.everyrupee.utils.ERStringUtils;

@Transactional
@Service
@CacheConfig(cacheNames = { BankAccountConstants.BANK_ACCOUNT_CACHE })
public class BankAccountService implements IBankAccountService {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private ProfileService profileService;

    @Override
    @Cacheable(key = "#pFinancialPortfolioId")
    public List<BankAccount> getAllBankAccounts(Integer pFinancialPortfolioId) {

	return bankAccountRepository.findByFinancialPortfolioId(pFinancialPortfolioId);
    }

    @Override
    @CacheEvict(key = "#pFinancialPortfolioId")
    public BankAccount addNewBankAccount(Integer pFinancialPortfolioId, MultiValueMap<String, String> formData) {

	if (ERStringUtils.isBlank(formData.getFirst(BankAccountConstants.LINKED_ACCOUNT))) {
	    throw new InvalidAttributeValueException("addNewBankAccount", BankAccountConstants.LINKED_ACCOUNT, null);
	}

	User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

	BankAccount newAccount = new BankAccount();
	newAccount.setLinked(Boolean.parseBoolean(formData.getFirst(BankAccountConstants.LINKED_ACCOUNT_PARAM)));
	newAccount.setFinancialPortfolioId(pFinancialPortfolioId);
	newAccount.setUserId(profileService.findUserByEmail(user.getUsername()).get().getId());
	newAccount.setBankAccountName(formData.getFirst(BankAccountConstants.BANK_ACCOUNT_NAME_PARAM));
	newAccount.setAccountBalance(Double.parseDouble(formData.getFirst(BankAccountConstants.ACCOUNT_BALANCE_PARAM)));
	// Replace all space in the text to without space
	newAccount.setAccountType(
		AccountType.valueOf(formData.getFirst(BankAccountConstants.ACCOUNT_TYPE_PARAM).replaceAll("\\s+", "")));
	return bankAccountRepository.save(newAccount);
    }

}
