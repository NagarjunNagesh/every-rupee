package in.co.everyrupee.security.core.userdetails;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;

/**
 * User with Id to be used for user transactions API
 *
 * @author Nagarjun Nagesh
 *
 */
public class MyUser extends org.springframework.security.core.userdetails.User {

    private static final long serialVersionUID = -5009936028696292466L;
    // Declare all custom attributes here
    private final int id;

    public MyUser(String email, String password, Collection<? extends GrantedAuthority> authorities, int id) {
	super(email, password, authorities);
	// Initialize all the custom attributes here like the following.
	this.id = id;
    }

    /**
     * Get the id.
     * 
     * @return the id
     */
    public int getId() {
	return id;
    }
}
