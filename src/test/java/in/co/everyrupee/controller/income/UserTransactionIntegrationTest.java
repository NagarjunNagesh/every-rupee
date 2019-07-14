package in.co.everyrupee.controller.income;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;

/**
 * User Transaction Test (Cache, Controller. Service)
 * 
 * @author Nagarjun
 *
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class UserTransactionIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @MockBean
    private UserTransactionsRepository userTransactionRepository;

    @MockBean
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    CacheManager cacheManager;

    private Date dateMeantFor;

    private List<String> cacheObjectKey;

    private List<UserTransaction> userTransactionsList;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    private static final String FINANCIAL_PORTFOLIO_ID = "193000000";

    private static final String DATE_MEANT_FOR = "01062019";

    @Before
    public void setUp() {
	setUserTransactionsList(new ArrayList<UserTransaction>());
	UserTransaction userTransaction = new UserTransaction();

	setMvc(MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build());

	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);

	try {
	    setDateMeantFor(format.parse(DATE_MEANT_FOR));
	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user Transactions");
	}

	// sets a user Transactions for user Transactions list
	userTransaction.setFinancialPortfolioId(FINANCIAL_PORTFOLIO_ID);
	userTransaction.setCategoryId(3);
	userTransaction.setAmount(300);

	// Appends the above created user Transactions to the list
	getUserTransactionsList().add(userTransaction);

	setCacheObjectKey(new ArrayList<String>());
	getCacheObjectKey().add(FINANCIAL_PORTFOLIO_ID);
	getCacheObjectKey().add(DATE_MEANT_FOR);

	// Testing the Cache Layer
	when(getUserTransactionRepository().findByFinancialPortfolioIdAndDate(FINANCIAL_PORTFOLIO_ID,
		getDateMeantFor())).thenReturn(getUserTransactionsList());

    }

    /**
     * TEST: Get user Transaction by financial portfolio Id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void getUserTransactionByFinancialPortfolioId() throws Exception {

	getMvc().perform(
		get("/api/transactions/193000000").param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
			.contentType(MediaType.APPLICATION_JSON))
		.andExpect(status().isOk());

	// Call the REST controller twice but the method should be invoked once
	getMvc().perform(
		get("/api/transactions/193000000").param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
			.contentType(MediaType.APPLICATION_JSON))
		.andExpect(status().isOk()).andExpect(jsonPath("$.3").isNotEmpty());

	// Ensuring that the cache contains the said values
	assertThat(getCacheManager().getCache(DashboardConstants.Transactions.TRANSACTIONS_CACHE_NAME)
		.get(getCacheObjectKey()), is(notNullValue()));
    }

    /**
     * TEST: Get user Transactions by financial portfolio Id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void save() throws Exception {
	List<Integer> categoryIds = new ArrayList<Integer>();
	categoryIds.add(3);

	getMvc().perform(
		get("/api/transactions/193000000").param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
			.contentType(MediaType.APPLICATION_JSON))
		.andExpect(status().isOk());

	// Ensuring that the cache contains the said values
	assertThat(getCacheManager().getCache(DashboardConstants.Transactions.TRANSACTIONS_CACHE_NAME)
		.get(getCacheObjectKey()), is(notNullValue()));

	getMvc().perform(
		post("/api/transactions/save/193000000").param(DashboardConstants.Transactions.CATEGORY_OPTIONS, "3")
			.param(DashboardConstants.Transactions.FINANCIAL_PORTFOLIO_ID, FINANCIAL_PORTFOLIO_ID)
			.param(DashboardConstants.Transactions.TRANSACTIONS_AMOUNT, "300")
			.param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
			.accept(MediaType.APPLICATION_JSON).contentType(MediaType.APPLICATION_FORM_URLENCODED_VALUE))
		.andExpect(status().isOk());

	verify(getUserTransactionRepository(), times(1)).save(Mockito.any());

	// Ensuring that the cache is evicted
	assertNull(getCacheManager().getCache(DashboardConstants.Transactions.TRANSACTIONS_CACHE_NAME)
		.get(getCacheObjectKey()));

    }

    /**
     * TEST: delete user Transactions by transaction Id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void deleteUserTransactionById() throws Exception {
	getMvc().perform(
		get("/api/transactions/193000000").param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
			.contentType(MediaType.APPLICATION_JSON))
		.andExpect(status().isOk());

	// Ensuring that the cache contains the said values
	assertThat(getCacheManager().getCache(DashboardConstants.Transactions.TRANSACTIONS_CACHE_NAME)
		.get(getCacheObjectKey()), is(notNullValue()));

	getMvc().perform(delete("/api/transactions/193000000/3,4,5,6")
		.param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
		.contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());

	// Ensuring that the cache is evicted
	assertNull(getCacheManager().getCache(DashboardConstants.Transactions.TRANSACTIONS_CACHE_NAME)
		.get(getCacheObjectKey()));
    }

    /**
     * TEST: update user transaction by financial portfolio Id
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void updateDescriptionByUserTransactionById() throws Exception {
	getMvc().perform(
		get("/api/transactions/193000000").param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
			.contentType(MediaType.APPLICATION_JSON))
		.andExpect(status().isOk());

	// Ensuring that the cache contains the said values
	assertThat(getCacheManager().getCache(DashboardConstants.Transactions.TRANSACTIONS_CACHE_NAME)
		.get(getCacheObjectKey()), is(notNullValue()));

	// Testing the Cache Layer
	List<Optional<UserTransaction>> optionalUserTransaction = getUserTransactionsList().stream()
		.map((o) -> Optional.of(o)).collect(Collectors.toList());
	when(getUserTransactionRepository().findById(200)).thenReturn(optionalUserTransaction.get(0));

	when(getUserTransactionRepository().save(Mockito.any())).thenReturn(getUserTransactionsList().get(0));

	getMvc().perform(post("/api/transactions/193000000/update/category")
		.param(DashboardConstants.Transactions.CATEGORY_ID_JSON, "3")
		.param(DashboardConstants.Transactions.TRANSACTIONS__ID_JSON, "200").accept(MediaType.APPLICATION_JSON)
		.param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
		.contentType(MediaType.APPLICATION_FORM_URLENCODED_VALUE)).andExpect(status().isOk());

	verify(getUserTransactionRepository(), times(1)).findById(200);
	// Making sure the Budget Listener was called
	verify(getUserTransactionRepository(), times(1)).save(Mockito.any());

    }

    /**
     * TEST: Get user Transaction by financial portfolio Id (EXCEPTION)
     * 
     * @throws Exception
     */
    @Test
    public void getUserTransactionByFinancialPortfolioIdException() throws Exception {
	getMvc().perform(
		get("/api/transactions/193000000").param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
			.contentType(MediaType.APPLICATION_JSON))
		.andExpect(status().isUnauthorized());
    }

    /**
     * TEST: Get user Transactions by financial portfolio Id (EXCEPTION) without
     * Transaction Amount
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void saveResourceNotFound() throws Exception {
	getMvc().perform(
		post("/api/transactions/save/193000000").param(DashboardConstants.Transactions.CATEGORY_OPTIONS, "3")
			.param(DashboardConstants.Transactions.FINANCIAL_PORTFOLIO_ID, FINANCIAL_PORTFOLIO_ID)
			.param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
			.accept(MediaType.APPLICATION_JSON).contentType(MediaType.APPLICATION_FORM_URLENCODED_VALUE))
		.andExpect(status().isBadRequest());
    }

    /**
     * TEST: Get user Transactions by financial portfolio Id Without transaction
     * amount (EXCEPTION)
     * 
     * @throws Exception
     */
    @Test
    public void saveException() throws Exception {
	getMvc().perform(
		post("/api/transactions/save/193000000").param(DashboardConstants.Transactions.CATEGORY_OPTIONS, "3")
			.param(DashboardConstants.Transactions.FINANCIAL_PORTFOLIO_ID, FINANCIAL_PORTFOLIO_ID)
			.accept(MediaType.APPLICATION_JSON).contentType(MediaType.APPLICATION_FORM_URLENCODED_VALUE))
		.andExpect(status().isUnauthorized());
    }

    /**
     * TEST: delete user Transactions by transaction Id (EXCEPTION)
     * 
     * @throws Exception
     */
    @Test
    public void deleteUserTransactionByIdException() throws Exception {
	getMvc().perform(delete("/api/transactions/193000000/3,4,5,6")
		.param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
		.contentType(MediaType.APPLICATION_JSON)).andExpect(status().isUnauthorized());
    }

    /**
     * TEST: update user transaction by financial portfolio Id (EXCEPTION)
     * 
     * @throws Exception
     */
    @Test
    public void updateDescriptionByUserTransactionByIdException() throws Exception {
	getMvc().perform(post("/api/transactions/193000000/update/categoryId")
		.param(DashboardConstants.Transactions.TRANSACTIONS_AMOUNT, "300")
		.param(DashboardConstants.Transactions.CATEGORY_OPTIONS, "3")
		.param(DashboardConstants.Transactions.FINANCIAL_PORTFOLIO_ID, FINANCIAL_PORTFOLIO_ID)
		.accept(MediaType.APPLICATION_JSON).contentType(MediaType.APPLICATION_FORM_URLENCODED_VALUE))
		.andExpect(status().isUnauthorized());
    }

    /**
     * Fetch Category total and update User budget test
     * 
     * @throws Exception
     */
    @WithMockUser(value = "spring")
    @Test
    public void fetchCategoryTotalAndUpdateUserBudget() throws Exception {
	getMvc().perform(get("/api/transactions/categoryTotal/193000000")
		.param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
		.param(DashboardConstants.Transactions.UPDATE_BUDGET_PARAM, "true")
		.contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
		.andExpect(jsonPath("$.3").isNotEmpty());

	getMvc().perform(get("/api/transactions/categoryTotal/193000000")
		.param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
		.param(DashboardConstants.Transactions.UPDATE_BUDGET_PARAM, "false")
		.contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
		.andExpect(jsonPath("$.3").isNotEmpty());
	verify(getUserTransactionRepository(), times(2)).findByFinancialPortfolioIdAndDate(FINANCIAL_PORTFOLIO_ID,
		getDateMeantFor());

    }

    /**
     * Fetch Category total and update User budget test
     * 
     * @throws Exception
     */
    @Test
    public void fetchCategoryTotalAndUpdateUserBudgetException() throws Exception {
	getMvc().perform(get("/api/transactions/categoryTotal/193000000")
		.param(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR)
		.param(DashboardConstants.Transactions.UPDATE_BUDGET_PARAM, "true")
		.contentType(MediaType.APPLICATION_JSON)).andExpect(status().isUnauthorized());

    }

    private MockMvc getMvc() {
	return mvc;
    }

    private UserTransactionsRepository getUserTransactionRepository() {
	return userTransactionRepository;
    }

    private CacheManager getCacheManager() {
	return cacheManager;
    }

    private void setMvc(MockMvc mvc) {
	this.mvc = mvc;
    }

    private Date getDateMeantFor() {
	return dateMeantFor;
    }

    private void setDateMeantFor(Date dateMeantFor) {
	this.dateMeantFor = dateMeantFor;
    }

    private List<String> getCacheObjectKey() {
	return cacheObjectKey;
    }

    private void setCacheObjectKey(List<String> cacheObjectKey) {
	this.cacheObjectKey = cacheObjectKey;
    }

    private List<UserTransaction> getUserTransactionsList() {
	return userTransactionsList;
    }

    private void setUserTransactionsList(List<UserTransaction> userTransactionsList) {
	this.userTransactionsList = userTransactionsList;
    }

    public ApplicationEventPublisher getEventPublisher() {
	return eventPublisher;
    }

}
