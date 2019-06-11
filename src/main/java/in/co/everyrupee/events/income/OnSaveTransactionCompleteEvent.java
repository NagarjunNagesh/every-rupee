package in.co.everyrupee.events.income;

import java.util.Map;

import org.springframework.context.ApplicationEvent;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.security.core.userdetails.MyUser;

/**
 * Save Budget based on user transaction
 * 
 * @author Nagarjun
 *
 */
@SuppressWarnings("serial")
public class OnSaveTransactionCompleteEvent extends ApplicationEvent {

	private final MultiValueMap<String,String> formData;
	private final String financialPortfolioId;
	private final MyUser user;

	public OnSaveTransactionCompleteEvent(final MyUser user, final String financialPortfolioId, final MultiValueMap<String,String> formData) {
		super(user);
		this.user = user;
		this.financialPortfolioId = financialPortfolioId;
		this.formData = formData;
	}

	//

	public MyUser getUser() {
		return user;
	}

	public MultiValueMap<String,String> getformData() {
		return formData;
	}

	public String getFinancialPortfolioId() {
		return financialPortfolioId;
	}
	
}