package in.co.everyrupee.service.income;

import static org.assertj.core.api.Assertions.assertThat;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

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
import in.co.everyrupee.pojo.income.UserBudget;
import in.co.everyrupee.repository.income.UserBudgetRepository;

@RunWith(SpringRunner.class)
@WithMockUser
public class UserBudgetServiceTest {

    @Autowired
    private UserBudgetService userBudgetService;

    @MockBean
    private UserBudgetRepository userBudgetRepository;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    @TestConfiguration
    static class EmployeeServiceImplTestContextConfiguration {

	@Bean
	public UserBudgetService userBudgetService() {
	    return new UserBudgetService();
	}
    }

    @Before
    public void setUp() {
	String financialPortfolioId = "19300000";
	UserBudget userBudget = new UserBudget();
	userBudget.setFinancialPortfolioId(financialPortfolioId);
	userBudget.setCategoryId(3);
	userBudget.setPlanned(300);
	userBudget.setAutoGeneratedBudget(true);
	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	Date date;
	try {
	    date = format.parse("01062019");
	    userBudget.setDateMeantFor(date);
	    List<UserBudget> userbudgetList = new ArrayList<UserBudget>();
	    userbudgetList.add(userBudget);

	    // Fetch all budget
	    Mockito.when(userBudgetRepository.fetchAllUserBudget(financialPortfolioId, date))
		    .thenReturn(userbudgetList);

	    // Fetch budget with category id
	    List<Integer> categoryIdList = new ArrayList<Integer>();
	    categoryIdList.add(3);
	    Mockito.when(userBudgetRepository.fetchAutoGeneratedUserBudgetWithCategoryIds(categoryIdList,
		    financialPortfolioId, date)).thenReturn(userbudgetList);

	    UserBudget userBudgetSaved = new UserBudget();
	    userBudgetSaved.setFinancialPortfolioId(financialPortfolioId);
	    userBudgetSaved.setCategoryId(3);
	    userBudgetSaved.setPlanned(600);
	    userBudgetSaved.setAutoGeneratedBudget(true);
	    Mockito.when(userBudgetRepository.save(userBudget)).thenReturn(userBudgetSaved);

	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}

    }

    /**
     * Test to return user budget with fetchAllUserBudget
     */
    @Test
    public void userBudgetRetrieveMock() {
	String financialPortfolioId = "19300000";
	String dateMeantFor = "01062019";
	List<UserBudget> found = userBudgetService.fetchAllUserBudget(financialPortfolioId, dateMeantFor);

	assertThat(found).isNotEmpty();
	assertThat(found.get(0).getFinancialPortfolioId()).isEqualTo("19300000");
	assertThat(found.get(0).getAutoGeneratedBudget()).isEqualTo(true);

	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	Date date;
	try {
	    date = format.parse("01062019");
	    assertThat(found.get(0).getDateMeantFor()).isEqualTo(date);
	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}
    }

    /**
     * Test to return auto generated user budget
     */
    @Test
    public void fetchAutoGeneratedUserBudgetByCategoryIds() {
	String financialPortfolioId = "19300000";
	String dateMeantFor = "01062019";
	String categoryId = "3";
	List<UserBudget> found = userBudgetService.fetchAutoGeneratedUserBudgetByCategoryIds(categoryId,
		financialPortfolioId, dateMeantFor);
	assertThat(found).isNotEmpty();

    }

    /**
     * Save Auto Generated User Budget Without Amount
     */
    @Test(expected = ResourceNotFoundException.class)
    public void saveAutoGeneratedUserBudgetException() {
	MultiValueMap<String, String> formData = new LinkedMultiValueMap<String, String>();
	String financialPortfolioId = "19300000";

	formData.add(DashboardConstants.Budget.DATE_MEANT_FOR, "01062019");
	formData.add(DashboardConstants.Budget.FINANCIAL_PORTFOLIO_ID, "19300000");
	formData.add(DashboardConstants.Budget.CATEGORY_ID, "3");
	userBudgetService.saveAutoGeneratedUserBudget(formData, financialPortfolioId, true);
    }

    /**
     * Save Auto Generated User Budget With Amount with auto generated as false
     */
    @Test
    public void saveAutoGeneratedUserBudgetNull() {
	MultiValueMap<String, String> formData = new LinkedMultiValueMap<String, String>();
	formData.add(DashboardConstants.Budget.PLANNED, "300");
	String financialPortfolioId = "19300000";

	// Auto generation = false
	UserBudget userBudget = userBudgetService.saveAutoGeneratedUserBudget(formData, financialPortfolioId, false);
	assertThat(userBudget).isNull();
    }

    /**
     * Save Auto Generated User Budget With Amount Normal Flow
     */
    @Test
    public void saveAutoGeneratedUserBudget() {
	MultiValueMap<String, String> formData = new LinkedMultiValueMap<String, String>();
	String financialPortfolioId = "19300000";
	formData.add(DashboardConstants.Budget.PLANNED, "300");
	formData.add(DashboardConstants.Budget.DATE_MEANT_FOR, "01062019");
	formData.add(DashboardConstants.Budget.FINANCIAL_PORTFOLIO_ID, financialPortfolioId);
	formData.add(DashboardConstants.Budget.CATEGORY_ID, "3");

	// Auto generation = false
	UserBudget userBudget = userBudgetService.saveAutoGeneratedUserBudget(formData, financialPortfolioId, true);
	assertThat(userBudget).isNotNull();
	assertThat(userBudget.getPlanned()).isEqualTo(600);
    }

    /**
     * Delete auto generated user budget (Category ids are always numbers)
     */
    @Test(expected = NumberFormatException.class)
    public void deleteAutoGeneratedUserBudgets() {
	String categoryIds = "3,a6,7,9";
	String financialPortfolioId = "19300000";
	String dateMeantFor = "01062019";

	userBudgetService.deleteAutoGeneratedUserBudgets(categoryIds, financialPortfolioId, dateMeantFor);
    }
}
