package in.co.everyrupee.pojo.income;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.springframework.beans.factory.annotation.Value;

import in.co.everyrupee.constants.income.DashboardConstants;

/**
 * POJO for Category
 * 
 * @author Nagarjun Nagesh
 *
 */
@Entity
@Table(name = DashboardConstants.Category.CATEGORY_TABLE)
public class Category implements Serializable {

    private static final long serialVersionUID = -7829537522506194637L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = DashboardConstants.ID_SEQ)
    @SequenceGenerator(name = DashboardConstants.ID_SEQ, sequenceName = DashboardConstants.ID_SEQ, allocationSize = 100)
    @Column(name = DashboardConstants.Category.CATEGORY_ID)
    private int categoryId;

    @NotNull
    @Column(name = DashboardConstants.Category.CATEGORY_NAME)
    @Size(max = 60)
    private String categoryName;

    @NotNull
    @Value("${category.parentCategory}")
    @Column(name = DashboardConstants.Category.PARENT_CATEGORY)
    private String parentCategory;

    public int getCategoryId() {
	return categoryId;
    }

    public void setCategoryId(int categoryId) {
	this.categoryId = categoryId;
    }

    public String getCategoryName() {
	return categoryName;
    }

    public void setCategoryName(String categoryName) {
	this.categoryName = categoryName;
    }

    public String getParentCategory() {
	return parentCategory;
    }

    public void setParentCategory(String parentCategory) {
	this.parentCategory = parentCategory;
    }

}
