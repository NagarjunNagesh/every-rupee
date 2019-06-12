package in.co.everyrupee.events.listener.income;

import org.springframework.context.ApplicationListener;

import in.co.everyrupee.events.income.OnSaveTransactionCompleteEvent;

/**
 * Interface for the listeners to expose the proxy (Enable Async, Create New Transactions & Override Old Transactions)
 * 
 * @author Nagarjun
 *
 */
public interface IUserBudgetCreationListener extends ApplicationListener<OnSaveTransactionCompleteEvent> {

    public void saveUserBudget(final OnSaveTransactionCompleteEvent event);
}
