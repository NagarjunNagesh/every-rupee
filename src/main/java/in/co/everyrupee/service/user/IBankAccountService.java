package in.co.everyrupee.service.user;

import java.util.List;

import org.springframework.util.MultiValueMap;

import in.co.everyrupee.pojo.user.BankAccount;

public interface IBankAccountService {
    public List<BankAccount> getAllBankAccounts(Integer financialPortfolioId);

    public BankAccount addNewBankAccount(Integer financialPortfolioId, MultiValueMap<String, String> formData);
}
