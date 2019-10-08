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
    public static final String DASHBOARD_GOALS_URL = "/dashboard/goals";
    public static final String DASHBOARD_TRANSACTIONS_URL = "/dashboard/transactions";
    public static final String DASHBOARD_BUDGET_URL = "/dashboard/budget";
    public static final String DASHBOARD_INVESTMENT_URL = "/dashboard/investment";
    public static final String DASHBOARD_SETTINGS_URL = "/dashboard/settings";
    public static final String DASHBOARD_PROFILE_URL = "/dashboard/profile";
    public static final String DASHBOARD_OVERVIEW_URL = "/dashboard/overview";
    public static final String KEEP_ALIVE_CHECK_URL = "/api/keepAlive";

    // Objects
    public static final String ERROR_MESSAGE_OBJECT = "errorMessage";
    public static final String INDEX_VIEW_NAME_OBJECT = "index";
    public static final String ABOUT_VIEW_NAME_OBJECT = "about";
    public static final String DASHBOARD_HOME_VIEW_NAME_OBJECT = "dashboard/home";
    public static final String DASHBOARD_GOALS_VIEW_NAME_OBJECT = "dashboard/goals";
    public static final String DASHBOARD_TRANSACTIONS_VIEW_NAME_OBJECT = "dashboard/transactions";
    public static final String DASHBOARD_BUDGET_VIEW_NAME_OBJECT = "dashboard/budget";
    public static final String DASHBOARD_INVESTMENT_VIEW_NAME_OBJECT = "dashboard/investment";
    public static final String DASHBOARD_SETTINGS_VIEW_NAME_OBJECT = "dashboard/settings";
    public static final String DASHBOARD_PROFILE_VIEW_NAME_OBJECT = "dashboard/profile";
    public static final String DASHBOARD_OVERVIEW_VIEW_NAME_OBJECT = "dashboard/overview";
    public static final String GOOGLE_RECAPTCHA_RESPONSE = "g-recaptcha-response";
    public static final String ENVIRONMENT_ACTIVE = "environment";

    // Queries
    public static final String PROFILE_QUERY_APPLICATION_PROPERTIES = "${spring.queries.profile-query}";
    public static final String ROLES_QUERY_APPLICATION_PROPERTIES = "${spring.queries.roles-query}";

    // Mailing
    public static final String FROM_EMAIL = "nagarjun_nagesh@outlook.com";
    public static final String PASSWORD_RESET_SUBJECT = "Password Reset Request";
    public static final String USER_REGISTERED_SUCCESSFULLY_SUBJECT = "User Registered Successfully";
    public static final String PASSWORD_RESET_BODY = "To reset your password, click the link below:\n";

    // Characters
    public static final String SPACE_CHARACTER = " ";
    public static final String HTTP_PARAM = "http://";
    public static final String COMMA = ",";
    public static final String EMPTY_CHARACTER = "";

    // application.properties variables
    public static final String GOOGLE_RECAPTCHA_KEY = "google.recaptcha.key";

    // Package
    public static final String EVERYRUPEE_PACKAGE = "in.co.everyrupee";

    // Generic Service
    public static final String GENERIC_SERVICE_SUCCESS = "success";

    // Parameters
    public static final String FORMAT_HTML_PARAMETER = "HTML";
    public static final String TRANSACTIONS_PAGE_PARAMETER = "TransactionsPage";

    // Category Constants
    public static final String INCOME_CATEGORY = "2";

    // Date Format
    public static final String DATE_FORMAT_FRONTEND = "ddMMyyyy";

    // FinancialPortfolio validation
    public static final int MAX_ALLOWED_LENGTH_FINANCIAL_PORTFOLIO = 60;

    // Date Format
    public static final String DATE_FORMAT_USER_FRIENDLY = "dd MMM yyyy, hh:mm aa";

}
