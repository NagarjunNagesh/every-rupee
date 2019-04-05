/**
 * 
 */
package in.co.everyrupee.service.recaptcha;

import in.co.everyrupee.exception.recaptcha.ReCaptchaInvalidException;

/**
 * Captcha Services to validate user.
 * 
 * @author Nagarjun Nagesh
 *
 */
public interface CaptchaService {
	void processResponse(final String response) throws ReCaptchaInvalidException;

	String getReCaptchaSite();

	String getReCaptchaSecret();
}
