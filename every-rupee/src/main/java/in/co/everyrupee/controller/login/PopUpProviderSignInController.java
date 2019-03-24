package in.co.everyrupee.controller.login;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Opens a Popup for Social Signon
 * 
 * @author Nagarjun Nagesh
 *
 */
@Controller
public class PopUpProviderSignInController {

    private static final String POPUP_VIEW = "socialPopUp";

    @RequestMapping( value = "/signin/{provider}/popup", method = 
      RequestMethod.GET )
    public String openPopUp( Model model, @PathVariable( "provider"
      ) String provider ) {
        model.addAttribute( "provider", provider );
        return POPUP_VIEW;
    }
    
    @RequestMapping(value = "/signin/popup/close", method =  RequestMethod.GET)
    public String closePopUp( Model model ) {
        model.addAttribute( "closeWindow", true );
        return POPUP_VIEW;
    } 
} 
