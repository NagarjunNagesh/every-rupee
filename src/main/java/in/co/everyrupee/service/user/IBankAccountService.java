package in.co.everyrupee.service.user;

import java.util.List;
import java.util.Map;
import java.util.Set;

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

    /**
     * Select Account
     * 
     * @param pFinancialPortfolioId
     * @param formData
     * @return
     */
    public void selectAccount(Integer pFinancialPortfolioId, MultiValueMap<String, String> formData);

    /**
     * Categorize Bank Account
     * 
     * @param pFinancialPortfolioId
     * @return
     */
    public Map<String, Set<BankAccount>> categorizeBankAccount(Integer pFinancialPortfolioId);
}
