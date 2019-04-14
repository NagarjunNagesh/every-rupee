package in.co.everyrupee.constants;

/**
 * Constants that are present in the application layer
 * 
 * @author Nagarjun Nagesh
 *
 */
public class GenericConstants {

	// Ant Matchers
	public static final String RESOURCES_ANT_MATCHER = "/resources/**";
	public static final String STATIC_ANT_MATCHER = "/static/**";
	public static final String CSS_ANT_MATCHER = "/css/**";
	public static final String JS_ANT_MATCHER = "/js/**";
	public static final String IMG_ANT_MATCHER = "/img/**";

	// URLS
	public static final String HOME_URL = "/";
	public static final String LOGIN_URL = "/login";
	public static final String ABOUT_URL = "/about";
	public static final String HTTP_POSTFIX = "://";
	public static final String LOGOUT_URL = "/logout";
	public static final String SIGNUP_URL = "/sign-up";
	public static final String RESET_PASSWORD_URL = "/reset-password";
	public static final String FORGOT_PASSWORD_URL = "/forgot-password";
	public static final String RESET_PASSWORD_TOKEN_PARAMETER = "?token=";
	public static final String ADMIN_SECURITY_CONFIG_URL = "/admin/**";
	public static final String LOGIN_ERROR_URL = "/login?error=true";
	public static final String ADMIN_HOME_URL = "/admin/admin-home";
	public static final String REDIRECT_VIEW_NAME_OBJECT = "redirect:";
	public static final String LOGIN_ACCESS_DENIED_URL = "/login?accessDenied=true";
	public static final String DASHBOARD_HOME_URL = "/dashboard/home";
	public static final String DASHBOARD_CONFIG_URL = "/dashboard/**";
	public static final String GOOGLE_SOCIAL_LOGIN_URL = "/login/google";
	public static final String FACEBOOK_SOCIAL_LOGIN_URL = "/login/facebook";
	public static final String DASHBOARD_SAVINGS_URL = "/dashboard/savings";
	public static final String DASHBOARD_INCOME_URL = "/dashboard/income";
	public static final String DASHBOARD_DEBT_URL = "/dashboard/debt";
	public static final String DASHBOARD_INVESTMENT_URL = "/dashboard/investment";

	// Objects
	public static final String ERROR_MESSAGE_OBJECT = "errorMessage";
	public static final String INDEX_VIEW_NAME_OBJECT = "index";
	public static final String ABOUT_VIEW_NAME_OBJECT = "about";
	public static final String DASHBOARD_HOME_VIEW_NAME_OBJECT = "dashboard/home";
	public static final String DASHBOARD_SAVINGS_VIEW_NAME_OBJECT = "dashboard/savings";
	public static final String DASHBOARD_INCOME_VIEW_NAME_OBJECT = "dashboard/income";
	public static final String DASHBOARD_DEBT_VIEW_NAME_OBJECT = "dashboard/debt";
	public static final String DASHBOARD_INVESTMENT_VIEW_NAME_OBJECT = "dashboard/investment";
	public static final String GOOGLE_RECAPTCHA_RESPONSE = "g-recaptcha-response";

	// Queries
	public static final String PROFILE_QUERY_APPLICATION_PROPERTIES = "${spring.queries.profile-query}";
	public static final String ROLES_QUERY_APPLICATION_PROPERTIES = "${spring.queries.roles-query}";

	// Mailing
	public static final String FROM_EMAIL = "support@everyrupee.co.in";
	public static final String PASSWORD_RESET_SUBJECT = "Password Reset Request";
	public static final String USER_REGISTERED_SUCCESSFULLY_SUBJECT = "User Registered Successfully";
	public static final String PASSWORD_RESET_BODY = "To reset your password, click the link below:\n";

	// Characters
	public static final String SPACE_CHARACTER = " ";

	// application.properties variables
	public static final String GOOGLE_RECAPTCHA_KEY = "google.recaptcha.key";
}
