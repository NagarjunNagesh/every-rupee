package in.co.everyrupee.service.email;

import org.springframework.mail.SimpleMailMessage;

/**
 * @author Nagarjun Nagesh
 *
 */
public interface EmailService {
	public void sendEmail(SimpleMailMessage email);
}
