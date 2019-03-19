package in.co.everyrupee.constants.profile;

/**
 * Define Constants for profile query operations
 * 
 * @author Nagarjun Nagesh
 *
 */
public class ProfileServiceConstants {
	
	//User
	public class User {
		public static final String EMAIL = "email";
		public static final String PASSWORD = "password";
		public static final String USER_TABLE_NAME = "user";
		public static final String USER_ID = "user_id";
		public static final String NAME = "name";
		public static final String ACTIVE = "active";
		public static final String RESET_TOKEN = "reset_token";
	}

	//Roles
	public class Role {
		public static final String ADMIN_ROLE = "ADMIN";
		public static final String ROLE_ID = "role_id";
		public static final String ROLE_TABLE_NAME = "role";
		public static final String ROLE_PROPERTY = "role";
	}
	
	public class UserRole {
		public static final String USER_ROLE = "user_role";
	}
	
	public static final String PROFILE_MODEL_OBJECT = "profile";
	public static final String LOGIN_VIEWNAME_OBJECT  = "login";
	public static final String SIGNUP_VIEWNAME_OBJECT  = "sign-up";
	public static final String EMAIL_OBJECT = "email";
	public static final String EMAIL_USER_OBJECT = "error.user";
	public static final String SUCCESS_MESSAGE_OBJECT = "successMessage";
	public static final String ADMIN_HOME_VIEWNAME_OBJECT = "admin/admin-home";
	public static final String USERNAME_OBJECT = "userName";
	public static final String REDIRECT_VIEW_NAME_OBJECT = "redirect:/";
	
	// Front End Messages
	public static final String USER_REGISTERED_SUCCESSFULLY_MESSAGE = "User has been registered successfully";
	public static final String USER_ALREADY_REGISTERED_MESSAGE = "There is already a user registered with the email provided";
	public static final String VALID_EMAIL_MESSAGE = "*Please provide a valid Email";
	public static final String EMPTY_EMAIL_MESSAGE = "*Please provide an email";
	public static final String PASSWORD_MINIMUM_CHARACTER_MESSAGE = "*Your password must have at least 5 characters";
	public static final String PASSWORD_EMPTY_MESSAGE = "*Please provide your password";
	public static final String NAME_EMPTY_MESSAGE = "*Please provide your name";
	
	
}
