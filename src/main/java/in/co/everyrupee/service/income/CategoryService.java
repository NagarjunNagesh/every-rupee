package in.co.everyrupee.service.income;

import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import in.co.everyrupee.constants.GenericConstants;
import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.Category;
import in.co.everyrupee.repository.income.CategoryRepository;
import in.co.everyrupee.utils.ERStringUtils;

@Transactional
@Service
public class CategoryService implements ICategoryService {

	@Autowired
	private CategoryRepository categoryRepository;

	@Override
	@Cacheable(value = DashboardConstants.Category.CATEGORY_CACHE_NAME, key = "#root.method.name")
	public List<Category> fetchCategories() {
		List<Category> categoriesList = categoryRepository.fetchAllCategories();

		if (CollectionUtils.isEmpty(categoriesList)) {
			throw new ResourceNotFoundException("Category", "categories", "all");
		}
		return categoriesList;
	}

	@Override
	@Cacheable(value = DashboardConstants.Category.CATEGORY_INCOME_OR_NOT, key = "#root.method.name")
	public Boolean categoryIncome(int categoryId) {
		List<Category> categoriesList = categoryRepository.fetchAllCategories();

		if (CollectionUtils.isEmpty(categoriesList)) {
			throw new ResourceNotFoundException("Category", "categories", "all");
		}

		Optional<Category> category = categoriesList.stream().filter(x -> categoryId == x.getCategoryId()).findFirst();

		if (category.isPresent()) {
			Category currentCategory = category.get();
			if (ERStringUtils.equalsIgnoreCase(currentCategory.getParentCategory(), GenericConstants.INCOME_CATEGORY)) {
				return true;
			}
			return false;
		}

		return null;
	}

}
