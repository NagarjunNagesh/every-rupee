package in.co.everyrupee.constants.profile;

/**
 * @author nagarjun
 *
 */
public class GenericConstants {
	
		// Ant Matchers
		public static final String RESOURCES_ANT_MATCHER = "/resources/**";
		public static final String STATIC_ANT_MATCHER = "/static/**";
		public static final String CSS_ANT_MATCHER = "/css/**";
		public static final String JS_ANT_MATCHER = "/js/**";
		public static final String IMG_ANT_MATCHER = "/img/**";
		
		//URLS
		public static final String HOME_URL = "/";
		public static final String LOGIN_URL = "/login";
		public static final String HTTP_POSTFIX = "://";
		public static final String LOGOUT_URL = "/logout";
		public static final String SIGNUP_URL = "/sign-up";
		public static final String RESET_PASSWORD_URL = "/reset-password";
		public static final String FORGOT_PASSWORD_URL = "/forgot-password";
		public static final String RESET_PASSWORD_TOKEN_PARAMETER = "?token=";
		public static final String ADMIN_SECURITY_CONGIG_URL = "/admin/**";
		public static final String LOGIN_ERROR_URL = "/login?error=true";
		public static final String ADMIN_HOME_URL = "/admin/admin-home";
		public static final String REDIRECT_VIEW_NAME_OBJECT = "redirect:";
		public static final String LOGIN_ACCESS_DENIED_URL = "/login?accessDenied=true";
		
		//Objects
		public static final String ERROR_MESSAGE_OBJECT = "errorMessage";
		
		// Queries
		public static final String PROFILE_QUERY_APPLICATION_PROPERTIES = "${spring.queries.profile-query}";
		public static final String ROLES_QUERY_APPLICATION_PROPERTIES = "${spring.queries.roles-query}";
		
		// Mailing
		public static final String FROM_EMAIL = "support@everyrupee.co.in";
		public static final String PASSWORD_RESET_SUBJECT = "Password Reset Request";
		public static final String PASSWORD_RESET_BODY = "To reset your password, click the link below:\n";
		
}
