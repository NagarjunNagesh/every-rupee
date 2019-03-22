/**
 * 
 */
package in.co.everyrupee.configuration.login;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.social.connect.ConnectionFactoryLocator;
import org.springframework.social.connect.UsersConnectionRepository;
import org.springframework.social.connect.mem.InMemoryUsersConnectionRepository;
import org.springframework.social.connect.web.ProviderSignInController;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.constants.profile.ProfileServiceConstants;

import javax.sql.DataSource;

/**
 * Implement Security Configuration for Web Application
 * 
 * @author Nagarjun Nagesh
 *
 */
@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
	
	    @Autowired
	    private BCryptPasswordEncoder bCryptPasswordEncoder;

	    @Autowired
	    private DataSource dataSource;

	    @Value(GenericConstants.PROFILE_QUERY_APPLICATION_PROPERTIES)
	    private String profileQuery;

	    @Value(GenericConstants.ROLES_QUERY_APPLICATION_PROPERTIES)
	    private String rolesQuery;
	    
	    @Autowired
	    private ConnectionFactoryLocator connectionFactoryLocator;
	 
	    @Autowired
	    private UsersConnectionRepository usersConnectionRepository;
	 
	    @Autowired
	    private FacebookConnectionSignUp facebookConnectionSignUp;
	 
	    
	    @Override
	    protected void configure(AuthenticationManagerBuilder auth)
	            throws Exception {
	        auth.
	                jdbcAuthentication()
	                .usersByUsernameQuery(profileQuery)
	                .authoritiesByUsernameQuery(rolesQuery)
	                .dataSource(dataSource)
	                .passwordEncoder(bCryptPasswordEncoder);
	    }

	    @Override
	    protected void configure(HttpSecurity http) throws Exception {

	        http.
	                authorizeRequests()
	                .antMatchers(GenericConstants.DASHBOARD_CONFIG_URL).authenticated()
	                .antMatchers(GenericConstants.ADMIN_SECURITY_CONFIG_URL).hasAuthority(ProfileServiceConstants.Role.ADMIN_ROLE)
	                .anyRequest().permitAll().and().csrf().disable().formLogin()
	                .loginPage(GenericConstants.LOGIN_URL).failureUrl(GenericConstants.LOGIN_ERROR_URL)
	                .defaultSuccessUrl(GenericConstants.ADMIN_HOME_URL)
	                .usernameParameter(ProfileServiceConstants.User.EMAIL)
	                .passwordParameter(ProfileServiceConstants.User.PASSWORD)
	                .and().logout()
	                .logoutRequestMatcher(new AntPathRequestMatcher(GenericConstants.LOGOUT_URL))
	                .logoutSuccessUrl(GenericConstants.HOME_URL).and().exceptionHandling()
	                .accessDeniedPage(GenericConstants.LOGIN_ACCESS_DENIED_URL);
	    }

	    @Override
	    public void configure(WebSecurity web) throws Exception {
	        web
	                .ignoring()
	                .antMatchers(GenericConstants.RESOURCES_ANT_MATCHER, GenericConstants.STATIC_ANT_MATCHER, GenericConstants.CSS_ANT_MATCHER, GenericConstants.JS_ANT_MATCHER, GenericConstants.IMG_ANT_MATCHER);
	    }
	    
	    @Bean
	    public ProviderSignInController providerSignInController() {
	        ((InMemoryUsersConnectionRepository) usersConnectionRepository)
	          .setConnectionSignUp(facebookConnectionSignUp);
	         
	        return new ProviderSignInController(
	          connectionFactoryLocator, 
	          usersConnectionRepository, 
	          new FacebookSignInAdapter());
	    }

}
