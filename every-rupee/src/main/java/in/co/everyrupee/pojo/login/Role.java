/**
 * 
 */
package in.co.everyrupee.pojo.login;

import java.util.Collection;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import in.co.everyrupee.constants.profile.ProfileServiceConstants;

/**
 * Creating a bean to assign roles for a user
 * 
 * @author nagarjun
 *
 */

@Entity
@Table(name = ProfileServiceConstants.Role.ROLE_TABLE_NAME)
public class Role {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = ProfileServiceConstants.Role.ROLE_ID)
	private int id;
	@Column(name = ProfileServiceConstants.Role.ROLE_PROPERTY)
	private String role;

	public Role() {
	}

	public Role(String role) {
		this.role = role;
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
	 * @return the role
	 */
	public String getRole() {
		return role;
	}

	/**
	 * @param role the role to set
	 */
	public void setRole(String role) {
		this.role = role;
	}

}
