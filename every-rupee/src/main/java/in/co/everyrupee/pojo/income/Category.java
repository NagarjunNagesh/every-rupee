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

import org.springframework.beans.factory.annotation.Value;

/**
 * POJO for Category
 * 
 * @author Nagarjun Nagesh
 *
 */
@Entity
@Table(name = "category")
public class Category implements Serializable {

    private static final long serialVersionUID = -7829537522506194637L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "coupon_seq")
    @SequenceGenerator(name = "coupon_seq", sequenceName = "coupon_seq", allocationSize = 100)
    @Column(name = "category_id")
    private int categoryId;

    @NotNull
    @Column(name = "category_name")
    private String categoryName;

    @NotNull
    @Value("${category.parentCategory}")
    @Column(name = "parent_category")
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
