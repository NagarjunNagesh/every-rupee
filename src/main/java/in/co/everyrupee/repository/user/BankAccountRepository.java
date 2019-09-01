package in.co.everyrupee.repository.user;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.co.everyrupee.pojo.user.BankAccount;

/**
 * 
 * Repository to handle the Bank Account for the user
 * 
 * @author Nagarjun
 *
 */
@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Integer> {

    /**
     * Fetch all bank account by financial Portfolio id
     * 
     * @param financialPortfolioId
     * @return
     */
    List<BankAccount> findByFinancialPortfolioId(Integer financialPortfolioId);

}
