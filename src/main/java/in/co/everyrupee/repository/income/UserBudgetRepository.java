package in.co.everyrupee.repository.income;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import in.co.everyrupee.pojo.income.UserBudget;

/**
 * 
 * Repository to handle the budget for the user
 * 
 * @author Nagarjun
 *
 */
@Repository
public interface UserBudgetRepository extends JpaRepository<UserBudget, Integer> {
	List<UserBudget> findByFinancialPortfolioId(String financialPortfolioId);
	
	/**
     * Delete all user with ids specified in {@code ids} parameter
     * 
     * @param ids List of user ids
     */
    @Query("select from UserBudget u where u.categoryId in ?1 and u.financialPortfolioId in ?2")
    List<UserBudget> fetchUserBudgetWithIds(List<Integer> categoryIds, String financialPortfolioId);
    
    /**
     * Delete all user with ids specified in {@code ids} parameter
     * 
     * @param ids List of user ids
     */
    @Modifying
    @Query("delete from UserBudget u where u.categoryId in ?1 and u.financialPortfolioId in ?2")
    void deleteUserBudgetWithIds(List<Integer> categoryIds, String financialPortfolioId);
}
