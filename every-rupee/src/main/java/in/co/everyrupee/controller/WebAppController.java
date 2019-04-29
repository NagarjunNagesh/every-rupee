package in.co.everyrupee.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.constants.profile.ProfileServiceConstants;
import in.co.everyrupee.pojo.login.Profile;

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
	public ModelAndView dashboardHome() {
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.setViewName(GenericConstants.DASHBOARD_HOME_VIEW_NAME_OBJECT);
		return modelAndView;
	}

}
