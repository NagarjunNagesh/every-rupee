package in.co.everyrupee.events.listener.registration;

import org.springframework.context.ApplicationListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import in.co.everyrupee.events.registration.OnRegistrationCompleteEvent;
import in.co.everyrupee.pojo.login.Profile;

/**
 * Interface for the listeners to expose the proxy. (Enable Async, Create New Transactions & Override Old Transactions)
 * 
 * @author Nagarjun
 *
 */
public interface IRegistrationCompleteListener extends ApplicationListener<OnRegistrationCompleteEvent> {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Override
    public void onApplicationEvent(final OnRegistrationCompleteEvent event);
    
    public void confirmRegistration(final OnRegistrationCompleteEvent event);
    
    public SimpleMailMessage constructEmailMessage(final OnRegistrationCompleteEvent event, final Profile user);
}
