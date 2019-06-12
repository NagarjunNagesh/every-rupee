package in.co.everyrupee.events.listener.registration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.events.registration.OnRegistrationCompleteEvent;
import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.service.email.EmailService;

/**
 * Sends an email to the user after the user has registered with Every Rupee
 * 
 * @author nagarjun
 *
 */
@Async
@Component
public class RegistrationCompleteListener implements IRegistrationCompleteListener {

    @Autowired
    private EmailService mailSender;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    // Calls the confirm registration email scenario
    @Override
    public void onApplicationEvent(final OnRegistrationCompleteEvent event) {
	this.confirmRegistration(event);
    }

    // Sends the Email
    @Override
    public void confirmRegistration(final OnRegistrationCompleteEvent event) {
	final Profile user = event.getUser();

	try {
	    final SimpleMailMessage email = constructEmailMessage(event, user);
	    mailSender.sendEmail(email);
	} catch (Exception e) {
	    logger.error("Unable to send confirmation email after email registration");
	}
    }

    // Creates the mail to send for the user
    @Override
    public final SimpleMailMessage constructEmailMessage(final OnRegistrationCompleteEvent event, final Profile user) {
	final String recipientAddress = user.getEmail();
	final String subject = GenericConstants.USER_REGISTERED_SUCCESSFULLY_SUBJECT;
	final String message = GenericConstants.USER_REGISTERED_SUCCESSFULLY_SUBJECT;
	// Email message
	final SimpleMailMessage passwordResetEmail = new SimpleMailMessage();
	passwordResetEmail.setFrom(GenericConstants.FROM_EMAIL);
	passwordResetEmail.setTo(recipientAddress);
	passwordResetEmail.setSubject(subject);
	// TODO Email Template welcoming the user
	passwordResetEmail.setText(message);

	return passwordResetEmail;
    }

}
