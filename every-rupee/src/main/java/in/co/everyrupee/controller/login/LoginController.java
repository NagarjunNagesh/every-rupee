package in.co.everyrupee.controller.login;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.constants.profile.ProfileServiceConstants;
import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.service.email.EmailService;
import in.co.everyrupee.service.login.ProfileService;
import in.co.everyrupee.utils.ERStringUtils;

/**
 * Login & Registration Module
 * 
 * @author Nagarjun Nagesh
 *
 */
@Controller
public class LoginController {
	private static final String WELCOME_MESSAGE = "Welcome ";
	private static final String ADMIN_MESSAGE = "adminMessage";
	private static final String INVALID_PASSWORD_MESSAGE = "Oops!  This is an invalid password reset link.";
	private static final String ADMIN_ONLY_MESSAGE = "Content Available Only for Users with Admin Role";
	private static final String PASSWORD_RESET_MESSAGE = "A password reset link has been sent to ";
	private static final String EMAIL_NOT_FOUND_MESSAGE = "We didn't find an account for that e-mail address.";
	private static final String INVALID_RESET_LINK_MESSAGE = "Oops!  This is an invalid password reset link.";
	private static final String PASSWORD_MISMATCH_MESSAGE = "Oops!  The confirm password and password fields are different!";
	private static final String SUCCESSFULLY_RESET_PASSWORD = "You have successfully reset your password.  You may now login.";
	private static final String MISSING_PARAMETER_IN_PAGE = "Missing parameters in the URL, redirecting to Login page.";

	@Autowired
	private ProfileService profileService;

	@Autowired
	private EmailService emailService;

	Logger logger = LoggerFactory.getLogger(this.getClass());

	@RequestMapping(value = { GenericConstants.LOGIN_URL }, method = RequestMethod.GET)
	public ModelAndView login() {
		ModelAndView modelAndView = new ModelAndView();
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		if (auth != null && !(auth instanceof AnonymousAuthenticationToken)) {
			/* The user is logged in :) */
			logger.info(ProfileServiceConstants.USER_REDIRECTED_TO_DASHBOARD_MESSAGE + auth.getPrincipal().toString());
			modelAndView.setViewName(GenericConstants.REDIRECT_VIEW_NAME_OBJECT + GenericConstants.DASHBOARD_HOME_URL);
		} else {
			modelAndView.setViewName(ProfileServiceConstants.LOGIN_VIEWNAME_OBJECT);
		}
		return modelAndView;
	}

	@RequestMapping(value = GenericConstants.SIGNUP_URL, method = RequestMethod.GET)
	public ModelAndView signUp() {
		ModelAndView modelAndView = new ModelAndView();
		Profile profile = new Profile();
		modelAndView.addObject(ProfileServiceConstants.PROFILE_MODEL_OBJECT, profile);
		modelAndView.setViewName(ProfileServiceConstants.SIGNUP_VIEWNAME_OBJECT);
		return modelAndView;
	}

	@RequestMapping(value = GenericConstants.SIGNUP_URL, method = RequestMethod.POST)
	public ModelAndView createNewUser(@Valid Profile profile, BindingResult bindingResult, HttpServletRequest request,
			HttpServletResponse response) {
		ModelAndView modelAndView = new ModelAndView();
		String email = profile.getEmail();
		String unencryptedPassword = profile.getPassword();
		Optional<Profile> userExists = profileService.findUserByEmail(profile.getEmail());
		if (userExists.isPresent()) {
			bindingResult.rejectValue(ProfileServiceConstants.EMAIL_OBJECT, ProfileServiceConstants.EMAIL_USER_OBJECT,
					ProfileServiceConstants.USER_ALREADY_REGISTERED_MESSAGE);
			logger.warn(email + ProfileServiceConstants.USER_ALREADY_REGISTERED_MESSAGE);
		}
		if (bindingResult.hasErrors()) {
			modelAndView.setViewName(ProfileServiceConstants.SIGNUP_VIEWNAME_OBJECT);
			logger.error(bindingResult.getAllErrors().toString());
		} else {
			profileService.saveUser(profile);

			profileService.autoLogin(request, email, unencryptedPassword);

			// Email message
			SimpleMailMessage passwordResetEmail = new SimpleMailMessage();
			passwordResetEmail.setFrom(GenericConstants.FROM_EMAIL);
			passwordResetEmail.setTo(profile.getEmail());
			passwordResetEmail.setSubject(GenericConstants.USER_REGISTERED_SUCCESSFULLY_SUBJECT);
			// TODO Email Template welcoming the user
			passwordResetEmail.setText(ProfileServiceConstants.USER_REGISTERED_SUCCESSFULLY_MESSAGE);

			emailService.sendEmail(passwordResetEmail);

			modelAndView.addObject(ProfileServiceConstants.SUCCESS_MESSAGE_OBJECT,
					ProfileServiceConstants.USER_REGISTERED_SUCCESSFULLY_MESSAGE);
			modelAndView.addObject(ProfileServiceConstants.PROFILE_MODEL_OBJECT, new Profile());
			modelAndView.setViewName(GenericConstants.REDIRECT_VIEW_NAME_OBJECT + GenericConstants.DASHBOARD_HOME_URL);

		}
		return modelAndView;
	}

	@RequestMapping(value = GenericConstants.ADMIN_HOME_URL, method = RequestMethod.GET)
	public ModelAndView home() {
		ModelAndView modelAndView = new ModelAndView();
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Optional<Profile> profile = profileService.findUserByEmail(auth.getName());
		modelAndView.addObject(ProfileServiceConstants.USERNAME_OBJECT, WELCOME_MESSAGE + profile.get().getName());
		modelAndView.addObject(ADMIN_MESSAGE, ADMIN_ONLY_MESSAGE);
		modelAndView.setViewName(ProfileServiceConstants.ADMIN_HOME_VIEWNAME_OBJECT);
		return modelAndView;
	}

	// Display forgotPassword page
	@RequestMapping(value = GenericConstants.FORGOT_PASSWORD_URL, method = RequestMethod.GET)
	public ModelAndView displayForgotPasswordPage() {
		return new ModelAndView(ProfileServiceConstants.FORGOT_PASSWORD_OBJECT);
	}

	// Process form submission from forgotPassword page
	@RequestMapping(value = GenericConstants.FORGOT_PASSWORD_URL, method = RequestMethod.POST)
	public ModelAndView processForgotPasswordForm(ModelAndView modelAndView,
			@RequestParam(ProfileServiceConstants.User.EMAIL) String userEmail, HttpServletRequest request) {

		// Lookup user in database by e-mail
		Optional<Profile> optional = profileService.findUserByEmail(userEmail);

		if (!optional.isPresent()) {
			modelAndView.addObject(GenericConstants.ERROR_MESSAGE_OBJECT, EMAIL_NOT_FOUND_MESSAGE);
			logger.error(optional.get() + GenericConstants.SPACE_CHARACTER + EMAIL_NOT_FOUND_MESSAGE);
		} else {

			// Generate random 36-character string token for reset password
			Profile user = optional.get();
			user.setResetToken(UUID.randomUUID().toString());

			// Save token to database
			profileService.saveUser(user);

			String appUrl = request.getScheme() + GenericConstants.HTTP_POSTFIX + request.getServerName();

			// Email message
			SimpleMailMessage passwordResetEmail = new SimpleMailMessage();
			passwordResetEmail.setFrom(GenericConstants.FROM_EMAIL);
			passwordResetEmail.setTo(user.getEmail());
			passwordResetEmail.setSubject(GenericConstants.PASSWORD_RESET_SUBJECT);
			passwordResetEmail
					.setText(GenericConstants.PASSWORD_RESET_BODY + appUrl + GenericConstants.RESET_PASSWORD_URL
							+ GenericConstants.RESET_PASSWORD_TOKEN_PARAMETER + user.getResetToken());

			emailService.sendEmail(passwordResetEmail);

			// Add success message to view
			modelAndView.addObject(ProfileServiceConstants.SUCCESS_MESSAGE_OBJECT, PASSWORD_RESET_MESSAGE + userEmail);
		}

		modelAndView.setViewName(ProfileServiceConstants.FORGOT_PASSWORD_OBJECT);
		return modelAndView;

	}

	// Display form to reset password
	@RequestMapping(value = GenericConstants.RESET_PASSWORD_URL, method = RequestMethod.GET)
	public ModelAndView displayResetPasswordPage(ModelAndView modelAndView,
			@RequestParam(ProfileServiceConstants.TOKEN_PARAM) String token) {

		Optional<Profile> user = profileService.findUserByResetToken(token);

		if (user.isPresent()) { // Token found in DB
			modelAndView.addObject(ProfileServiceConstants.RESET_TOKEN_OBJECT, token);
		} else { // Token not found in DB
			modelAndView.addObject(GenericConstants.ERROR_MESSAGE_OBJECT, INVALID_RESET_LINK_MESSAGE);
			logger.error(user.get() + GenericConstants.SPACE_CHARACTER + INVALID_RESET_LINK_MESSAGE);
		}

		modelAndView.setViewName(ProfileServiceConstants.RESET_PASSWORD_OBJECT);
		return modelAndView;
	}

	// Process reset password form
	@RequestMapping(value = GenericConstants.RESET_PASSWORD_URL, method = RequestMethod.POST)
	public ModelAndView setNewPassword(ModelAndView modelAndView, @RequestParam Map<String, String> requestParams,
			RedirectAttributes redir) {

		if (ERStringUtils.notEqualsIgnoreCase(requestParams.get(ProfileServiceConstants.PASSWORD_PARAM),
				requestParams.get(ProfileServiceConstants.CONFIRM_PASSWORD_PARAM))) {
			modelAndView.addObject(GenericConstants.ERROR_MESSAGE_OBJECT, PASSWORD_MISMATCH_MESSAGE);
			modelAndView.addObject(ProfileServiceConstants.RESET_TOKEN_OBJECT,
					requestParams.get(ProfileServiceConstants.TOKEN_PARAM));
			modelAndView.setViewName(ProfileServiceConstants.RESET_PASSWORD_OBJECT);
			return modelAndView;
		}
		// Find the user associated with the reset token
		Optional<Profile> user = profileService
				.findUserByResetToken(requestParams.get(ProfileServiceConstants.TOKEN_PARAM));

		// This should always be non-null but we check just in case
		if (user.isPresent()) {

			Profile resetUser = user.get();

			// Set new password
			resetUser.setPassword(requestParams.get(ProfileServiceConstants.PASSWORD_PARAM));

			// Set the reset token to null so it cannot be used again
			resetUser.setResetToken(null);

			// Save user
			profileService.saveUser(resetUser);

			// In order to set a model attribute on a redirect, we must use
			// RedirectAttributes
			redir.addFlashAttribute(ProfileServiceConstants.SUCCESS_MESSAGE_OBJECT, SUCCESSFULLY_RESET_PASSWORD);

			modelAndView.setViewName(GenericConstants.REDIRECT_VIEW_NAME_OBJECT + GenericConstants.LOGIN_URL);
			return modelAndView;

		} else {
			modelAndView.addObject(GenericConstants.ERROR_MESSAGE_OBJECT, INVALID_PASSWORD_MESSAGE);
			modelAndView.addObject(ProfileServiceConstants.RESET_TOKEN_OBJECT,
					requestParams.get(ProfileServiceConstants.TOKEN_PARAM));
			modelAndView.setViewName(ProfileServiceConstants.RESET_PASSWORD_OBJECT);
			logger.error(user.get() + GenericConstants.SPACE_CHARACTER + INVALID_PASSWORD_MESSAGE);
		}

		return modelAndView;
	}

	// Going to reset page without a token redirects to login page
	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ModelAndView handleMissingParams(MissingServletRequestParameterException ex) {
		logger.error(ex + MISSING_PARAMETER_IN_PAGE);
		return new ModelAndView(GenericConstants.REDIRECT_VIEW_NAME_OBJECT + GenericConstants.LOGIN_URL);
	}
}
