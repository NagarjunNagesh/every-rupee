package in.co.everyrupee.controller.income;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.pojo.income.UserBudget;
import in.co.everyrupee.service.income.IUserBudgetService;
import in.co.everyrupee.utils.GenericResponse;

/**
 *
 * Manage Budget For Users
 * 
 * @author Nagarjun
 * 
 **/
@RestController
@RequestMapping("/api/budget")
public class UserBudgetController {

    @Autowired
    IUserBudgetService userBudgetService;

    // Get All User Budgets
    @RequestMapping(value = "/{financialPortfolioId}", method = RequestMethod.GET)
    public List<UserBudget> getUserBudgetByUserId(@PathVariable String financialPortfolioId, Principal userPrincipal,
	    @RequestParam(DashboardConstants.Budget.DATE_MEANT_FOR) String dateMeantFor) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	return userBudgetService.fetchAllUserBudget(financialPortfolioId, dateMeantFor);
    }

    // Save User Budgets
    @RequestMapping(value = "/save/{financialPortfolioId}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserBudget update(@PathVariable String financialPortfolioId,
	    @RequestBody MultiValueMap<String, String> formData, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserBudget userBudgetResponse = userBudgetService.saveUserBudget(formData, financialPortfolioId, true);
	return userBudgetResponse;
    }

    // Delete User Budgets
    @RequestMapping(value = "/{financialPortfolioId}/{categoryIds}", method = RequestMethod.DELETE)
    public GenericResponse deleteUserBudgetById(@PathVariable String financialPortfolioId,
	    @PathVariable String categoryIds, Principal userPrincipal,
	    @RequestParam(DashboardConstants.Budget.DATE_MEANT_FOR) String dateMeantFor) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	userBudgetService.deleteUserBudgets(categoryIds, financialPortfolioId, dateMeantFor);

	return new GenericResponse("success");
    }

    // Delete All User Budgets
    @RequestMapping(value = "/{financialPortfolioId}", method = RequestMethod.DELETE)
    public GenericResponse deleteAllUserBudgetById(@PathVariable String financialPortfolioId,
	    @PathVariable String categoryIds, Principal userPrincipal,
	    @RequestParam(DashboardConstants.Budget.DATE_MEANT_FOR) String dateMeantFor,
	    @RequestParam(DashboardConstants.Budget.AUTO_GENERATED_BUDGET_PARAM) boolean autoGenerated) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	userBudgetService.deleteAllUserBudgets(financialPortfolioId, dateMeantFor, autoGenerated);

	return new GenericResponse("success");
    }

    // Update budget in user budget
    @RequestMapping(value = "/{financialPortfolioId}/update/{formFieldName}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public List<UserBudget> updateUserBudgetById(@PathVariable String financialPortfolioId,
	    @PathVariable String formFieldName, @RequestBody MultiValueMap<String, String> formData,
	    Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	List<UserBudget> userBudgetSaved = userBudgetService.updateBudget(formData, formFieldName,
		financialPortfolioId);

	return userBudgetSaved;
    }

}
