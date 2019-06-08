package in.co.everyrupee.service.income;

import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.Category;
import in.co.everyrupee.repository.income.CategoryRepository;

@Service
public class CategoryService implements ICategoryService {

    // TODO enable transactional commit of user transactions with changes to
    @Autowired
    CategoryRepository categoryRepository;

    @Override
    @Cacheable("categories")
    public List<Category> fetchCategories() {
	List<Category> categoriesList = categoryRepository.fetchAllCategories();

	if (CollectionUtils.isEmpty(categoriesList)) {
	    throw new ResourceNotFoundException("Category", "categories", "all");
	}
	return categoriesList;
    }

}
