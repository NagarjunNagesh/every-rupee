package in.co.everyrupee.service.income;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.apache.commons.collections4.CollectionUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserTransaction;
import in.co.everyrupee.repository.income.UserTransactionsRepository;

@RunWith(SpringRunner.class)
@WithMockUser
public class UserTransactionServiceTest {

    @Autowired
    private UserTransactionService userTransactionService;

    @MockBean
    private UserTransactionsRepository userTransactionsRepository;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    private Date dateMeantFor;

    private List<Integer> categoryIdList;

    private static final String FINANCIAL_PORTFOLIO_ID = "193000000";

    private static final String DATE_MEANT_FOR = "01062019";

    @TestConfiguration
    static class UserTransactionServiceImplTestContextConfiguration {

	@Bean
	public UserTransactionService userTransactionService() {
	    return new UserTransactionService();
	}
    }

    @Before
    public void setUp() {

	UserTransaction userTransaction = new UserTransaction();
	userTransaction.setFinancialPortfolioId(FINANCIAL_PORTFOLIO_ID);
	userTransaction.setCategoryId(3);
	userTransaction.setAmount(300);
	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	try {
	    setDateMeantFor(format.parse(DATE_MEANT_FOR));
	    userTransaction.setDateMeantFor(getDateMeantFor());
	    List<UserTransaction> userTransactionList = new ArrayList<UserTransaction>();
	    userTransactionList.add(userTransaction);

	    // Fetch all Transaction
	    when(getUserTransactionsRepository().findByFinancialPortfolioIdAndDate(FINANCIAL_PORTFOLIO_ID,
		    getDateMeantFor())).thenReturn(userTransactionList);

	    UserTransaction userTransactionSaved = new UserTransaction();
	    userTransactionSaved.setFinancialPortfolioId(FINANCIAL_PORTFOLIO_ID);
	    userTransactionSaved.setCategoryId(3);
	    userTransactionSaved.setAmount(600);
	    Mockito.when(getUserTransactionsRepository().save(Mockito.any())).thenReturn(userTransactionSaved);

	    Optional<UserTransaction> userBudgetReturnValue = userTransactionList.stream().findFirst();
	    when(userTransactionsRepository.findById(3)).thenReturn(userBudgetReturnValue);

	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user Transaction");
	}

	// Set Category Id List
	setCategoryIdList(new ArrayList<Integer>());
	getCategoryIdList().add(3);
	getCategoryIdList().add(4);
	getCategoryIdList().add(5);
	getCategoryIdList().add(6);

    }

    /**
     * TEST: Fetch user transactions
     */
    @SuppressWarnings("unchecked")
    @Test
    public void fetchUserTransaction() {

	Map<Integer, List<UserTransaction>> categoryKeyAndUserTransactions = (Map<Integer, List<UserTransaction>>) getUserTransactionService()
		.fetchUserTransaction(FINANCIAL_PORTFOLIO_ID, DATE_MEANT_FOR);
	verify(getUserTransactionsRepository(), times(1)).findByFinancialPortfolioIdAndDate(FINANCIAL_PORTFOLIO_ID,
		getDateMeantFor());
	assertThat(categoryKeyAndUserTransactions).isNotEmpty();
	assertTrue(CollectionUtils.isNotEmpty(categoryKeyAndUserTransactions.get(3)));
    }

    /**
     * TEST: Save user transactions
     */
    @Test
    public void saveUserTransaction() {
	MultiValueMap<String, String> formData = new LinkedMultiValueMap<String, String>();
	formData.add(DashboardConstants.Transactions.AMOUNT, "300");
	formData.add(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR);
	formData.add(DashboardConstants.Transactions.FINANCIAL_PORTFOLIO_ID, FINANCIAL_PORTFOLIO_ID);
	formData.add(DashboardConstants.Transactions.CATEGORY_OPTIONS, "3");

	UserTransaction userTransactionsSaved = getUserTransactionService().saveUserTransaction(formData,
		FINANCIAL_PORTFOLIO_ID);
	assertThat(userTransactionsSaved).isNotNull();
    }

    /**
     * TEST: Save user transactions
     */
    @Test(expected = ResourceNotFoundException.class)
    public void saveUserTransactionException() {
	MultiValueMap<String, String> formData = new LinkedMultiValueMap<String, String>();
	formData.add(DashboardConstants.Transactions.DATE_MEANT_FOR, DATE_MEANT_FOR);
	formData.add(DashboardConstants.Transactions.FINANCIAL_PORTFOLIO_ID, FINANCIAL_PORTFOLIO_ID);
	formData.add(DashboardConstants.Transactions.CATEGORY_OPTIONS, "3");

	getUserTransactionService().saveUserTransaction(formData, FINANCIAL_PORTFOLIO_ID);
    }

    /**
     * TEST: Delete user transactions
     */
    @Test
    public void deleteUserTransactions() {

	getUserTransactionService().deleteUserTransactions("3", FINANCIAL_PORTFOLIO_ID, DATE_MEANT_FOR);

	verify(getUserTransactionsRepository(), times(1)).deleteUsersWithIds(Mockito.any(),
		Mockito.eq(FINANCIAL_PORTFOLIO_ID));
    }

    /**
     * TEST: Update user transactions
     */
    @Test
    public void updateTransactions() {

	MultiValueMap<String, String> formData = new LinkedMultiValueMap<String, String>();
	formData.add(DashboardConstants.Transactions.TRANSACTIONS__ID_JSON, "3");
	formData.add(DashboardConstants.Transactions.CATEGORY_ID_JSON, "3");

	getUserTransactionService().updateTransactions(formData,
		DashboardConstants.Transactions.CATEGORY_FORM_FIELD_NAME, FINANCIAL_PORTFOLIO_ID);
	verify(getUserTransactionsRepository(), times(1)).save(Mockito.any());
    }

    private Date getDateMeantFor() {
	return dateMeantFor;
    }

    private void setDateMeantFor(Date dateMeantFor) {
	this.dateMeantFor = dateMeantFor;
    }

    private List<Integer> getCategoryIdList() {
	return categoryIdList;
    }

    private void setCategoryIdList(List<Integer> categoryIdList) {
	this.categoryIdList = categoryIdList;
    }

    private UserTransactionService getUserTransactionService() {
	return userTransactionService;
    }

    private UserTransactionsRepository getUserTransactionsRepository() {
	return userTransactionsRepository;
    }

}
