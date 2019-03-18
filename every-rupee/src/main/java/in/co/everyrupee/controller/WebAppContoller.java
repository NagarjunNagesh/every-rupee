package in.co.everyrupee.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.Date;

@Controller
public class WebAppContoller {
    private String appMode;

    @Autowired
    public WebAppContoller(Environment environment){
        appMode = environment.getProperty("app-mode");
    }

    @RequestMapping("/")
    public String index(Model model){
        model.addAttribute("datetime", new Date());
        model.addAttribute("username", "NagarjunNagesh");
        model.addAttribute("projectname", "WebApp");

        model.addAttribute("mode", appMode);

        return "index";
    }
    
    @RequestMapping("/about")
    public String about(Model model){
        model.addAttribute("datetime", new Date());
        model.addAttribute("username", "NagarjunNagesh");
        model.addAttribute("projectname", "WebApp");

        model.addAttribute("mode", appMode);

        return "about";
    }
    
}
