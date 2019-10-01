package in.co.everyrupee.service.user;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
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

    @Override
    public List<BankAccount> previewBankAccounts(Integer financialPortfolioId) {
	List<BankAccount> linkedBA = getAllBankAccounts(financialPortfolioId);
	List<BankAccount> selectedBA = new ArrayList<BankAccount>();

	// Fetch the first selected account
	for (BankAccount bankAccount : linkedBA) {
	    if (bankAccount.isSelectedAccount()) {
		selectedBA.add(bankAccount);
		break;
	    }
	}

	// Sort the list of bank accounts by number of times selected
	linkedBA.sort(Comparator.comparing(BankAccount::getNumberOfTimesSelected).reversed());

	int count = 0;
	for (BankAccount bankAccount : linkedBA) {
	    // Fetches the first four accounts for preview
	    if (count >= 3) {
		break;
	    }

	    // If there is none selected then set the first one as selected
	    if (CollectionUtils.isEmpty(selectedBA)) {
		bankAccount.setSelectedAccount(true);
		// Saves the bank account as selected and stores the result in the selectedBA
		selectedBA.add(bankAccountRepository.save(bankAccount));
		continue;
	    } else if (selectedBA.get(0).getId() == bankAccount.getId()) {
		// If the bank account is already present in the object (selectedBA)
		continue;
	    }

	    selectedBA.add(bankAccount);
	    count++;
	}

	return selectedBA;
    }

    @Override
    public void selectAccount(Integer pFinancialPortfolioId, MultiValueMap<String, String> formData) {
	String bankAccountId = formData.getFirst(BankAccountConstants.BANK_ACCOUNT_ID);
	String selectedAccount = formData.getFirst(BankAccountConstants.SELECTED_ACCOUNT_PARAM);

	List<BankAccount> bankAccountList = bankAccountRepository.findAll();

	// Convert bank account to selected
	for (BankAccount bankAccount : bankAccountList) {
	    if (bankAccount.getId() == Integer.parseInt(bankAccountId)) {
		bankAccount.setSelectedAccount(Boolean.parseBoolean(selectedAccount));
		bankAccount.setNumberOfTimesSelected(bankAccount.getNumberOfTimesSelected() + 1);
		bankAccountRepository.save(bankAccount);
	    } else if (bankAccount.isSelectedAccount()) {
		bankAccount.setSelectedAccount(false);
		bankAccountRepository.save(bankAccount);
	    }
	}
    }

}
