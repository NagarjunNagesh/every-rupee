package in.co.everyrupee.service.income;

import java.util.List;

import org.springframework.util.MultiValueMap;

import in.co.everyrupee.pojo.income.UserBudget;

public interface IUserBudgetService {

    UserBudget saveAutoGeneratedUserBudget(MultiValueMap<String, String> formData, String pFinancialPortfolioId,
	    boolean autoGenerated);

    List<UserBudget> updateAutoGeneratedBudget(MultiValueMap<String, String> formData, String formFieldName,
	    String financialPortfolioId, String dateMeantFor);

    void deleteAllUserBudgets(String dateMeantFor, String financialPortfolioId, boolean autoGenerated);

    void deleteAutoGeneratedUserBudgets(String categoryIds, String financialPortfolioId, String dateMeantFor);

    List<UserBudget> fetchAllUserBudget(String pFinancialPortfolioId, String dateMeantFor);

    List<UserBudget> fetchAutoGeneratedUserBudgetByCategoryIds(String categoryIds, String pFinancialPortfolioId,
	    String dateMeantFor);

}
