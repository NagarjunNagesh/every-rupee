/**
 * 
 */
package in.co.everyrupee.configuration.login;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.oauth2.resource.ResourceServerProperties;
import org.springframework.boot.autoconfigure.security.oauth2.resource.UserInfoTokenServices;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.filter.OAuth2ClientAuthenticationProcessingFilter;
import org.springframework.security.oauth2.client.filter.OAuth2ClientContextFilter;
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeResourceDetails;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.filter.CompositeFilter;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.constants.profile.ProfileServiceConstants;

import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;
import javax.servlet.Filter;

/**
 * Implement Security Configuration for Web Application
 * 
 * @author Nagarjun Nagesh
 *
 */

@Configuration
@EnableOAuth2Client
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
	    private OAuth2ClientContext oauth2ClientContext;
	    
	    @Bean
	    @ConfigurationProperties("security.oauth2.google.client")
	    public AuthorizationCodeResourceDetails google() {
	        return new AuthorizationCodeResourceDetails();
	    }
	    
	    @Bean
	    @ConfigurationProperties("security.oauth2.facebook.client")
	    public AuthorizationCodeResourceDetails facebook() {
	        return new AuthorizationCodeResourceDetails();
	    }
	     
	    @Bean
	    @ConfigurationProperties("security.oauth2.facebook.resource")
	    public ResourceServerProperties facebookResource() {
	        return new ResourceServerProperties();
	    }

	    @Bean
	    @ConfigurationProperties("security.oauth2.google.resource")
	    public ResourceServerProperties googleResource() {
	        return new ResourceServerProperties();
	    }

	    private Filter ssoGoogleFilter() {
	        OAuth2ClientAuthenticationProcessingFilter googleFilter = new OAuth2ClientAuthenticationProcessingFilter("/login/google");
	        OAuth2RestTemplate googleTemplate = new OAuth2RestTemplate(google(), oauth2ClientContext);
	        googleFilter.setRestTemplate(googleTemplate);
	        googleFilter.setTokenServices(new UserInfoTokenServices(googleResource().getUserInfoUri(), google().getClientId()));
	        return googleFilter;
	    }
	    
	    private Filter ssoFacebookFilter() {
	        OAuth2ClientAuthenticationProcessingFilter facebookFilter = new OAuth2ClientAuthenticationProcessingFilter("/login/facebook");
	        OAuth2RestTemplate facebookTemplate = new OAuth2RestTemplate(facebook(), oauth2ClientContext);
	        facebookFilter.setRestTemplate(facebookTemplate);
	        facebookFilter.setTokenServices(new UserInfoTokenServices(facebookResource().getUserInfoUri(), facebook().getClientId()));
	        return facebookFilter;
	    }
	    
	    private Filter ssoFilter() {
	        List<Filter> filters = new ArrayList<>();
	        filters.add(ssoGoogleFilter());
	        filters.add(ssoFacebookFilter());
	    
	        CompositeFilter filter = new CompositeFilter();
	        filter.setFilters(filters);
	        return filter;
	   }
	    
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
	    
	    @Bean
		public FilterRegistrationBean<OAuth2ClientContextFilter> oauth2ClientFilterRegistration(OAuth2ClientContextFilter filter) {
			FilterRegistrationBean<OAuth2ClientContextFilter> registration = new FilterRegistrationBean<OAuth2ClientContextFilter>();
			registration.setFilter(filter);
			registration.setOrder(-100);
			return registration;
		}

	    @Override
	    protected void configure(HttpSecurity http) throws Exception {

	        http
	        		.authorizeRequests()
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
	                .accessDeniedPage(GenericConstants.LOGIN_ACCESS_DENIED_URL)
	                .and()
	        		.addFilterBefore(ssoFilter(), BasicAuthenticationFilter.class)
            		.formLogin()
                    .loginPage(GenericConstants.LOGIN_URL);
	    }

	    @Override
	    public void configure(WebSecurity web) throws Exception {
	        web
	                .ignoring()
	                .antMatchers(GenericConstants.RESOURCES_ANT_MATCHER, GenericConstants.STATIC_ANT_MATCHER, GenericConstants.CSS_ANT_MATCHER, GenericConstants.JS_ANT_MATCHER, GenericConstants.IMG_ANT_MATCHER);
	    }

}
