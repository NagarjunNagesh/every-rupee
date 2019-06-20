package in.co.everyrupee.constants.profile;

/**
 * Define Constants for profile query operations
 * 
 * @author Nagarjun Nagesh
 *
 */
public class ProfileServiceConstants {

    // User
    public class User {
	public static final String EMAIL = "email";
	public static final String PASSWORD = "password";
	public static final String USER_TABLE_NAME = "user";
	public static final String USER_ID = "user_id";
	public static final String NAME = "name";
	public static final String ACTIVE = "active";
	public static final String RESET_TOKEN = "reset_token";
	public static final String LOCALE = "locale";
	public static final String FINANCIAL_PORTFOLIO_ID = "financial_portfolio_id";
	public static final String CREATION_DATE = "create_date";
	public static final String MODIFICATION_DATE = "modify_date";
    }

    // Roles
    public class Role {
	public static final String ADMIN_ROLE = "ADMIN";
	public static final String USER_ROLE = "USER";
	public static final String ROLE_ID = "role_id";
	public static final String ROLE_TABLE_NAME = "role";
	public static final String ROLE_PROPERTY = "role";
    }

    public class UserRole {
	public static final String USER_ROLE = "user_role";
    }

    // Objects
    public static final String EMAIL_OBJECT = "email";
    public static final String USERNAME_OBJECT = "userName";
    public static final String PROFILE_MODEL_OBJECT = "profile";
    public static final String LOGIN_VIEWNAME_OBJECT = "login";
    public static final String EMAIL_USER_OBJECT = "error.user";
    public static final String SIGNUP_VIEWNAME_OBJECT = "sign-up";
    public static final String RESET_TOKEN_OBJECT = "resetToken";
    public static final String RESET_PASSWORD_OBJECT = "reset-password";
    public static final String FORGOT_PASSWORD_OBJECT = "forgot-password";
    public static final String SUCCESS_MESSAGE_OBJECT = "successMessage";
    public static final String ADMIN_HOME_VIEWNAME_OBJECT = "admin/admin-home";

    // Parameters
    public static final String TOKEN_PARAM = "token";
    public static final String PASSWORD_PARAM = "password";
    public static final String CONFIRM_PASSWORD_PARAM = "confirm-password";

    // Front End Messages
    public static final String EMPTY_EMAIL_MESSAGE = "*Please provide an email";
    public static final String NAME_EMPTY_MESSAGE = "*Please provide your name";
    public static final String VALID_EMAIL_MESSAGE = "*Please provide a valid Email";
    public static final String PASSWORD_EMPTY_MESSAGE = "*Please provide your password";
    public static final String USER_REGISTERED_SUCCESSFULLY_MESSAGE = "User has been registered successfully";
    public static final String PASSWORD_MINIMUM_CHARACTER_MESSAGE = "*Your password must have at least 5 characters";
    public static final String USER_ALREADY_REGISTERED_MESSAGE = "There is already a user registered with the email provided";
    public static final String USER_REDIRECTED_TO_DASHBOARD_MESSAGE = "User is redirected to dashboard home page - ";

    // Application property variables
    public static final String SECURITY_OAUTH2_GOOGLE_CLIENT = "security.oauth2.google.client";
    public static final String SECURITY_OAUTH2_FACEBOOK_CLIENT = "security.oauth2.facebook.client";
    public static final String SECURITY_OAUTH2_FACEBOOK_RESOURCE = "security.oauth2.facebook.resource";
    public static final String SECURITY_OAUTH2_GOOGLE_RESOURCE = "security.oauth2.google.resource";

}
