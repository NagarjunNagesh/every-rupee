package in.co.everyrupee.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import in.co.everyrupee.constants.GenericConstants;

@Controller
public class DashboardController {

    @Autowired
    public DashboardController(Environment environment) {
    }

    @RequestMapping(GenericConstants.DASHBOARD_INCOME_URL)
    public ModelAndView dashboardIncome() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.setViewName(GenericConstants.DASHBOARD_INCOME_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    @RequestMapping(GenericConstants.DASHBOARD_SAVINGS_URL)
    public ModelAndView dashboardSavings() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.setViewName(GenericConstants.DASHBOARD_SAVINGS_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    @RequestMapping(GenericConstants.DASHBOARD_DEBT_URL)
    public ModelAndView dashboardDebt() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.setViewName(GenericConstants.DASHBOARD_DEBT_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    @RequestMapping(GenericConstants.DASHBOARD_INVESTMENT_URL)
    public ModelAndView dashboardInvestment() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.setViewName(GenericConstants.DASHBOARD_INVESTMENT_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    @RequestMapping(GenericConstants.DASHBOARD_SETTINGS_URL)
    public ModelAndView dashboardSettings() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.setViewName(GenericConstants.DASHBOARD_SETTINGS_VIEW_NAME_OBJECT);
	return modelAndView;
    }

    @RequestMapping(GenericConstants.DASHBOARD_PROFILE_URL)
    public ModelAndView dashboardProfile() {
	ModelAndView modelAndView = new ModelAndView();
	modelAndView.setViewName(GenericConstants.DASHBOARD_PROFILE_VIEW_NAME_OBJECT);
	return modelAndView;
    }
}
