/**
 * 
 */
package in.co.everyrupee.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.co.everyrupee.pojo.FinancialPortfolio;

/**
 * @author nagarjun
 *
 */
@Repository
public interface FinancialPortfolioRepository extends JpaRepository<FinancialPortfolio, String> {

}
