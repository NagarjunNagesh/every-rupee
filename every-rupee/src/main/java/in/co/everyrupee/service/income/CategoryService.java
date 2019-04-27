package in.co.everyrupee.service.income;

import java.util.List;

import javax.transaction.Transactional;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.Category;
import in.co.everyrupee.repository.income.CategoryRepository;

@Transactional
@Service
public class CategoryService implements ICategoryService {

    // TODO enable transactional commit of user transactions with changes to
    @Autowired
    CategoryRepository categoryRepository;

    @Override
    public List<Category> fetchCategories() {
	List<Category> categoriesList = categoryRepository.fetchAllCategories();

	if (CollectionUtils.isEmpty(categoriesList)) {
	    throw new ResourceNotFoundException("Category", "categories", "all");
	}
	return categoriesList;
    }

}
