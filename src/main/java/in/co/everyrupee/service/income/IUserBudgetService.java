package in.co.everyrupee.service.income;

import java.util.List;

import org.springframework.util.MultiValueMap;

import in.co.everyrupee.pojo.income.UserBudget;

public interface IUserBudgetService {

	List<UserBudget> fetchAllUserBudget(String financialPortfolioId);
	
	List<UserBudget> fetchUserBudgetByCategoryIds(String categoryIds, String financialPortfolioId);
	
	void deleteUserBudgets(String categoryIds, String financialPortfolioId);

	UserBudget saveUserBudget(MultiValueMap<String, String> formData, String pFinancialPortfolioId);
	
	UserBudget updateBudget(MultiValueMap<String, String> formData, String formFieldName,
		    String financialPortfolioId);
}
