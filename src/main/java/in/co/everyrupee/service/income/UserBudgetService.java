package in.co.everyrupee.service.income;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserBudget;
import in.co.everyrupee.repository.income.UserBudgetRepository;
import in.co.everyrupee.utils.ERStringUtils;

@Transactional
@Service
@CacheConfig(cacheNames = { DashboardConstants.Budget.BUDGET_CACHE_NAME })
public class UserBudgetService implements IUserBudgetService {

    @Autowired
    private UserBudgetRepository userBudgetRepository;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * 
     * Fetches all the user budget with financial portfolio
     * 
     */
    @Override
    @Cacheable(key = "{#pFinancialPortfolioId, #dateMeantFor}")
    public List<UserBudget> fetchAllUserBudget(String pFinancialPortfolioId, String dateMeantFor) {
	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	List<UserBudget> userBudgetList = new ArrayList<UserBudget>();
	Date date;
	try {
	    date = format.parse(dateMeantFor);

	    userBudgetList = getUserBudgetRepository().fetchAllUserBudget(pFinancialPortfolioId, date);

	    if (CollectionUtils.isEmpty(userBudgetList)) {
		logger.warn("user budgets data is empty for financial portfolio ", pFinancialPortfolioId);
	    }

	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}

	return userBudgetList;
    }

    /**
     * 
     * Fetch user budget by category Ids
     * 
     */
    @Override
    public List<UserBudget> fetchAutoGeneratedUserBudgetByCategoryIds(String categoryIds, String pFinancialPortfolioId,
	    String dateMeantFor) {

	String[] arrayOfCategoryIds = categoryIds.split(GenericConstants.COMMA);
	Set<String> categoryIdsAsSet = new HashSet<String>();
	categoryIdsAsSet.addAll(Arrays.asList(arrayOfCategoryIds));
	categoryIdsAsSet.remove(ERStringUtils.EMPTY);
	List<Integer> budgetIdsAsIntegerList = categoryIdsAsSet.stream().filter(Objects::nonNull)
		.map(s -> Integer.parseInt(s)).collect(Collectors.toList());

	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	List<UserBudget> userBudgetList = new ArrayList<UserBudget>();
	Date date;
	try {
	    date = format.parse(dateMeantFor);

	    userBudgetList = getUserBudgetRepository()
		    .fetchAutoGeneratedUserBudgetWithCategoryIds(budgetIdsAsIntegerList, pFinancialPortfolioId, date);

	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}

	if (CollectionUtils.isEmpty(userBudgetList)) {
	    logger.warn("user budgets data is empty for financialPortfoilio ", pFinancialPortfolioId);
	}

	return userBudgetList;
    }

    /**
     * Save User Budget to the database if not present, updates it if it is present
     * 
     * @param formData
     * @return
     */
    @Override
    @CacheEvict(key = "{#pFinancialPortfolioId, #formData.get(\"dateMeantFor\").get(0)}")
    public UserBudget saveAutoGeneratedUserBudget(MultiValueMap<String, String> formData, String pFinancialPortfolioId,
	    boolean autoGenerated) {
	if (CollectionUtils.isEmpty(formData.get(DashboardConstants.Budget.PLANNED))
		|| ERStringUtils.isEmpty(formData.get(DashboardConstants.Budget.PLANNED).get(0))) {
	    throw new ResourceNotFoundException("UserBudget", "planned", "empty");
	}

	if (!autoGenerated) {
	    logger.warn("Saving only autogenerated values with saveAutoGeneratedUserBudget for financial portfolio id "
		    + pFinancialPortfolioId);
	    return null;
	}

	String dateString = formData.get(DashboardConstants.Budget.DATE_MEANT_FOR).get(0);
	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	UserBudget userBudgetSaved = null;
	Date date;
	try {
	    date = format.parse(dateString);

	    String categoryId = formData.get(DashboardConstants.Budget.CATEGORY_ID).get(0);
	    List<Integer> categoryIds = new ArrayList<Integer>();
	    categoryIds.add(Integer.parseInt(categoryId));
	    List<UserBudget> categoryBudget = getUserBudgetRepository()
		    .fetchAutoGeneratedUserBudgetWithCategoryIds(categoryIds, pFinancialPortfolioId, date);

	    /**
	     * Update user budget if already present
	     */
	    if (CollectionUtils.isNotEmpty(categoryBudget)) {

		Double plannedAmount = Double.parseDouble(formData.get(DashboardConstants.Budget.PLANNED).get(0));
		Double previousPlannedAmount = categoryBudget.get(0).getPlanned();
		categoryBudget.get(0).setPlanned(plannedAmount + previousPlannedAmount);
		userBudgetSaved = getUserBudgetRepository().save(categoryBudget.get(0));
		return userBudgetSaved;
	    }

	    // Create budget otherwise
	    UserBudget userBudget = new UserBudget();
	    userBudget.setFinancialPortfolioId(pFinancialPortfolioId);
	    userBudget.setCategoryId(Integer.parseInt(formData.get(DashboardConstants.Budget.CATEGORY_ID).get(0)));
	    userBudget.setPlanned(Double.parseDouble(formData.get(DashboardConstants.Budget.PLANNED).get(0)));
	    userBudget.setAutoGeneratedBudget(autoGenerated);
	    userBudget.setDateMeantFor(date);
	    userBudgetSaved = getUserBudgetRepository().save(userBudget);

	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}

	return userBudgetSaved;
    }

    /**
     * 
     * Delete user budgets with category id
     * 
     */
    @Override
    @CacheEvict(key = "{#financialPortfolioId, #dateMeantFor}")
    public void deleteAutoGeneratedUserBudgets(String categoryIds, String financialPortfolioId, String dateMeantFor) {
	String[] arrayOfCategoryIds = categoryIds.split(GenericConstants.COMMA);
	Set<String> categoryIdsAsSet = new HashSet<String>();
	categoryIdsAsSet.addAll(Arrays.asList(arrayOfCategoryIds));
	categoryIdsAsSet.remove(ERStringUtils.EMPTY);
	List<Integer> categoryIdsAsIntegerList = categoryIdsAsSet.stream().filter(Objects::nonNull)
		.map(s -> Integer.parseInt(s)).collect(Collectors.toList());

	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	Date date;
	try {
	    date = format.parse(dateMeantFor);

	    getUserBudgetRepository().deleteAutoGeneratedUserBudgetWithCategoryIds(categoryIdsAsIntegerList,
		    financialPortfolioId, date);
	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}
    }

    /**
     * 
     * Delete user budgets with category id
     * 
     */
    @Override
    @CacheEvict(key = "{#financialPortfolioId, #dateMeantFor}")
    public void deleteAllUserBudgets(String financialPortfolioId, String dateMeantFor, boolean autoGenerated) {

	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	Date date;
	try {
	    date = format.parse(dateMeantFor);

	    if (autoGenerated) {
		getUserBudgetRepository().deleteAllUserBudget(financialPortfolioId, date, autoGenerated);
	    } else {
		getUserBudgetRepository().deleteAllUserBudget(financialPortfolioId, date);
	    }
	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}

    }

    /**
     * 
     * Updates the amount to the budget. The amount is the total increase in the
     * budget.
     * 
     */
    @Override
    @CacheEvict(key = "{#financialPortfolioId, #formData.get(\"dateMeantFor\").get(0)}")
    public List<UserBudget> updateAutoGeneratedBudget(MultiValueMap<String, String> formData, String formFieldName,
	    String financialPortfolioId) {

	if (MapUtils.isEmpty(formData)
		|| CollectionUtils.isEmpty(formData.get(DashboardConstants.Budget.UPDATE_BUDGET_MAP))) {
	    return null;
	}

	if (ERStringUtils.notEqualsIgnoreCase(formFieldName, DashboardConstants.Budget.AUTO_GENERATED_JSON)) {
	    return null;
	}

	List<Integer> categoryIdsAsIntegerList = formData.get(DashboardConstants.Budget.UPDATE_BUDGET_MAP).stream()
		.filter(Objects::nonNull).map(s -> Integer.parseInt(s)).collect(Collectors.toList());

	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	List<UserBudget> userBudgetSaved = new ArrayList<UserBudget>();
	Date date;
	try {
	    date = format.parse(formData.get(DashboardConstants.Budget.DATE_MEANT_FOR).get(0));

	    List<UserBudget> userBudgetList = getUserBudgetRepository()
		    .fetchAutoGeneratedUserBudgetWithCategoryIds(categoryIdsAsIntegerList, financialPortfolioId, date);

	    for (UserBudget userBudget : userBudgetList) {
		String categoryId = Integer.toString(userBudget.getCategoryId());
		String amountToAddOrRemove = CollectionUtils.isEmpty(formData.get(categoryId)) ? "0"
			: formData.get(categoryId).get(0);
		userBudget.setPlanned(userBudget.getPlanned() + Double.parseDouble(amountToAddOrRemove));
	    }

	    userBudgetSaved = getUserBudgetRepository().saveAll(userBudgetList);

	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}
	return userBudgetSaved;

    }

    public UserBudgetRepository getUserBudgetRepository() {
	return userBudgetRepository;
    }

}
