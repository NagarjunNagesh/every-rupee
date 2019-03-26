package in.co.everyrupee.service.login;

import in.co.everyrupee.constants.profile.ProfileServiceConstants;
import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.pojo.login.Role;
import in.co.everyrupee.repository.login.ProfileRepository;
import in.co.everyrupee.repository.login.RoleRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;


/**
 * @author Nagarjun Nagesh
 *
 */
@Service("profileService")
public class ProfileService {

    private ProfileRepository profileRepository;
    private RoleRepository roleRepository;
    private BCryptPasswordEncoder bCryptPasswordEncoder;
    private static final String ERROR_LOGIN_MESSAGE = "Error while login ";
    Logger logger = LoggerFactory.getLogger(this.getClass());
    

    @Autowired
    public ProfileService(ProfileRepository userRepository,
                       RoleRepository roleRepository,
                       BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.profileRepository = userRepository;
        this.roleRepository = roleRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    public Optional<Profile> findUserByEmail(String email) {
        return profileRepository.findByEmail(email);
    }
    
    public Optional<Profile> findUserByResetToken(String resetToken) {
		return profileRepository.findByResetToken(resetToken);
	}

    public void saveUser(Profile profile) {
        profile.setPassword(bCryptPasswordEncoder.encode(profile.getPassword()));
        profile.setActive(1);
        //TODO Change the Admin role to User Role Add script to add roles
		Role userRole = roleRepository.findByRole(ProfileServiceConstants.Role.ADMIN_ROLE);
        profile.setRoles(new HashSet<Role>(Arrays.asList(userRole)));
        profileRepository.save(profile);
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
    
    public String randomPasswordSocialLogin(int passwordLength) {
    	String randomPassword = UUID.randomUUID().toString().substring(0, passwordLength-1);
    	return bCryptPasswordEncoder.encode(randomPassword);
    }

}
