package in.co.everyrupee.controller.login;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import in.co.everyrupee.constants.profile.GenericConstants;
import in.co.everyrupee.constants.profile.ProfileServiceConstants;
import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.service.email.EmailService;
import in.co.everyrupee.service.login.ProfileService;

/**
 * @author nagarjun
 *
 */
@Controller
public class LoginController {
		private static final String WELCOME_MESSAGE = "Welcome ";
		private static final String ADMIN_MESSAGE = "adminMessage";
		private static final String ADMIN_ONLY_MESSAGE = "Content Available Only for Users with Admin Role";

	
	    @Autowired
	    private ProfileService profileService;
	    
	    @Autowired
		private EmailService emailService;

		@Autowired
		private BCryptPasswordEncoder bCryptPasswordEncoder;

	    @RequestMapping(value = {GenericConstants.LOGIN_URL}, method = RequestMethod.GET)
	    public ModelAndView login(){
	        ModelAndView modelAndView = new ModelAndView();
	        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

	        if (auth != null && !(auth instanceof AnonymousAuthenticationToken)) {
	            /* The user is logged in :) */
	        	modelAndView.setViewName(ProfileServiceConstants.REDIRECT_VIEW_NAME_OBJECT + ProfileServiceConstants.ADMIN_HOME_VIEWNAME_OBJECT);
	        } else {
	        	modelAndView.setViewName(ProfileServiceConstants.LOGIN_VIEWNAME_OBJECT);
	        }
	        return modelAndView;
	    }


	    @RequestMapping(value = GenericConstants.SIGNUP_URL, method = RequestMethod.GET)
	    public ModelAndView signUp(){
	        ModelAndView modelAndView = new ModelAndView();
	        Profile profile = new Profile();
	        modelAndView.addObject(ProfileServiceConstants.PROFILE_MODEL_OBJECT, profile);
	        modelAndView.setViewName(ProfileServiceConstants.SIGNUP_VIEWNAME_OBJECT);
	        return modelAndView;
	    }

	    @RequestMapping(value = GenericConstants.SIGNUP_URL, method = RequestMethod.POST)
	    public ModelAndView createNewUser(@Valid Profile profile, BindingResult bindingResult) {
	        ModelAndView modelAndView = new ModelAndView();
	        Optional<Profile> userExists = profileService.findUserByEmail(profile.getEmail());
	        if (userExists.isPresent()) {
	            bindingResult
	                    .rejectValue(ProfileServiceConstants.EMAIL_OBJECT, ProfileServiceConstants.EMAIL_USER_OBJECT,
	                    		ProfileServiceConstants.USER_ALREADY_REGISTERED_MESSAGE);
	        }
	        if (bindingResult.hasErrors()) {
	            modelAndView.setViewName(ProfileServiceConstants.SIGNUP_VIEWNAME_OBJECT);
	        } else {
	            profileService.saveUser(profile);
	            modelAndView.addObject(ProfileServiceConstants.SUCCESS_MESSAGE_OBJECT, ProfileServiceConstants.USER_REGISTERED_SUCCESSFULLY_MESSAGE);
	            modelAndView.addObject(ProfileServiceConstants.PROFILE_MODEL_OBJECT, new Profile());
	            modelAndView.setViewName(ProfileServiceConstants.SIGNUP_VIEWNAME_OBJECT);

	        }
	        return modelAndView;
	    }

	    @RequestMapping(value = GenericConstants.ADMIN_HOME_URL, method = RequestMethod.GET)
	    public ModelAndView home(){
	        ModelAndView modelAndView = new ModelAndView();
	        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
	        Optional<Profile> profile = profileService.findUserByEmail(auth.getName());
	        modelAndView.addObject(ProfileServiceConstants.USERNAME_OBJECT, WELCOME_MESSAGE + profile.get().getName());
	        modelAndView.addObject(ADMIN_MESSAGE,ADMIN_ONLY_MESSAGE);
	        modelAndView.setViewName(ProfileServiceConstants.ADMIN_HOME_VIEWNAME_OBJECT);
	        return modelAndView;
	    }

	    // Display forgotPassword page
		@RequestMapping(value = "/forgot-password", method = RequestMethod.GET)
		public ModelAndView displayForgotPasswordPage() {
			return new ModelAndView("forgot-password");
		}
		
		// Process form submission from forgotPassword page
		@RequestMapping(value = "/forgot-password", method = RequestMethod.POST)
		public ModelAndView processForgotPasswordForm(ModelAndView modelAndView, @RequestParam(ProfileServiceConstants.User.EMAIL) String userEmail, HttpServletRequest request) {
		
			// Lookup user in database by e-mail
			Optional<Profile> optional = profileService.findUserByEmail(userEmail);
		
			if (!optional.isPresent()) {
				modelAndView.addObject("errorMessage", "We didn't find an account for that e-mail address.");
			} else {
				
				// Generate random 36-character string token for reset password 
				Profile user = optional.get();
				user.setResetToken(UUID.randomUUID().toString());
		
				// Save token to database
				profileService.saveUser(user);
		
				String appUrl = request.getScheme() + "://" + request.getServerName();
				
				// Email message
				SimpleMailMessage passwordResetEmail = new SimpleMailMessage();
				passwordResetEmail.setFrom("support@demo.com");
				passwordResetEmail.setTo(user.getEmail());
				passwordResetEmail.setSubject("Password Reset Request");
				passwordResetEmail.setText("To reset your password, click the link below:\n" + appUrl
						+ "/reset-password?token=" + user.getResetToken());
				
				emailService.sendEmail(passwordResetEmail);
		
				// Add success message to view
				modelAndView.addObject("successMessage", "A password reset link has been sent to " + userEmail);
			}
		
			modelAndView.setViewName("forgot-password");
			return modelAndView;
		
		}
		
		// Display form to reset password
		@RequestMapping(value = "/reset-password", method = RequestMethod.GET)
		public ModelAndView displayResetPasswordPage(ModelAndView modelAndView, @RequestParam("token") String token) {
			
			Optional<Profile> user = profileService.findUserByResetToken(token);
		
			if (user.isPresent()) { // Token found in DB
				modelAndView.addObject("resetToken", token);
			} else { // Token not found in DB
				modelAndView.addObject("errorMessage", "Oops!  This is an invalid password reset link.");
			}
		
			modelAndView.setViewName("reset-password");
			return modelAndView;
		}
		
		// Process reset password form
		@RequestMapping(value = "/reset-password", method = RequestMethod.POST)
		public ModelAndView setNewPassword(ModelAndView modelAndView, @RequestParam Map<String, String> requestParams, RedirectAttributes redir) {
		
			// Find the user associated with the reset token
			Optional<Profile> user = profileService.findUserByResetToken(requestParams.get("token"));
		
			// This should always be non-null but we check just in case
			if (user.isPresent()) {
				
				Profile resetUser = user.get(); 
		        
				// Set new password    
		        resetUser.setPassword(bCryptPasswordEncoder.encode(requestParams.get("password")));
		        
				// Set the reset token to null so it cannot be used again
				resetUser.setResetToken(null);
		
				// Save user
				profileService.saveUser(resetUser);
		
				// In order to set a model attribute on a redirect, we must use
				// RedirectAttributes
				redir.addFlashAttribute("successMessage", "You have successfully reset your password.  You may now login.");
		
				modelAndView.setViewName("redirect:login");
				return modelAndView;
				
			} else {
				modelAndView.addObject("errorMessage", "Oops!  This is an invalid password reset link.");
				modelAndView.setViewName("reset-password");	
				}
				
				return modelAndView;
		   }
		   
		// Going to reset page without a token redirects to login page
		@ExceptionHandler(MissingServletRequestParameterException.class)
		public ModelAndView handleMissingParams(MissingServletRequestParameterException ex) {
			return new ModelAndView("redirect:/login");
		}
}
