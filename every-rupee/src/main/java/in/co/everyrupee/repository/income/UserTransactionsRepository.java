/**
 * 
 */
package in.co.everyrupee.repository.income;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.co.everyrupee.pojo.income.UserTransaction;

/**
 * Reference user transactions
 * 
 * @author Nagarjun
 *
 */
@Repository
public interface UserTransactionsRepository extends JpaRepository<UserTransaction, String> {
    List<UserTransaction> findByUserId(Integer userId);
}
