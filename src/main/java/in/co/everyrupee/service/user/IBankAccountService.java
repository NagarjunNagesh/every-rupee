package in.co.everyrupee.service.user;

import java.util.List;

import org.springframework.util.MultiValueMap;

import in.co.everyrupee.pojo.user.BankAccount;

public interface IBankAccountService {
    /**
     * Fetch all bank accounts
     * 
     * @param financialPortfolioId
     * @return
     */
    public List<BankAccount> getAllBankAccounts(Integer financialPortfolioId);

    /**
     * Add a new bank account
     * 
     * @param financialPortfolioId
     * @param formData
     * @return
     */
    public BankAccount addNewBankAccount(Integer financialPortfolioId, MultiValueMap<String, String> formData);

    /**
     * Preview bank accounts (first three + default)
     * 
     * @param financialPortfolioId
     * @return
     */
    public List<BankAccount> previewBankAccounts(Integer financialPortfolioId);
}
