package in.co.everyrupee.service.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import in.co.everyrupee.constants.user.BankAccountConstants;
import in.co.everyrupee.pojo.user.BankAccount;
import in.co.everyrupee.repository.user.BankAccountRepository;

@Transactional
@Service
@CacheConfig(cacheNames = { BankAccountConstants.BANK_ACCOUNT_CACHE })
public class BankAccountService implements IBankAccountService {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Override
    @Cacheable(key = "{#pFinancialPortfolioId}")
    public List<BankAccount> getAllBankAccounts(Integer financialPortfolioId) {

	return bankAccountRepository.findByFinancialPortfolioId(financialPortfolioId);
    }

}
