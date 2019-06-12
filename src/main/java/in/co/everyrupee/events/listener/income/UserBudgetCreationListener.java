package in.co.everyrupee.events.listener.income;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.util.CollectionUtils;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.events.income.OnSaveTransactionCompleteEvent;
import in.co.everyrupee.service.income.ICategoryService;
import in.co.everyrupee.service.income.IUserBudgetService;
import in.co.everyrupee.utils.ERStringUtils;

/**
 * Asynchronously creates a budget for the user, removing itself from the
 * transaction of the caller method.
 * 
 * @author Nagarjun
 *
 */
@Async
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

    // Required to not propogate the transactions and to create a new transaction
    // for the listener.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void saveUserBudget(final OnSaveTransactionCompleteEvent event) {

	try {
	    MultiValueMap<String, String> formData = event.getformData();

	    if (CollectionUtils.isEmpty(formData.get(DashboardConstants.Transactions.CATEGORY_OPTIONS))
		    || ERStringUtils.isBlank(formData.get(DashboardConstants.Transactions.CATEGORY_OPTIONS).get(0))
		    || CollectionUtils.isEmpty(formData.get(DashboardConstants.Transactions.AMOUNT))
		    || ERStringUtils.isBlank(formData.get(DashboardConstants.Transactions.AMOUNT).get(0))
		    || ERStringUtils.equalsIgnoreCase(formData.get(DashboardConstants.Transactions.AMOUNT).get(0),
			    DashboardConstants.DEFAULT_ADD_ROW_QUANTITY)) {
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
