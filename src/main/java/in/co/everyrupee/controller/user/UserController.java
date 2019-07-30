package in.co.everyrupee.controller.user;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.security.core.userdetails.MyUser;
import in.co.everyrupee.service.login.ProfileService;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private ProfileService profileService;

    // Delete a User Transaction
    @GetMapping("/")
    public Map<String, Object> fetchUsersById(Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	Optional<Profile> profile = profileService.findUserByEmail(user.getUsername());

	if (!profile.isPresent()) {
	    return null;
	}

	Map<String, Object> profileInformation = new HashMap<String, Object>();
	profileInformation.put("financialPortfolioId", profile.get().getFinancialPortfolioId());
	profileInformation.put("locale", profile.get().getLocale());

	return profileInformation;
    }

    // TODO Updates locale for the current user

}
