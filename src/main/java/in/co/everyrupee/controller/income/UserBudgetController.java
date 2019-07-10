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
    private IUserBudgetService userBudgetService;

    // Get All User Budgets
    @RequestMapping(value = "/{financialPortfolioId}", method = RequestMethod.GET)
    public List<UserBudget> getUserBudgetByFinancialPortfolioId(@PathVariable String financialPortfolioId,
	    Principal userPrincipal, @RequestParam(DashboardConstants.Budget.DATE_MEANT_FOR) String dateMeantFor) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	return getUserBudgetService().fetchAllUserBudget(financialPortfolioId, dateMeantFor);
    }

    // Save User Budgets
    @RequestMapping(value = "/save/{financialPortfolioId}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public UserBudget update(@PathVariable String financialPortfolioId,
	    @RequestBody MultiValueMap<String, String> formData, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	UserBudget userBudgetResponse = getUserBudgetService().saveAutoGeneratedUserBudget(formData,
		financialPortfolioId, true);
	return userBudgetResponse;
    }

    // Delete User Budgets
    @RequestMapping(value = "/{financialPortfolioId}/{categoryIds}", method = RequestMethod.DELETE)
    public GenericResponse deleteAutoGeneratedUserBudgetById(@PathVariable String financialPortfolioId,
	    @PathVariable String categoryIds, Principal userPrincipal,
	    @RequestParam(DashboardConstants.Budget.DATE_MEANT_FOR) String dateMeantFor,
	    @RequestParam(DashboardConstants.Budget.DELETE_ONLY_AUTO_GENERATED_BUDGET_PARAM) Boolean deleteOnlyAutoGenerated) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	if (deleteOnlyAutoGenerated) {
	    getUserBudgetService().deleteAutoGeneratedUserBudgets(categoryIds, financialPortfolioId, dateMeantFor);
	} else {
	    getUserBudgetService().deleteUserBudgets(categoryIds, financialPortfolioId, dateMeantFor);
	}

	return new GenericResponse("success");
    }

    // Delete All User Budgets
    @RequestMapping(value = "/{financialPortfolioId}", method = RequestMethod.DELETE)
    public GenericResponse deleteAllUserBudgetById(@PathVariable String financialPortfolioId, Principal userPrincipal,
	    @RequestParam(DashboardConstants.Budget.DATE_MEANT_FOR) String dateMeantFor,
	    @RequestParam(DashboardConstants.Budget.AUTO_GENERATED_BUDGET_PARAM) Boolean autoGenerated) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	getUserBudgetService().deleteAllUserBudgets(financialPortfolioId, dateMeantFor, autoGenerated);

	return new GenericResponse("success");
    }

    // Update budget in user budget
    @RequestMapping(value = "/{financialPortfolioId}/update/{formFieldName}/{dateMeantFor}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public List<UserBudget> updateAutoGeneratedUserBudgetById(@PathVariable String financialPortfolioId,
	    @PathVariable String formFieldName, @PathVariable String dateMeantFor,
	    @RequestBody MultiValueMap<String, String> formData, Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	List<UserBudget> userBudgetSaved = getUserBudgetService().updateAutoGeneratedBudget(formData, formFieldName,
		financialPortfolioId, dateMeantFor);

	return userBudgetSaved;
    }

    public IUserBudgetService getUserBudgetService() {
	return userBudgetService;
    }

}
