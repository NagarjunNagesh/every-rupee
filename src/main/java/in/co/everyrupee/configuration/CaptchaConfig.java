package in.co.everyrupee.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import in.co.everyrupee.constants.GenericConstants;

/**
 * Configuration for Captcha
 * 
 * @author Nagarjun Nagesh
 *
 */
@Configuration
@ComponentScan(basePackages = { GenericConstants.EVERYRUPEE_PACKAGE })
public class CaptchaConfig {

	@Bean
	public ClientHttpRequestFactory clientHttpRequestFactory() {
		SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
		factory.setConnectTimeout(3 * 1000);
		factory.setReadTimeout(7 * 1000);
		return factory;
	}

	@Bean
	public RestOperations restTemplate() {
		RestTemplate restTemplate = new RestTemplate(this.clientHttpRequestFactory());
		return restTemplate;
	}
}
