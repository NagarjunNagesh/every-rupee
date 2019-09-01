package in.co.everyrupee.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.constants.profile.ProfileServiceConstants;
import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.security.core.userdetails.MyUser;

@Controller
public class WebAppController {

    @Autowired
    public WebAppController(Environment environment) {
    }

    @RequestMapping(GenericConstants.HOME_URL)
    public ModelAndView index() {
	ModelAndView modelAndView = new ModelAndView();
	Profile profile = new Profile();
	modelAndView.addObject(ProfileServiceConstants.PROFILE_MODEL_OBJECT, profile);
	modelAndView.setViewName(GenericConstants.INDEX_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    @RequestMapping(GenericConstants.ABOUT_URL)
    public ModelAndView about() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.setViewName(GenericConstants.ABOUT_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    @RequestMapping(GenericConstants.DASHBOARD_HOME_URL)
    public ModelAndView dashboardHome(Principal userPrincipal) {
	MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.setViewName(GenericConstants.DASHBOARD_HOME_VIEW_NAME_OBJECT);
	modelAndView.addObject(ProfileServiceConstants.PROFILE_NAME_PROP, user.getName());
	return modelAndView;
    }

}
