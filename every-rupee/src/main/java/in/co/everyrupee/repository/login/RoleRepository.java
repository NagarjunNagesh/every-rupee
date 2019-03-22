package in.co.everyrupee.repository.login;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.co.everyrupee.pojo.login.Role;

/**
 * Access the role table to access the role of the user.
 * 
 * @author Nagarjun Nagesh
 *
 */
@Repository("roleRepository")
public interface RoleRepository extends JpaRepository<Role, Integer> {
	    Role findByRole(String role);

}
