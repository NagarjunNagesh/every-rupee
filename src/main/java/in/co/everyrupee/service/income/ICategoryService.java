package in.co.everyrupee.service.income;

import java.util.List;

import in.co.everyrupee.pojo.income.Category;

public interface ICategoryService {
    List<Category> fetchCategories();
    
    Boolean categoryIncome(int categoryId);
}
