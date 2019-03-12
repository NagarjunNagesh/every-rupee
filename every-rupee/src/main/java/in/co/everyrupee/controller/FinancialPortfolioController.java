/**
 * 
 */
package in.co.everyrupee.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.FinancialPortfolio;
import in.co.everyrupee.repository.FinancialPortfoliioRepository;

/**
 * @author nagarjun
 *
 */
@RestController
@RequestMapping("/api")
public class FinancialPortfolioController {
	
	@Autowired
	FinancialPortfoliioRepository financialPortfoliioRepository;
	
	// Get All Financial Portfolio
	@GetMapping("/financial_portfolio")
	public List<FinancialPortfolio> getAllFinancialPortfolio() {
	    return financialPortfoliioRepository.findAll();
	}
	
	// Create a Financial Portfolio
	@PostMapping("/financial_portfolio")
	public FinancialPortfolio createFinancialPortfolio(@Valid @RequestBody FinancialPortfolio financialPortfolio) {
	    return financialPortfoliioRepository.save(financialPortfolio);
	}
	
	// Get a Single Financial Portfolio
	@RequestMapping(method = RequestMethod.GET, value="/financial_portfolio/{customerId}")
	public FinancialPortfolio getFinancialPortfolioById(@PathVariable(value = "customerId") String customerId) {
	    return financialPortfoliioRepository.findById(customerId)
	            .orElseThrow(() -> new ResourceNotFoundException("FinancialPortfolio", "customerId", customerId));
	}
	
	// Update a FinancialPortfolio
	@RequestMapping(path="/financial_portfolio/{customerId}")
	@PutMapping("/financial_portfolio/{customerId}")
	public FinancialPortfolio updateFinancialPortfolio(@PathVariable(value = "customerId") String customerId,
	                                        @Valid @RequestBody FinancialPortfolio financialPortfolioDetails) {

		FinancialPortfolio financialPortfolio = financialPortfoliioRepository.findById(customerId)
	            .orElseThrow(() -> new ResourceNotFoundException("FinancialPortfolio", "customerId", customerId));

		financialPortfolio.setCashAvailable(financialPortfolioDetails.getCashAvailable());
		financialPortfolio.setCreditcardBalance(financialPortfolioDetails.getCreditcardBalance());

		FinancialPortfolio updatedFinancialPortfolio = financialPortfoliioRepository.save(financialPortfolio);
	    return updatedFinancialPortfolio;
	}
	
	// Delete a FinancialPortfolio
	@RequestMapping(path="/financial_portfolio/{customerId}")
	@DeleteMapping("/financial_portfolio/{customerId}")
	public ResponseEntity<?> deleteFinancialPortfolio(@PathVariable(value = "customerId") String customerId) {
		FinancialPortfolio financialPortfolio = financialPortfoliioRepository.findById(customerId)
	            .orElseThrow(() -> new ResourceNotFoundException("FinancialPortfolio", "customerId", customerId));

	    financialPortfoliioRepository.delete(financialPortfolio);

	    return ResponseEntity.ok().build();
	}






}
