/**
 * 
 */
package in.co.everyrupee.repository.income;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import in.co.everyrupee.pojo.income.UserTransaction;

/**
 * Reference user transactions
 * 
 * @author Nagarjun
 *
 */
@Repository
public interface UserTransactionsRepository extends JpaRepository<UserTransaction, Integer> {
    List<UserTransaction> findByFinancialPortfolioId(String financialPortfolioId);

    /**
     * Delete all user with ids specified in {@code ids} parameter
     * 
     * @param ids List of user ids
     */
    @Modifying
    @Query("delete from UserTransaction u where u.id in ?1")
    void deleteUsersWithIds(List<Integer> ids);
}
