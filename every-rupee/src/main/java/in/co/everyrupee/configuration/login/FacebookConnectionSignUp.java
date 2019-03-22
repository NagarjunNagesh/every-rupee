/**
 * 
 */
package in.co.everyrupee.configuration.login;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.social.connect.Connection;
import org.springframework.social.connect.ConnectionSignUp;
import org.springframework.stereotype.Service;

import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.repository.login.ProfileRepository;
import in.co.everyrupee.service.login.ProfileService;

/**
 * @author nagarjun
 *
 */
@Service
public class FacebookConnectionSignUp implements ConnectionSignUp {
 
    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private ProfileService profileService;
 
    @Override
    public String execute(Connection<?> connection) {
        Profile profile = new Profile();
        profile.setName(connection.getDisplayName());
        profile.setPassword(profileService.randomPasswordSocialLogin(8));
        profileRepository.save(profile);
        return profile.getName();
    }
}