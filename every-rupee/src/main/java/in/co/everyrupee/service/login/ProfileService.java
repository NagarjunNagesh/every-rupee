package in.co.everyrupee.service.login;

import in.co.everyrupee.constants.profile.ProfileServiceConstants;
import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.pojo.login.Role;
import in.co.everyrupee.repository.login.ProfileRepository;
import in.co.everyrupee.repository.login.RoleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;


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
        //TODO Change the Admin role to User Role
		Role userRole = roleRepository.findByRole(ProfileServiceConstants.Role.ADMIN_ROLE);
        profile.setRoles(new HashSet<Role>(Arrays.asList(userRole)));
        profileRepository.save(profile);
    }

}