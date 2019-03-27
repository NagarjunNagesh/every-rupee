package in.co.everyrupee.configuration.login;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.thymeleaf.extras.springsecurity5.dialect.SpringSecurityDialect;

/**
 * Configures the spring boot
 * 
 * @author Nagarjun Nagesh
 *
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

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

}
