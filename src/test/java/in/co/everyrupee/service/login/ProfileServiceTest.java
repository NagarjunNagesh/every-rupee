//package in.co.everyrupee.service.login;
//
//import org.junit.Before;
//import org.junit.Test;
//import org.mockito.Mock;
//import org.mockito.Mockito;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//
//import in.co.everyrupee.pojo.login.Profile;
//import in.co.everyrupee.repository.login.ProfileRepository;
//import in.co.everyrupee.repository.login.RoleRepository;
//
//import static org.junit.Assert.assertEquals;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.MockitoAnnotations.initMocks;
//
///**
// * 
// * @author Nagarjun Nagesh
// *
// */
//public class ProfileServiceTest {
//
//
//
//	    @Mock
//	    private ProfileRepository mockUserRepository;
//	    @Mock
//	    private RoleRepository mockRoleRepository;
//	    @Mock
//	    private BCryptPasswordEncoder mockBCryptPasswordEncoder;
//
//	    private ProfileService userServiceUnderTest;
//	    private Profile user;
//
//	    @Before
//	    public void setUp() {
//	        initMocks(this);
//	        userServiceUnderTest = new ProfileService(mockUserRepository,
//	                                               mockRoleRepository,
//	                                               mockBCryptPasswordEncoder);
//	        user = Profile
//	                .id(1)
//	                .name("Nagarjun")
//	                .lastName("Nagesh")
//	                .email("test@test.com")
//	                .build();
//
//	        Mockito.when(mockUserRepository.save(any()))
//	                .thenReturn(user);
//	        Mockito.when(mockUserRepository.findByEmail(anyString()))
//	                .thenReturn(user);
//	    }
//
//	    @Test
//	    public void testFindUserByEmail() {
//	        // Setup
//	        final String email = "test@test.com";
//
//	        // Run the test
//	        final Profile result = userServiceUnderTest.findUserByEmail(email);
//
//	        // Verify the results
//	        assertEquals(email, result.getEmail());
//	    }
//
//	    @Test
//	    public void testSaveUser() {
//	        // Setup
//	        final String email = "test@test.com";
//
//	        // Run the test
//	        Profile result = userServiceUnderTest.saveUser(Profile.builder().build());
//
//	        // Verify the results
//	        assertEquals(email, result.getEmail());
//	    }
//}
