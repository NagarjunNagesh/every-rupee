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

/**
 * 
 * POJO for User Budget
 * 
 * @author Nagarjun
 *
 */
@Entity
@Table(name = "user_budget")
public class UserBudget implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "coupon_seq")
    @SequenceGenerator(name = "coupon_seq", sequenceName = "coupon_seq", allocationSize = 100)
	@Column(name = "budget_id")
	private int budgetId;
	
	@NotNull
    @Column(name = "financial_portfolio_id")
    private String financialPortfolioId;
	
	@NotNull
	@Column(name = "category_id")
    private int categoryId;
	
	@NotNull
    @Column(name = "planned")
    private double planned;

	public int getBudgetId() {
		return budgetId;
	}

	public void setBudgetId(int budgetId) {
		this.budgetId = budgetId;
	}

	public String getFinancialPortfolioId() {
		return financialPortfolioId;
	}

	public void setFinancialPortfolioId(String financialPortfolioId) {
		this.financialPortfolioId = financialPortfolioId;
	}

	public int getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}

	public double getPlanned() {
		return planned;
	}

	public void setPlanned(double planned) {
		this.planned = planned;
	}
	
}
