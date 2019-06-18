package in.co.everyrupee.controller.income;

import static org.hamcrest.CoreMatchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.context.WebApplicationContext;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.pojo.income.UserBudget;
import in.co.everyrupee.service.income.UserBudgetService;
import in.co.everyrupee.utils.GenericUtils;

/**
 * User Budget Controller Test
 * 
 * @author Nagarjun
 *
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class UserBudgetControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @MockBean
    private UserBudgetService userBudgetService;

    @Before
    public void setUp() {
	mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    /**
     * TEST: Get user Budget by financial portfolio Id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void getUserBudgetByFinancialPortfolioId() throws Exception {
	String financialPortfolioId = "193000000";
	String dateMeantFor = "01062019";
	UserBudget userBudget = new UserBudget();
	List<UserBudget> userBudgetList = new ArrayList<UserBudget>();

	userBudget.setFinancialPortfolioId(financialPortfolioId);
	userBudget.setCategoryId(3);
	userBudget.setPlanned(300);
	userBudget.setAutoGeneratedBudget(true);

	userBudgetList.add(userBudget);

	when(this.userBudgetService.fetchAllUserBudget(financialPortfolioId, dateMeantFor)).thenReturn(userBudgetList);

	this.mvc.perform(get("/api/budget/193000000?dateMeantFor=01062019").contentType(MediaType.APPLICATION_JSON))
		.andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.*").isNotEmpty())
		.andExpect(jsonPath("$[0].financialPortfolioId", is(financialPortfolioId)));
    }

    /**
     * TEST: Delete user Budget by category Id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void deleteAutoGeneratedUserBudgetById() throws Exception {

	this.mvc.perform(
		delete("/api/budget/193000000/3,4,5,6?dateMeantFor=01062019").contentType(MediaType.APPLICATION_JSON))
		.andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.*").isNotEmpty())
		.andExpect(jsonPath("$.message", is("success")));
    }

    /**
     * TEST: Delete all entries from user Budget with financial portfolio id as
     * ${id}
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void deleteAllUserBudgetById() throws Exception {

	// Autogenerated true
	this.mvc.perform(delete("/api/budget/193000000?dateMeantFor=01062019&autoGenerated=true")
		.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isOk())
		.andExpect(jsonPath("$.*").isNotEmpty()).andExpect(jsonPath("$.message", is("success")));

	// Autogenerated false
	this.mvc.perform(delete("/api/budget/193000000?dateMeantFor=01062019&autoGenerated=false")
		.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isOk())
		.andExpect(jsonPath("$.*").isNotEmpty()).andExpect(jsonPath("$.message", is("success")));
    }

    /**
     * TEST: update user Budget by category Id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void updateAutoGeneratedUserBudgetById() throws Exception {

	MultiValueMap<String, String> formData = new LinkedMultiValueMap<String, String>();
	String financialPortfolioId = "193000000";
	String dateMeantFor = "01062019";
	UserBudget userBudget = new UserBudget();
	List<UserBudget> userBudgetList = new ArrayList<UserBudget>();

	userBudget.setFinancialPortfolioId(financialPortfolioId);
	userBudget.setCategoryId(3);
	userBudget.setPlanned(300);
	userBudget.setAutoGeneratedBudget(true);

	userBudgetList.add(userBudget);

	when(this.userBudgetService.updateAutoGeneratedBudget(formData, "autoGenerated", financialPortfolioId,
		dateMeantFor)).thenReturn(userBudgetList);

	RequestBuilder request = MockMvcRequestBuilders.post("/api/budget/193000000/update/autoGenerated")
		.param(DashboardConstants.Budget.DATE_MEANT_FOR, dateMeantFor).accept(MediaType.APPLICATION_JSON)
		.content(GenericUtils.asJsonString(formData)).contentType(MediaType.APPLICATION_FORM_URLENCODED_VALUE);

	this.mvc.perform(request).andDo(print()).andExpect(status().isOk());
    }

    /**
     * TEST: save user Budget by category Id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void update() throws Exception {

	MultiValueMap<String, String> formData = new LinkedMultiValueMap<String, String>();
	String financialPortfolioId = "193000000";
	String dateMeantFor = "01062019";
	UserBudget userBudget = new UserBudget();

	userBudget.setFinancialPortfolioId(financialPortfolioId);
	userBudget.setCategoryId(3);
	userBudget.setPlanned(300);
	userBudget.setAutoGeneratedBudget(true);

	when(this.userBudgetService.saveAutoGeneratedUserBudget(formData, financialPortfolioId, true))
		.thenReturn(userBudget);

	RequestBuilder request = MockMvcRequestBuilders.post("/api/budget/save/193000000")
		.param(DashboardConstants.Budget.DATE_MEANT_FOR, dateMeantFor).accept(MediaType.APPLICATION_JSON)
		.content(GenericUtils.asJsonString(formData)).contentType(MediaType.APPLICATION_FORM_URLENCODED_VALUE);

	this.mvc.perform(request).andDo(print()).andExpect(status().isOk());
    }

    /**
     * TEST: Get user Budget by financial portfolio Id (Exception)
     * 
     * @throws Exception
     */
    @Test
    public void getUserBudgetByFinancialPortfolioIdException() throws Exception {
	String financialPortfolioId = "193000000";
	String dateMeantFor = "01062019";
	UserBudget userBudget = new UserBudget();
	List<UserBudget> userBudgetList = new ArrayList<UserBudget>();

	userBudget.setFinancialPortfolioId(financialPortfolioId);
	userBudget.setCategoryId(3);
	userBudget.setPlanned(300);
	userBudget.setAutoGeneratedBudget(true);

	userBudgetList.add(userBudget);

	when(this.userBudgetService.fetchAllUserBudget(financialPortfolioId, dateMeantFor)).thenReturn(userBudgetList);

	this.mvc.perform(get("/api/budget/193000000?dateMeantFor=01062019").contentType(MediaType.APPLICATION_JSON))
		.andDo(print()).andExpect(status().isConflict());
    }

    /**
     * TEST: Delete user Budget by category Id (EXCEPTION)
     * 
     * @throws Exception
     */
    @Test
    public void deleteAutoGeneratedUserBudgetByIdException() throws Exception {

	this.mvc.perform(
		delete("/api/budget/193000000/3,4,5,6?dateMeantFor=01062019").contentType(MediaType.APPLICATION_JSON))
		.andDo(print()).andExpect(status().isConflict()).andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    /**
     * TEST: Delete all entries from user Budget with financial portfolio id as
     * ${id}
     * 
     * @throws Exception
     */
    @Test
    public void deleteAllUserBudgetByIdException() throws Exception {

	// Autogenerated true
	this.mvc.perform(delete("/api/budget/193000000?dateMeantFor=01062019&autoGenerated=true")
		.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isConflict())
		.andExpect(jsonPath("$.error", is("Unauthorized")));

	// Autogenerated false
	this.mvc.perform(delete("/api/budget/193000000?dateMeantFor=01062019&autoGenerated=false")
		.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isConflict())
		.andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    /**
     * TEST: update user Budget by category Id (Exception)
     * 
     * @throws Exception
     */
    @Test
    public void updateAutoGeneratedUserBudgetByIdException() throws Exception {

	MultiValueMap<String, String> formData = new LinkedMultiValueMap<String, String>();
	String financialPortfolioId = "193000000";
	String dateMeantFor = "01062019";
	UserBudget userBudget = new UserBudget();
	List<UserBudget> userBudgetList = new ArrayList<UserBudget>();

	userBudget.setFinancialPortfolioId(financialPortfolioId);
	userBudget.setCategoryId(3);
	userBudget.setPlanned(300);
	userBudget.setAutoGeneratedBudget(true);

	userBudgetList.add(userBudget);

	when(this.userBudgetService.updateAutoGeneratedBudget(formData, "autoGenerated", financialPortfolioId,
		dateMeantFor)).thenReturn(userBudgetList);

	RequestBuilder request = MockMvcRequestBuilders.post("/api/budget/193000000/update/autoGenerated")
		.param(DashboardConstants.Budget.DATE_MEANT_FOR, dateMeantFor).accept(MediaType.APPLICATION_JSON)
		.content(GenericUtils.asJsonString(formData)).contentType(MediaType.APPLICATION_FORM_URLENCODED_VALUE);

	this.mvc.perform(request).andDo(print()).andExpect(status().isConflict());
    }

}
