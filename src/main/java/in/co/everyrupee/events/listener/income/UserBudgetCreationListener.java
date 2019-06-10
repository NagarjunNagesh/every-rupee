package in.co.everyrupee.events.listener.income;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.events.income.OnSaveTransactionCompleteEvent;
import in.co.everyrupee.service.income.ICategoryService;
import in.co.everyrupee.service.income.IUserBudgetService;

@Component
public class UserBudgetCreationListener implements ApplicationListener<OnSaveTransactionCompleteEvent> {

    @Autowired
    private IUserBudgetService userBudgetService;

    @Autowired
    private ICategoryService categoryService;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    // API

    @Override
    public void onApplicationEvent(final OnSaveTransactionCompleteEvent event) {
	this.saveUserBudget(event);
    }

    private void saveUserBudget(final OnSaveTransactionCompleteEvent event) {

	try {
	    MultiValueMap<String, String> formData = event.getformData();

	    if (formData.get(DashboardConstants.Transactions.CATEGORY_OPTIONS) == null
		    && formData.get(DashboardConstants.Transactions.CATEGORY_OPTIONS).get(0) != null) {
		return;
	    }

	    String categoryId = formData.get(DashboardConstants.Transactions.CATEGORY_OPTIONS).get(0);
	    formData.put(DashboardConstants.Budget.CATEGORY_ID,
		    formData.get(DashboardConstants.Transactions.CATEGORY_OPTIONS));
	    formData.put(DashboardConstants.Budget.AMOUNT_JSON, formData.get(DashboardConstants.Transactions.AMOUNT));
	    final Boolean categoryIncome = categoryService.categoryIncome(Integer.parseInt(categoryId));

	    if (categoryIncome) {
		userBudgetService.saveUserBudget(formData, event.getFinancialPortfolioId());
	    }
	} catch (Exception e) {
	    logger.error("Unable to create a budget for the category " + e);
	}
    }

}
