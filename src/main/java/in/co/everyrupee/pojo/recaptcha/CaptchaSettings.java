/**
 * 
 */
package in.co.everyrupee.pojo.recaptcha;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import in.co.everyrupee.constants.GenericConstants;

/**
 * Obtain Google Recaptcha configuration from application properties
 * 
 * @author Nagarjun Nagesh
 *
 */
@Component
@ConfigurationProperties(prefix = GenericConstants.GOOGLE_RECAPTCHA_KEY)
public class CaptchaSettings {

	private String site;
	private String secret;

	/**
	 * @return the site
	 */
	public String getSite() {
		return site;
	}

	/**
	 * @param site the site to set
	 */
	public void setSite(String site) {
		this.site = site;
	}

	/**
	 * @return the secret
	 */
	public String getSecret() {
		return secret;
	}

	/**
	 * @param secret the secret to set
	 */
	public void setSecret(String secret) {
		this.secret = secret;
	}

}
