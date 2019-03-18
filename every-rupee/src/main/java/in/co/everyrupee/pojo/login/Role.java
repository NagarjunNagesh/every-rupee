/**
 * 
 */
package in.co.everyrupee.pojo.login;

import javax.persistence.*;

/**
 * Creating a bean to assign roles for a user
 * 
 * @author nagarjun
 *
 */

@Entity
@Table(name = "role")
public class Role {

	    @Id
	    @GeneratedValue(strategy = GenerationType.AUTO)
	    @Column(name = "role_id")
	    private int id;
	    @Column(name = "role")
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
