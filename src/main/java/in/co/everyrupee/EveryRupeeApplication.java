package in.co.everyrupee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;

import in.co.everyrupee.constants.GenericConstants;

/**
 * Initializing Every Rupee Application
 * 
 * @author Nagarjun
 *
 */
@SpringBootApplication
@EnableCaching
@EnableAuthorizationServer
@ComponentScan(GenericConstants.EVERYRUPEE_PACKAGE)
public class EveryRupeeApplication {

    /**
     * Password encryption for login and register
     * 
     * @return
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
	BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
	return bCryptPasswordEncoder;
    }

    public static void main(String[] args) {
	SpringApplication.run(EveryRupeeApplication.class, args);
    }

}
