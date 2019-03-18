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

import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.service.login.ProfileService;

/**
 * @author nagarjun
 *
 */
@Controller
public class LoginController {

	
	    @Autowired
	    private ProfileService profileService;

	    @RequestMapping(value={"/login"}, method = RequestMethod.GET)
	    public ModelAndView login(){
	        ModelAndView modelAndView = new ModelAndView();
	        modelAndView.setViewName("login");
	        return modelAndView;
	    }


	    @RequestMapping(value="/sign-up", method = RequestMethod.GET)
	    public ModelAndView signUp(){
	        ModelAndView modelAndView = new ModelAndView();
	        Profile profile = new Profile();
	        modelAndView.addObject("profile", profile);
	        modelAndView.setViewName("sign-up");
	        return modelAndView;
	    }

	    @RequestMapping(value = "/sign-up", method = RequestMethod.POST)
	    public ModelAndView createNewUser(@Valid Profile profile, BindingResult bindingResult) {
	        ModelAndView modelAndView = new ModelAndView();
	        Profile userExists = profileService.findUserByEmail(profile.getEmail());
	        if (userExists != null) {
	            bindingResult
	                    .rejectValue("email", "error.user",
	                            "There is already a user registered with the email provided");
	        }
	        if (bindingResult.hasErrors()) {
	            modelAndView.setViewName("sign-up");
	        } else {
	            profileService.saveUser(profile);
	            modelAndView.addObject("successMessage", "User has been registered successfully");
	            modelAndView.addObject("profile", new Profile());
	            modelAndView.setViewName("sign-up");

	        }
	        return modelAndView;
	    }

	    @RequestMapping(value="/admin/home", method = RequestMethod.GET)
	    public ModelAndView home(){
	        ModelAndView modelAndView = new ModelAndView();
	        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
	        Profile profile = profileService.findUserByEmail(auth.getName());
	        modelAndView.addObject("userName", "Welcome " + profile.getName() + " (" + profile.getEmail() + ")");
	        modelAndView.addObject("adminMessage","Content Available Only for Users with Admin Role");
	        modelAndView.setViewName("admin/home");
	        return modelAndView;
	    }

}
