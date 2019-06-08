/**
 * 
 */
package in.co.everyrupee.repository.login;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.co.everyrupee.pojo.login.Profile;

/**
 * Access user table to fetch the data about the user.
 * 
 * @author Nagarjun Nagesh
 *
 */
@Repository("profileRepository")
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByEmail(String email);

    Optional<Profile> findByResetToken(String resetToken);
}
