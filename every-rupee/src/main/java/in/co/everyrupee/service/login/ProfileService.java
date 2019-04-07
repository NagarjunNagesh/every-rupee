package in.co.everyrupee.service.login;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import in.co.everyrupee.constants.profile.ProfileServiceConstants;
import in.co.everyrupee.exception.login.UserAlreadyExistException;
import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.pojo.login.Role;
import in.co.everyrupee.repository.login.ProfileRepository;
import in.co.everyrupee.repository.login.RoleRepository;
import in.co.everyrupee.security.LoginAttemptService;

/**
 * @author Nagarjun Nagesh
 *
 */
@Service("profileService")
public class ProfileService {

	private ProfileRepository profileRepository;
	private RoleRepository roleRepository;
	private BCryptPasswordEncoder bCryptPasswordEncoder;

	@Autowired
	private LoginAttemptService loginAttemptService;

	@Autowired
	private HttpServletRequest request;

	private static final String ERROR_LOGIN_MESSAGE = "Error while login ";
	Logger logger = LoggerFactory.getLogger(this.getClass());

	@Autowired
	public ProfileService(ProfileRepository userRepository, RoleRepository roleRepository,
			BCryptPasswordEncoder bCryptPasswordEncoder) {
		this.profileRepository = userRepository;
		this.roleRepository = roleRepository;
		this.bCryptPasswordEncoder = bCryptPasswordEncoder;
	}

	public Optional<Profile> findUserByEmail(String email) {
		String ip = getClientIP();
		if (loginAttemptService.isBlocked(ip)) {
			throw new RuntimeException("blocked");
		}

		return profileRepository.findByEmail(email);
	}

	public Optional<Profile> findUserByResetToken(String resetToken) {
		return profileRepository.findByResetToken(resetToken);
	}

	// API

	public Profile registerNewUserAccount(final Profile profile) {
		if (emailExists(profile.getEmail())) {
			throw new UserAlreadyExistException("There is an account with that email adress: " + profile.getEmail());
		}

		return saveUser(profile);
	}

	private boolean emailExists(final String email) {
		return findUserByEmail(email).isPresent();
	}

	public Profile saveUser(Profile profile) {
		profile.setPassword(bCryptPasswordEncoder.encode(profile.getPassword()));
		profile.setActive(1);
		// TODO Change the Admin role to User Role Add script to add roles
		Role userRole = roleRepository.findByRole(ProfileServiceConstants.Role.ADMIN_ROLE);
		profile.setRoles(new HashSet<Role>(Arrays.asList(userRole)));
		return profileRepository.save(profile);
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
		String xfHeader = request.getHeader("X-Forwarded-For");
		if (xfHeader == null) {
			return request.getRemoteAddr();
		}
		return xfHeader.split(",")[0];
	}

}
