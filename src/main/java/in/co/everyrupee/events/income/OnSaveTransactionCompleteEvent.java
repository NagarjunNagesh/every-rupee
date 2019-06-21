package in.co.everyrupee.events.income;

import org.springframework.context.ApplicationEvent;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.MultiValueMap;

/**
 * Save Budget based on user transaction
 * 
 * @author Nagarjun
 *
 */
public class OnSaveTransactionCompleteEvent extends ApplicationEvent {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    private final MultiValueMap<String, String> formData;
    private final String financialPortfolioId;

    public OnSaveTransactionCompleteEvent(final String financialPortfolioId,
	    final MultiValueMap<String, String> formData) {
	super(SecurityContextHolder.getContext().getAuthentication().getPrincipal());
	this.financialPortfolioId = financialPortfolioId;
	this.formData = formData;
    }

    public MultiValueMap<String, String> getFormData() {
	return formData;
    }

    public String getFinancialPortfolioId() {
	return financialPortfolioId;
    }

}