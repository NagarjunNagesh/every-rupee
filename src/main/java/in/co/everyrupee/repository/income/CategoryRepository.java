package in.co.everyrupee.repository.income;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import in.co.everyrupee.pojo.income.Category;
import in.co.everyrupee.pojo.income.UserTransaction;

/**
 * Reference category repository
 * 
 * @author Nagarjun
 *
 */
@Repository
public interface CategoryRepository extends JpaRepository<UserTransaction, Integer> {
    List<UserTransaction> findByCategoryId(Integer userId);

    @Query("select c from Category c")
    List<Category> fetchAllCategories();

}
