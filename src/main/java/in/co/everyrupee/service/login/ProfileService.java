package in.co.everyrupee.service.login;

import java.security.Principal;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.MessageSource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import in.co.everyrupee.constants.profile.ProfileServiceConstants;
import in.co.everyrupee.exception.login.PasswordNotValidException;
import in.co.everyrupee.exception.login.UserAlreadyExistException;
import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.pojo.login.Role;
import in.co.everyrupee.repository.login.ProfileRepository;
import in.co.everyrupee.repository.login.RoleRepository;
import in.co.everyrupee.security.LoginAttemptService;
import in.co.everyrupee.security.core.userdetails.MyUser;
import in.co.everyrupee.utils.RegexUtils;

/**
 * Handle requests related to user registration and login
 * 
 * @author Nagarjun Nagesh
 *
 */
@Transactional
@Service("profileService")
@CacheConfig(cacheNames = { "users" })
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private LoginAttemptService loginAttemptService;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private MessageSource messages;

    @Autowired
    private RegexUtils regexUtils;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    private static final Pattern[] inputRegexes = new Pattern[4];

    // Compile the regular expression during compile time.
    static {
	inputRegexes[0] = Pattern.compile(".*[A-Z].*");
	inputRegexes[1] = Pattern.compile(".*[a-z].*");
	inputRegexes[2] = Pattern.compile(".*\\d.*");
	inputRegexes[3] = Pattern.compile(".*[`~!@#$%^&*()\\-_=+\\\\|\\[{\\]};:'\",<.>/?].*");
    }

    private static final String ERROR_LOGIN_MESSAGE = "Error while login ";
    Logger logger = LoggerFactory.getLogger(this.getClass());

    @Cacheable
    public Optional<Profile> findUserByEmail(String email) {
	String ip = getClientIP();
	if (getLoginAttemptService().isBlocked(ip)) {
	    throw new RuntimeException("blocked");
	}

	return getProfileRepository().findByEmail(email);
    }

    public Optional<Profile> findUserByResetToken(String resetToken) {
	return getProfileRepository().findByResetToken(resetToken);
    }

    // API
    @CachePut(key = "#profile.email")
    public Profile registerNewUserAccount(final Profile profile) {
	if (emailExists(profile.getEmail())) {
	    throw new UserAlreadyExistException("There is an account with that email adress: " + profile.getEmail());
	}

	boolean passwordValidation = getRegexUtils().isMatchingRegex(profile.getPassword(), inputRegexes);
	if (!passwordValidation) {
	    throw new PasswordNotValidException(
		    getMessages().getMessage("message.passwordNotValidError", null, getRequest().getLocale())
			    + profile.getPassword());
	}

	return saveUser(profile);
    }

    @Cacheable
    private boolean emailExists(final String email) {
	return findUserByEmail(email).isPresent();
    }

    public Profile saveUser(Profile profile) {
	profile.setPassword(getbCryptPasswordEncoder().encode(profile.getPassword()));
	profile.setActive(1);
	profile.setLocale(getMessages().getMessage("message.defaultCurrencyFormat", null, getRequest().getLocale()));
	Role userRole = getRoleRepository().findByRole(ProfileServiceConstants.Role.USER_ROLE);
	profile.setRoles(new HashSet<Role>(Arrays.asList(userRole)));
	return getProfileRepository().save(profile);
    }

    /**
     * Implement auto login functionality
     * 
     * @param email
     * @param password
     */
    public void autoLogin(HttpServletRequest request, String email, String password) {
	try {
	    request.login(email, password);
	} catch (ServletException e) {
	    logger.error(ERROR_LOGIN_MESSAGE, e);
	}
    }

    private String getClientIP() {
	String xfHeader = getRequest().getHeader("X-Forwarded-For");
	if (xfHeader == null) {
	    return getRequest().getRemoteAddr();
	}
	return xfHeader.split(",")[0];
    }

    /**
     * SECURITY: Prevent Unauthorized access by Client Side Data Modification
     * 
     * @param userPrincipal
     * @param financialPortfolioId
     */
    public void validateUser(Principal userPrincipal, String financialPortfolioId) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	if (SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof MyUser) {
	    MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	    int clientSideFinancialPortfolioId = Integer.parseInt(financialPortfolioId);
	    if (user.getFinancialPortfolioId() != clientSideFinancialPortfolioId) {
		throw new SecurityException();
	    }
	}
    }

    public ProfileRepository getProfileRepository() {
	return profileRepository;
    }

    public RoleRepository getRoleRepository() {
	return roleRepository;
    }

    public LoginAttemptService getLoginAttemptService() {
	return loginAttemptService;
    }

    public HttpServletRequest getRequest() {
	return request;
    }

    public MessageSource getMessages() {
	return messages;
    }

    public RegexUtils getRegexUtils() {
	return regexUtils;
    }

    public BCryptPasswordEncoder getbCryptPasswordEncoder() {
	return bCryptPasswordEncoder;
    }

}
