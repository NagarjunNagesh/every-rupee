package in.co.everyrupee.events.listener.income;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.events.income.OnSaveTransactionCompleteEvent;
import in.co.everyrupee.pojo.income.UserBudget;
import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.security.core.userdetails.MyUser;
import in.co.everyrupee.service.email.EmailService;
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
		final MyUser user = event.getUser();

		try {
			MultiValueMap<String, String> formData = event.getformData();
			
			if (formData.get("categoryId") == null && formData.get("categoryId").get(0) != null) {
				return;
			}
			
			String categoryId = formData.get("categoryId").get(0);
			final Boolean categoryIncome = categoryService.categoryIncome(Integer.parseInt(categoryId));
			
			if(categoryIncome) {
				userBudgetService.saveUserBudget(formData, event.getFinancialPortfolioId());
			}
		} catch (Exception e) {
			logger.error("Unable to send confirmation email after email registration");
		}
	}

}
