package in.co.everyrupee.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.utils.GenericResponse;

@Controller
public class DashboardController {

    @Value("${spring.profiles.active}")
    private String springActiveProfile;

    @Autowired
    public DashboardController(Environment environment) {
    }

    /**
     * Load the Dashboard Transactions Page
     * 
     * @return
     */
    @RequestMapping(GenericConstants.DASHBOARD_TRANSACTIONS_URL)
    public ModelAndView dashboardIncome() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.addObject(GenericConstants.ENVIRONMENT_ACTIVE, springActiveProfile);
	modelAndView.setViewName(GenericConstants.DASHBOARD_TRANSACTIONS_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    /**
     * Load the Dashboard Goals Page
     * 
     * @return
     */
    @RequestMapping(GenericConstants.DASHBOARD_GOALS_URL)
    public ModelAndView dashboardSavings() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.addObject(GenericConstants.ENVIRONMENT_ACTIVE, springActiveProfile);
	modelAndView.setViewName(GenericConstants.DASHBOARD_GOALS_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    /**
     * Load the Dashboard budget Page
     * 
     * @return
     */
    @RequestMapping(GenericConstants.DASHBOARD_BUDGET_URL)
    public ModelAndView dashboardDebt() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.addObject(GenericConstants.ENVIRONMENT_ACTIVE, springActiveProfile);
	modelAndView.setViewName(GenericConstants.DASHBOARD_BUDGET_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    /**
     * Load the Dashboard Investment Page
     * 
     * @return
     */
    @RequestMapping(GenericConstants.DASHBOARD_INVESTMENT_URL)
    public ModelAndView dashboardInvestment() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.addObject(GenericConstants.ENVIRONMENT_ACTIVE, springActiveProfile);
	modelAndView.setViewName(GenericConstants.DASHBOARD_INVESTMENT_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    /**
     * Load the Dashboard Settings Page
     * 
     * @return
     */
    @RequestMapping(GenericConstants.DASHBOARD_SETTINGS_URL)
    public ModelAndView dashboardSettings() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.addObject(GenericConstants.ENVIRONMENT_ACTIVE, springActiveProfile);
	modelAndView.setViewName(GenericConstants.DASHBOARD_SETTINGS_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    /**
     * Load the Dashboard Profile Page
     * 
     * @return
     */
    @RequestMapping(GenericConstants.DASHBOARD_PROFILE_URL)
    public ModelAndView dashboardProfile() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.addObject(GenericConstants.ENVIRONMENT_ACTIVE, springActiveProfile);
	modelAndView.setViewName(GenericConstants.DASHBOARD_PROFILE_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    /**
     * Load the Dashboard Overview Page
     * 
     * @return
     */
    @RequestMapping(GenericConstants.DASHBOARD_OVERVIEW_URL)
    public ModelAndView dashboardOverview() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.addObject(GenericConstants.ENVIRONMENT_ACTIVE, springActiveProfile);
	modelAndView.setViewName(GenericConstants.DASHBOARD_OVERVIEW_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    /**
     * Checks if the session is alive from the server.
     * 
     * @param userPrincipal
     * @return
     */
    @ResponseBody
    @RequestMapping(value = GenericConstants.KEEP_ALIVE_CHECK_URL, method = RequestMethod.GET)
    public GenericResponse keepAliveCheck(Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	return new GenericResponse("success");

    }

}
