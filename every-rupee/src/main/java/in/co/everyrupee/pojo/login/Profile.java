/**
 * 
 */
package in.co.everyrupee.pojo.login;

import org.hibernate.validator.constraints.Length;

import in.co.everyrupee.constants.profile.ProfileServiceConstants;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import java.util.Set;


/**
 * Creating a bean for a user
 * 
 * @author Nagarjun Nagesh
 *
 */
@Entity
@Table(name = ProfileServiceConstants.User.USER_TABLE_NAME)
public class Profile {

	    @Id
	    @GeneratedValue(strategy = GenerationType.AUTO)
	    @Column(name = ProfileServiceConstants.User.USER_ID)
	    private int id;
	    @Column(name = ProfileServiceConstants.User.EMAIL)
	    @Email(message = ProfileServiceConstants.VALID_EMAIL_MESSAGE)
	    @NotEmpty(message = ProfileServiceConstants.EMPTY_EMAIL_MESSAGE)
	    private String email;
	    @Column(name = ProfileServiceConstants.User.PASSWORD)
	    @Length(min = 5, message = ProfileServiceConstants.PASSWORD_MINIMUM_CHARACTER_MESSAGE)
	    @NotEmpty(message = ProfileServiceConstants.PASSWORD_EMPTY_MESSAGE)
	    private String password;
	    @Column(name = ProfileServiceConstants.User.NAME)
	    @NotEmpty(message = ProfileServiceConstants.NAME_EMPTY_MESSAGE)
	    private String name;
	    @Column(name = ProfileServiceConstants.User.ACTIVE)
	    private int active;
	    @Column(name = ProfileServiceConstants.User.RESET_TOKEN)
	    private String resetToken;
	    @ManyToMany(cascade = CascadeType.ALL)
	    @JoinTable(name = ProfileServiceConstants.UserRole.USER_ROLE, joinColumns = @JoinColumn(name = ProfileServiceConstants.User.USER_ID), inverseJoinColumns = @JoinColumn(name = ProfileServiceConstants.Role.ROLE_ID))
	    private Set<Role> roles;
	    
		/**
		 * @return the name
		 */
		public String getName() {
			return name;
		}
		/**
		 * @param name the name to set
		 */
		public void setName(String name) {
			this.name = name;
		}
		/**
		 * @return the email
		 */
		public String getEmail() {
			return email;
		}
		/**
		 * @param email the email to set
		 */
		public void setEmail(String email) {
			this.email = email;
		}
		/**
		 * @return the password
		 */
		public String getPassword() {
			return password;
		}
		/**
		 * @param password the password to set
		 */
		public void setPassword(String password) {
			this.password = password;
		}
		/**
		 * @return the id
		 */
		public int getId() {
			return id;
		}
		/**
		 * @param id the id to set
		 */
		public void setId(int id) {
			this.id = id;
		}
		/**
		 * @return the active
		 */
		public int getActive() {
			return active;
		}
		/**
		 * @param active the active to set
		 */
		public void setActive(int active) {
			this.active = active;
		}
		/**
		 * @return the roles
		 */
		public Set<Role> getRoles() {
			return roles;
		}
		/**
		 * @param roles the roles to set
		 */
		public void setRoles(Set<Role> roles) {
			this.roles = roles;
		}
		/**
		 * @return the resetToken
		 */
		public String getResetToken() {
			return resetToken;
		}
		/**
		 * @param resetToken the resetToken to set
		 */
		public void setResetToken(String resetToken) {
			this.resetToken = resetToken;
		}
		
}
