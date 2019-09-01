package in.co.everyrupee.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import in.co.everyrupee.pojo.login.Profile;
import in.co.everyrupee.pojo.login.Role;
import in.co.everyrupee.repository.login.ProfileRepository;
import in.co.everyrupee.security.core.userdetails.MyUser;

/**
 * Check if the user is blocked and / if the user is not found
 * 
 * @author Nagarjun Nagesh
 *
 */
@Service("userDetailsService")
@Transactional
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private LoginAttemptService loginAttemptService;

    @Autowired
    private HttpServletRequest request;

    @Override
    public UserDetails loadUserByUsername(final String email) throws UsernameNotFoundException {
	final String ip = getClientIP();
	if (loginAttemptService.isBlocked(ip)) {
	    throw new RuntimeException("blocked");
	}

	try {
	    final Optional<Profile> user = profileRepository.findByEmail(email);
	    if (!user.isPresent()) {
		throw new UsernameNotFoundException("No user found with username: " + email);
	    }

	    return new MyUser(user.get().getEmail(), user.get().getPassword(), getAuthorities(user.get().getRoles()),
		    user.get());
	} catch (final Exception e) {
	    throw new RuntimeException(e);
	}
    }

    private final Collection<? extends GrantedAuthority> getAuthorities(final Collection<Role> roles) {
	return getGrantedAuthorities(getRoles(roles));
    }

    private final List<String> getRoles(final Collection<Role> roles) {
	final List<String> rolesList = new ArrayList<String>();
	for (final Role role : roles) {
	    rolesList.add(role.getRole());
	}
	return rolesList;
    }

    private final List<GrantedAuthority> getGrantedAuthorities(final List<String> rolesList) {
	final List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
	for (final String roles : rolesList) {
	    authorities.add(new SimpleGrantedAuthority(roles));
	}
	return authorities;
    }

    private final String getClientIP() {
	final String xfHeader = request.getHeader("X-Forwarded-For");
	if (xfHeader == null) {
	    return request.getRemoteAddr();
	}
	return xfHeader.split(",")[0];
    }

}
