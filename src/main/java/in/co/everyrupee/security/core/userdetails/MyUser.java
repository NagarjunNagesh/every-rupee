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
    // Declare financial Portfoli Id
    private final int financialPortfolioId;

    public MyUser(String email, String password, Collection<? extends GrantedAuthority> authorities, int id,
	    int financialPortfolioId) {
	super(email, password, authorities);
	// Initialize all the custom attributes here like the following.
	this.id = id;
	this.financialPortfolioId = financialPortfolioId;
    }

    /**
     * Get the id.
     * 
     * @return the id
     */
    public int getId() {
	return id;
    }

    public int getFinancialPortfolioId() {
	return financialPortfolioId;
    }
}
