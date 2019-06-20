package in.co.everyrupee.service.recaptcha;

import java.net.URI;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestOperations;

import in.co.everyrupee.exception.recaptcha.ReCaptchaInvalidException;
import in.co.everyrupee.exception.recaptcha.ReCaptchaUnavailableException;
import in.co.everyrupee.pojo.recaptcha.CaptchaSettings;
import in.co.everyrupee.pojo.recaptcha.GoogleResponse;

/**
 * Service which calls the google invisible recaptcha to validate user
 * 
 * @author Nagarjun Nagesh
 *
 */
@Service("captchaService")
public class CaptchaServiceImpl implements CaptchaService {
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private CaptchaSettings captchaSettings;

    @Autowired
    private ReCaptchaAttemptService reCaptchaAttemptService;

    @Autowired
    private RestOperations restTemplate;

    private static final Pattern RESPONSE_PATTERN = Pattern.compile("[A-Za-z0-9_-]+");

    Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public void processResponse(final String response) {
	logger.debug("Attempting to validate response {}", response);

	if (getReCaptchaAttemptService().isBlocked(getClientIP())) {
	    throw new ReCaptchaInvalidException("Client exceeded maximum number of failed attempts");
	}

	if (!responseSanityCheck(response)) {
	    throw new ReCaptchaInvalidException("Response contains invalid characters");
	}

	final URI verifyUri = URI.create(
		String.format("https://www.google.com/recaptcha/api/siteverify?secret=%s&response=%s&remoteip=%s",
			getReCaptchaSecret(), response, getClientIP()));
	try {
	    final GoogleResponse googleResponse = getRestTemplate().getForObject(verifyUri, GoogleResponse.class);
	    logger.debug("Google's response: {} ", googleResponse.toString());

	    if (!googleResponse.isSuccess()) {
		if (googleResponse.hasClientError()) {
		    getReCaptchaAttemptService().reCaptchaFailed(getClientIP());
		}
		throw new ReCaptchaInvalidException("reCaptcha was not successfully validated");
	    }
	} catch (RestClientException rce) {
	    throw new ReCaptchaUnavailableException("Registration unavailable at this time.  Please try again later.",
		    rce);
	}
	getReCaptchaAttemptService().reCaptchaSucceeded(getClientIP());
    }

    private boolean responseSanityCheck(final String response) {
	return StringUtils.hasLength(response) && RESPONSE_PATTERN.matcher(response).matches();
    }

    @Override
    public String getReCaptchaSite() {
	return getCaptchaSettings().getSite();
    }

    @Override
    public String getReCaptchaSecret() {
	return getCaptchaSettings().getSecret();
    }

    private String getClientIP() {
	final String xfHeader = getRequest().getHeader("X-Forwarded-For");
	if (xfHeader == null) {
	    return getRequest().getRemoteAddr();
	}
	return xfHeader.split(",")[0];
    }

    public HttpServletRequest getRequest() {
	return request;
    }

    public CaptchaSettings getCaptchaSettings() {
	return captchaSettings;
    }

    public ReCaptchaAttemptService getReCaptchaAttemptService() {
	return reCaptchaAttemptService;
    }

    public RestOperations getRestTemplate() {
	return restTemplate;
    }

}
