package in.co.everyrupee.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.thymeleaf.extras.springsecurity5.dialect.SpringSecurityDialect;

import in.co.everyrupee.interceptor.LoggerInterceptor;

/**
 * Configures the spring boot
 * 
 * @author Nagarjun Nagesh
 *
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

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

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(loggerInterceptor);
	}

}
