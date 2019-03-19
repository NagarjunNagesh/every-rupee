package in.co.everyrupee.controller.login;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import in.co.everyrupee.constants.profile.GenericConstants;
import in.co.everyrupee.constants.profile.ProfileServiceConstants;
import in.co.everyrupee.pojo.login.Profile;
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

	    @RequestMapping(value = {GenericConstants.LOGIN_URL}, method = RequestMethod.GET)
	    public ModelAndView login(){
	        ModelAndView modelAndView = new ModelAndView();
	        modelAndView.setViewName(ProfileServiceConstants.LOGIN_VIEWNAME_OBJECT);
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
	        Profile userExists = profileService.findUserByEmail(profile.getEmail());
	        if (userExists != null) {
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
	        Profile profile = profileService.findUserByEmail(auth.getName());
	        modelAndView.addObject(ProfileServiceConstants.USERNAME_OBJECT, WELCOME_MESSAGE + profile.getName());
	        modelAndView.addObject(ADMIN_MESSAGE,ADMIN_ONLY_MESSAGE);
	        modelAndView.setViewName(ProfileServiceConstants.ADMIN_HOME_VIEWNAME_OBJECT);
	        return modelAndView;
	    }

}
