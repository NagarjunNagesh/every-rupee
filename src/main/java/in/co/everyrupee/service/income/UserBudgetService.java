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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MultiValueMap;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserBudget;
import in.co.everyrupee.repository.income.UserBudgetRepository;
import in.co.everyrupee.security.core.userdetails.MyUser;
import in.co.everyrupee.utils.ERStringUtils;

@Transactional
@Service
@CacheConfig(cacheNames = { DashboardConstants.Budget.BUDGET_CACHE_NAME })
public class UserBudgetService implements IUserBudgetService {

    @Autowired
    UserBudgetRepository userBudgetRepository;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * 
     * Fetches all the user budget with financial portfolio
     * 
     */
    @Override
    @Cacheable
    public List<UserBudget> fetchAllUserBudget(String pFinancialPortfolioId) {
	MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	List<UserBudget> userBudgetList = userBudgetRepository.findByFinancialPortfolioId(pFinancialPortfolioId);

	if (CollectionUtils.isEmpty(userBudgetList)) {
	    logger.warn("user budgets data is empty for user ", user.getUsername());
	}

	return userBudgetList;
    }

    /**
     * 
     * Fetch user budget by category Ids
     * 
     */
    @Override
    public List<UserBudget> fetchUserBudgetByCategoryIds(String categoryIds, String pFinancialPortfolioId) {
	MyUser user = (MyUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	String[] arrayOfCategoryIds = categoryIds.split(GenericConstants.COMMA);
	Set<String> categoryIdsAsSet = new HashSet<String>();
	categoryIdsAsSet.addAll(Arrays.asList(arrayOfCategoryIds));
	categoryIdsAsSet.remove(ERStringUtils.EMPTY);
	List<Integer> budgetIdsAsIntegerList = categoryIdsAsSet.stream().filter(Objects::nonNull)
		.map(s -> Integer.parseInt(s)).collect(Collectors.toList());
	List<UserBudget> userBudgetList = userBudgetRepository.fetchUserBudgetWithIds(budgetIdsAsIntegerList,
		pFinancialPortfolioId);

	if (CollectionUtils.isEmpty(userBudgetList)) {
	    logger.warn("user budgets data is empty for user ", user.getUsername());
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
    @CacheEvict(key = "#pFinancialPortfolioId")
    public UserBudget saveUserBudget(MultiValueMap<String, String> formData, String pFinancialPortfolioId) {

	if (CollectionUtils.isEmpty(formData.get(DashboardConstants.Budget.AMOUNT_JSON))) {
	    throw new ResourceNotFoundException("UserBudgets", "formData", formData);
	}

	String categoryId = formData.get(DashboardConstants.Budget.CATEGORY_ID).get(0);
	List<Integer> categoryIds = new ArrayList<Integer>();
	categoryIds.add(Integer.parseInt(categoryId));
	List<UserBudget> categoryBudget = userBudgetRepository.fetchUserBudgetWithIds(categoryIds,
		pFinancialPortfolioId);

	if (CollectionUtils.isNotEmpty(categoryBudget)) {
	    Double plannedAmount = Double.parseDouble(formData.get(DashboardConstants.Budget.AMOUNT_JSON).get(0));
	    Double previousPlannedAmount = categoryBudget.get(0).getPlanned();
	    categoryBudget.get(0).setPlanned(plannedAmount + previousPlannedAmount);
	    UserBudget userBudgetSaved = userBudgetRepository.save(categoryBudget.get(0));
	    return userBudgetSaved;
	}

	UserBudget userBudget = new UserBudget();
	userBudget.setFinancialPortfolioId(pFinancialPortfolioId);
	userBudget.setCategoryId(Integer.parseInt(formData.get(DashboardConstants.Budget.CATEGORY_ID).get(0)));
	userBudget.setPlanned(Double.parseDouble(formData.get(DashboardConstants.Budget.AMOUNT_JSON).get(0)));
	String dateString = formData.get(DashboardConstants.Budget.DATE_MEANT_FOR).get(0);
	DateFormat format = new SimpleDateFormat(DashboardConstants.DATE_FORMAT, Locale.ENGLISH);
	Date date;
	try {
	    date = format.parse(dateString);
	    userBudget.setDateMeantFor(date);
	} catch (ParseException e) {
	    logger.error(e + " Unable to add date to the user budget");
	}

	UserBudget userBudgetResponse = userBudgetRepository.save(userBudget);
	return userBudgetResponse;
    }

    /**
     * 
     * Delete user budgets with category id
     * 
     */
    @Override
    @CacheEvict(key = "#pFinancialPortfolioId")
    public void deleteUserBudgets(String categoryIds, String financialPortfolioId) {
	String[] arrayOfCategoryIds = categoryIds.split(GenericConstants.COMMA);
	Set<String> categoryIdsAsSet = new HashSet<String>();
	categoryIdsAsSet.addAll(Arrays.asList(arrayOfCategoryIds));
	categoryIdsAsSet.remove(ERStringUtils.EMPTY);
	List<Integer> categoryIdsAsIntegerList = categoryIdsAsSet.stream().filter(Objects::nonNull)
		.map(s -> Integer.parseInt(s)).collect(Collectors.toList());

	userBudgetRepository.deleteUserBudgetWithIds(categoryIdsAsIntegerList, financialPortfolioId);
    }

    /**
     * 
     * Updates the amount to the budget. The amount is the total increase in the
     * budget.
     * 
     */
    @Override
    @CacheEvict(key = "#financialPortfolioId")
    public List<UserBudget> updateBudget(MultiValueMap<String, String> formData, String formFieldName,
	    String financialPortfolioId) {

	if (MapUtils.isEmpty(formData) || CollectionUtils.isEmpty(formData.keySet())) {
	    return null;
	}

	if (ERStringUtils.notEqualsIgnoreCase(formFieldName, DashboardConstants.Budget.AMOUNT_JSON)) {
	    return null;
	}

	List<Integer> categoryIdsAsIntegerList = formData.keySet().stream().filter(Objects::nonNull)
		.map(s -> Integer.parseInt(s)).collect(Collectors.toList());

	List<UserBudget> userBudgetList = userBudgetRepository.fetchUserBudgetWithIds(categoryIdsAsIntegerList,
		financialPortfolioId);

	for (UserBudget userBudget : userBudgetList) {
	    String categoryId = Integer.toString(userBudget.getCategoryId());
	    String amountToAddOrRemove = CollectionUtils.isEmpty(formData.get(categoryId)) ? "0"
		    : formData.get(categoryId).get(0);
	    userBudget.setPlanned(userBudget.getPlanned() + Double.parseDouble(amountToAddOrRemove));
	}

	List<UserBudget> userBudgetSaved = userBudgetRepository.saveAll(userBudgetList);
	return userBudgetSaved;

    }

}