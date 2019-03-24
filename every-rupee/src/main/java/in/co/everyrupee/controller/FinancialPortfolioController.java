/**
 * 
 */
package in.co.everyrupee.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.FinancialPortfolio;
import in.co.everyrupee.repository.FinancialPortfolioRepository;

/**
 * Manage API financial portfolio
 * 
 * @author Nagarjun Nagesh
 *
 */
@RestController
@RequestMapping("/api")
public class FinancialPortfolioController {
	
	@Autowired
	FinancialPortfolioRepository financialPortfolioRepository;
	
	// Get All Financial Portfolio
	@RequestMapping(value = "/financial_portfolio", method = RequestMethod.GET)
	public List<FinancialPortfolio> getAllFinancialPortfolio() {
	    return financialPortfolioRepository.findAll();
	}
	
	// Create a Financial Portfolio
	@RequestMapping(value = "/financial_portfolio", method = RequestMethod.PUT)
	public FinancialPortfolio createFinancialPortfolio(@Valid @RequestBody FinancialPortfolio financialPortfolio) {
	    return financialPortfolioRepository.save(financialPortfolio);
	}
	
	// Get a Single Financial Portfolio
	@RequestMapping(value = "/financial_portfolio/{customerId}", method = RequestMethod.GET)
	public FinancialPortfolio getFinancialPortfolioById(@PathVariable String customerId) {
	    return financialPortfolioRepository.findById(customerId)
	            .orElseThrow(() -> new ResourceNotFoundException("FinancialPortfolio", "customerId", customerId));
	}
	
	// Update a FinancialPortfolio
	@RequestMapping(value = "/financial_portfolio/{customerId}", method = RequestMethod.PUT)
	public FinancialPortfolio updateFinancialPortfolio(@PathVariable String customerId,
	                                        @Valid @RequestBody FinancialPortfolio financialPortfolioDetails) {

		FinancialPortfolio financialPortfolio = financialPortfolioRepository.findById(customerId)
	            .orElseThrow(() -> new ResourceNotFoundException("FinancialPortfolio", "customerId", customerId));

		financialPortfolio.setCashAvailable(financialPortfolioDetails.getCashAvailable());
		financialPortfolio.setCreditcardBalance(financialPortfolioDetails.getCreditcardBalance());

		FinancialPortfolio updatedFinancialPortfolio = financialPortfolioRepository.save(financialPortfolio);
	    return updatedFinancialPortfolio;
	}
	
	// Delete a FinancialPortfolio
	@RequestMapping(value = "/financial_portfolio/{customerId}", method = RequestMethod.DELETE)
	public ResponseEntity<?> deleteFinancialPortfolio(@PathVariable String customerId) {
		FinancialPortfolio financialPortfolio = financialPortfolioRepository.findById(customerId)
	            .orElseThrow(() -> new ResourceNotFoundException("FinancialPortfolio", "customerId", customerId));

	    financialPortfolioRepository.delete(financialPortfolio);

	    return ResponseEntity.ok().build();
	}

}