package in.co.everyrupee.service.income;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;

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
import org.springframework.test.context.junit4.SpringRunner;

import in.co.everyrupee.exception.ResourceNotFoundException;
import in.co.everyrupee.pojo.income.Category;
import in.co.everyrupee.repository.income.CategoryRepository;

@RunWith(SpringRunner.class)
public class CategoryServiceTest {

    @Autowired
    private CategoryService categoryService;

    @MockBean
    private CategoryRepository categoryRepository;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    private List<Category> categoryList;

    @TestConfiguration
    static class UserBudgetServiceImplTestContextConfiguration {

	@Bean
	public CategoryService categoryService() {
	    return new CategoryService();
	}

    }

    @Before
    public void setUp() {
	Category category = new Category();
	category.setCategoryId(3);
	category.setCategoryName("Beauty");
	category.setParentCategory("2");

	setCategoryList(new ArrayList<Category>());
	getCategoryList().add(category);
    }

    /**
     * TEST: Fetch All categories
     */
    @Test
    public void fetchCategories() {
	// Fetch all categories
	Mockito.when(getCategoryRepository().fetchAllCategories()).thenReturn(getCategoryList());

	List<Category> categoryList = getCategoryService().fetchCategories();

	assertThat(categoryList).isNotEmpty();

    }

    /**
     * TEST: Fetch all categories (EXCEPTION)
     */
    @Test(expected = ResourceNotFoundException.class)
    public void fetchCategoriesException() {
	getCategoryService().fetchCategories();
    }

    /**
     * TEST: Fetch All categories
     */
    @Test
    public void categoryIncome() {
	// Fetch all categories
	Mockito.when(getCategoryRepository().fetchAllCategories()).thenReturn(getCategoryList());

	Boolean categoryPresent = getCategoryService().categoryIncome(3);

	assertTrue(categoryPresent);
    }

    private CategoryRepository getCategoryRepository() {
	return categoryRepository;
    }

    private CategoryService getCategoryService() {
	return categoryService;
    }

    private List<Category> getCategoryList() {
	return categoryList;
    }

    private void setCategoryList(List<Category> categoryList) {
	this.categoryList = categoryList;
    }

}
