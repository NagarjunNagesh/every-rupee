package in.co.everyrupee.controller.income;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import in.co.everyrupee.pojo.income.Category;
import in.co.everyrupee.service.income.ICategoryService;

/**
 * Manage API Category
 * 
 * @author Nagarjun Nagesh
 *
 */
@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    ICategoryService categoryService;

    // Get a Single User Transaction
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public List<Category> getCategoryById(Principal userPrincipal) {
	if (userPrincipal == null) {
	    throw new SecurityException();
	}

	return categoryService.fetchCategories();
    }

}
