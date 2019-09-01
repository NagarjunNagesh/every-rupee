package in.co.everyrupee.service.user;

import java.util.List;

import in.co.everyrupee.pojo.user.BankAccount;

public interface IBankAccountService {
    public List<BankAccount> getAllBankAccounts(Integer financialPortfolioId);
}
