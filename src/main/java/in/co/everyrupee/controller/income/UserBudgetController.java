package in.co.everyrupee.controller.income;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.pojo.income.UserBudget;
import in.co.everyrupee.service.income.IUserBudgetService;
import in.co.everyrupee.utils.GenericResponse;

/**
 *
 *  Manage Budget For Users
 *  
 *  @author Nagarjun
 * 
 **/
@RestController
@RequestMapping("/api/budget")
public class UserBudgetController {
	
	@Autowired
    IUserBudgetService userBudgetService;

	// Get All User Budgets
    @RequestMapping(value = "/{financialPortfolioId}", method = RequestMethod.GET)
    public Object getUserBudgetByUserId(@PathVariable String financialPortfolioId, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	return userBudgetService.fetchAllUserBudget(financialPortfolioId);
    }

    // Save User Budgets
    @RequestMapping(value = "/save/{financialPortfolioId}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserBudget update(@PathVariable String financialPortfolioId,
	    @RequestBody MultiValueMap<String, String> formData, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserBudget userBudgetResponse = userBudgetService.saveUserBudget(formData,
		financialPortfolioId);
	return userBudgetResponse;
    }

    // Delete User Budgets
    @RequestMapping(value = "/{financialPortfolioId}/{categoryIds}", method = RequestMethod.DELETE)
    public GenericResponse deleteUserBudgetById(@PathVariable String financialPortfolioId,
	    @PathVariable String categoryIds, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	userBudgetService.deleteUserBudgets(categoryIds, financialPortfolioId);

	return new GenericResponse("success");
    }

    // Update budget in user budget
    @RequestMapping(value = "/{financialPortfolioId}/update/{formFieldName}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserBudget updateDescriptionByUserBudgetById(@PathVariable String financialPortfolioId,
	    @PathVariable String formFieldName, @RequestBody MultiValueMap<String, String> formData,
	    Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserBudget userBudgetSaved = userBudgetService.updateBudget(formData, formFieldName,
		financialPortfolioId);

	return userBudgetSaved;
    }

}
