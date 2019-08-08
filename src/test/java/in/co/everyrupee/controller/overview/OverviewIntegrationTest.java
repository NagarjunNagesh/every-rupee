package in.co.everyrupee.controller.overview;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.pojo.TransactionType;

/**
 * Overview Controller Test (Controller)
 * 
 * @author Nagarjun
 *
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class OverviewIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    private static final String DATE_MEANT_FOR = "01082019";

    @Before
    public void setUp() {
	setMvc(MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build());
    }

    /**
     * TEST: Get User Transactions by financial Portfolio id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void getUserTransactionsByFinancialPortfolioId() throws Exception {

	getMvc().perform(get("/api/overview/recentTransactions").contentType(MediaType.APPLICATION_JSON)
		.param(DashboardConstants.Overview.DATE_MEANT_FOR, DATE_MEANT_FOR))
		.andExpect(status().isNotAcceptable());

    }

    /**
     * TEST: Get lifetime income by financial Portfolio id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void getLifetimeIncomeByFinancialPortfolioId() throws Exception {

	getMvc().perform(get("/api/overview/lifetime").contentType(MediaType.APPLICATION_JSON)
		.param(DashboardConstants.Overview.TYPE_PARAM, TransactionType.INCOME.toString())
		.param(DashboardConstants.Overview.AVERAGE_PARAM, "true")).andExpect(status().isNotAcceptable());

    }

    private MockMvc getMvc() {
	return mvc;
    }

    private void setMvc(MockMvc mvc) {
	this.mvc = mvc;
    }

}
