package in.co.everyrupee.service.income;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
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
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.UserBudget;
import in.co.everyrupee.repository.income.UserBudgetRepository;
import in.co.everyrupee.security.core.userdetails.MyUser;
import in.co.everyrupee.utils.ERStringUtils;

@Transactional
@Service
@CacheConfig(cacheNames = { "userBudget" })
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
		List<UserBudget> userBudgetList = userBudgetRepository
			.findByFinancialPortfolioId(pFinancialPortfolioId);

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
		List<UserBudget> userBudgetList = userBudgetRepository.fetchUserBudgetWithIds(budgetIdsAsIntegerList, pFinancialPortfolioId);

		if (CollectionUtils.isEmpty(userBudgetList)) {
		    logger.warn("user budgets data is empty for user ", user.getUsername());
		}

		return userBudgetList;
	}
	
	/**
     * Save User Budget to the database
     * 
     * @param formData
     * @return
     */
    @Override
    @CacheEvict(key = "#pFinancialPortfolioId")
    public UserBudget saveUserBudget(MultiValueMap<String, String> formData, String pFinancialPortfolioId) {

	if (CollectionUtils.isEmpty(formData.get("amount"))) {
	    throw new ResourceNotFoundException("UserBudgets", "formData", formData);
	}

	UserBudget userBudget = new UserBudget();
	userBudget.setFinancialPortfolioId(pFinancialPortfolioId);
	userBudget.setCategoryId(Integer.parseInt(formData.get("categoryId").get(0)));
	userBudget.setPlanned(Double.parseDouble(formData.get("plannedAmount").get(0)));

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

	@Override
    @CacheEvict(key = "#financialPortfolioId")
    public UserBudget updateBudget(MultiValueMap<String, String> formData, String formFieldName,
	    String financialPortfolioId) {

	Optional<UserBudget> userBudget = userBudgetRepository
		.findById(Integer.parseInt(formData.get("budgetId").get(0)));

	if (ERStringUtils.equalsIgnoreCase(formFieldName, "plannedAmount")) {
	    userBudget.get().setPlanned(Double.parseDouble(formData.get("plannedAmount").get(0)));
	}
	
	UserBudget userTransactionSaved = userBudgetRepository.save(userBudget.get());

	return userTransactionSaved;

	}
    
}
