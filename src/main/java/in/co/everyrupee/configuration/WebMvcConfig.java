package in.co.everyrupee.configuration;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.thymeleaf.extras.springsecurity5.dialect.SpringSecurityDialect;

import in.co.everyrupee.interceptor.LoggerInterceptor;
import in.co.everyrupee.utils.RegexUtils;

/**
 * Configures the spring boot
 * 
 * @author Nagarjun Nagesh
 *
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	public static final String LANG = "lang";
	public static final String MESSAGES = "messages";

	@Autowired
	LoggerInterceptor loggerInterceptor;

	/**
	 * sec:authorize in HTML to function appropriately along with Thymeleaf
	 * springsecurity5
	 * 
	 * @return
	 */
	@Bean
	public SpringSecurityDialect springSecurityDialect() {
		return new SpringSecurityDialect();
	}

	/**
	 * Creates a new RegexUtils for Profileservice
	 * 
	 * @return
	 */
	@Bean
	public RegexUtils regexUtils() {
		return new RegexUtils();
	}

	/**
	 * Adding a logger interceptor to set the name of the log file
	 */
	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		final LocaleChangeInterceptor localeChangeInterceptor = new LocaleChangeInterceptor();
		localeChangeInterceptor.setParamName(LANG);
		registry.addInterceptor(localeChangeInterceptor);
		registry.addInterceptor(loggerInterceptor);
	}

	// beans

	@Bean
	public LocaleResolver localeResolver() {
		final CookieLocaleResolver cookieLocaleResolver = new CookieLocaleResolver();
		cookieLocaleResolver.setDefaultLocale(Locale.ENGLISH);
		return cookieLocaleResolver;
	}

	/**
	 * Start Using Locale and Set up a default messages.properties file
	 * 
	 * @return
	 */
	@Bean
	public ResourceBundleMessageSource messageSource() {
		ResourceBundleMessageSource source = new ResourceBundleMessageSource();
		source.setBasename(MESSAGES);
		source.setCacheSeconds(3600); // Refresh cache once per hour.
		return source;
	}

}
