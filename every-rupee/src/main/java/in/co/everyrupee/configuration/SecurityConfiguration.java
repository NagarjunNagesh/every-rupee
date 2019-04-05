/**
 * 
 */
package in.co.everyrupee.configuration;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.Filter;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

	private static final String SOCIAL_LOGIN_ERROR_MESSAGE = "User logging in with Social Login with client id = ";

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
	@ConfigurationProperties(ProfileServiceConstants.SECURITY_OAUTH2_GOOGLE_CLIENT)
	public AuthorizationCodeResourceDetails google() {
		return new AuthorizationCodeResourceDetails();
	}

	@Bean
	@ConfigurationProperties(ProfileServiceConstants.SECURITY_OAUTH2_FACEBOOK_CLIENT)
	public AuthorizationCodeResourceDetails facebook() {
		return new AuthorizationCodeResourceDetails();
	}

	@Bean
	@ConfigurationProperties(ProfileServiceConstants.SECURITY_OAUTH2_FACEBOOK_RESOURCE)
	public ResourceServerProperties facebookResource() {
		return new ResourceServerProperties();
	}

	@Bean
	@ConfigurationProperties(ProfileServiceConstants.SECURITY_OAUTH2_GOOGLE_RESOURCE)
	public ResourceServerProperties googleResource() {
		return new ResourceServerProperties();
	}

	Logger logger = LoggerFactory.getLogger(this.getClass());

	/**
	 * Generic Filter to identity Google & Facebook login
	 * 
	 * @param loginUrl
	 * @param userInfoUri
	 * @param resourceDetails
	 * @return
	 */
	private Filter ssoFilter(String loginUrl, String userInfoUri, AuthorizationCodeResourceDetails resourceDetails) {
		OAuth2ClientAuthenticationProcessingFilter socialFilter = new OAuth2ClientAuthenticationProcessingFilter(
				loginUrl);
		OAuth2RestTemplate socialTemplate = new OAuth2RestTemplate(resourceDetails, oauth2ClientContext);
		socialFilter.setRestTemplate(socialTemplate);
		socialFilter.setTokenServices(new UserInfoTokenServices(userInfoUri, resourceDetails.getClientId()));
		logger.info(loginUrl + SOCIAL_LOGIN_ERROR_MESSAGE + resourceDetails.getClientId());
		return socialFilter;
	}

	/**
	 * A filter to consolidate both the filters into one.
	 * 
	 * @return
	 */
	private Filter ssoFilter() {
		List<Filter> filters = new ArrayList<>();
		filters.add(ssoFilter(GenericConstants.GOOGLE_SOCIAL_LOGIN_URL, googleResource().getUserInfoUri(), google()));
		filters.add(
				ssoFilter(GenericConstants.FACEBOOK_SOCIAL_LOGIN_URL, facebookResource().getUserInfoUri(), facebook()));

		CompositeFilter filter = new CompositeFilter();
		filter.setFilters(filters);
		return filter;
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.jdbcAuthentication().usersByUsernameQuery(profileQuery).authoritiesByUsernameQuery(rolesQuery)
				.dataSource(dataSource).passwordEncoder(bCryptPasswordEncoder);
	}

	@Bean
	public FilterRegistrationBean<OAuth2ClientContextFilter> oauth2ClientFilterRegistration(
			OAuth2ClientContextFilter filter) {
		FilterRegistrationBean<OAuth2ClientContextFilter> registration = new FilterRegistrationBean<OAuth2ClientContextFilter>();
		registration.setFilter(filter);
		registration.setOrder(-100);
		return registration;
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {

		http.authorizeRequests().antMatchers(GenericConstants.DASHBOARD_CONFIG_URL).authenticated()
				.antMatchers(GenericConstants.ADMIN_SECURITY_CONFIG_URL)
				.hasAuthority(ProfileServiceConstants.Role.ADMIN_ROLE).anyRequest().permitAll().and().csrf().disable()
				.formLogin().loginPage(GenericConstants.LOGIN_URL).failureUrl(GenericConstants.LOGIN_ERROR_URL)
				.defaultSuccessUrl(GenericConstants.DASHBOARD_HOME_URL)
				.usernameParameter(ProfileServiceConstants.User.EMAIL)
				.passwordParameter(ProfileServiceConstants.User.PASSWORD).and().logout()
				.logoutRequestMatcher(new AntPathRequestMatcher(GenericConstants.LOGOUT_URL))
				.logoutSuccessUrl(GenericConstants.HOME_URL).and().exceptionHandling()
				.accessDeniedPage(GenericConstants.LOGIN_ACCESS_DENIED_URL).and()
				.addFilterBefore(ssoFilter(), BasicAuthenticationFilter.class).formLogin()
				.loginPage(GenericConstants.LOGIN_URL);
	}

	@Override
	public void configure(WebSecurity web) throws Exception {
		web.ignoring().antMatchers(GenericConstants.RESOURCES_ANT_MATCHER, GenericConstants.STATIC_ANT_MATCHER,
				GenericConstants.CSS_ANT_MATCHER, GenericConstants.JS_ANT_MATCHER, GenericConstants.IMG_ANT_MATCHER);
	}

}
