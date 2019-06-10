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

import in.co.everyrupee.constants.income.DashboardConstants;

/**
 * 
 * POJO for User Budget
 * 
 * @author Nagarjun
 *
 */
@Entity
@Table(name = DashboardConstants.Budget.USER_BUDGET_TABLE)
public class UserBudget implements Serializable {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = DashboardConstants.COUPON_SEQ)
    @SequenceGenerator(name = DashboardConstants.COUPON_SEQ, sequenceName = DashboardConstants.COUPON_SEQ, allocationSize = 100)
    @Column(name = DashboardConstants.Budget.BUDGET_ID)
    private int budgetId;

    @NotNull
    @Column(name = DashboardConstants.Budget.FINANCIAL_PORTFOLIO_ID)
    private String financialPortfolioId;

    @NotNull
    @Column(name = DashboardConstants.Budget.CATEGORY_ID)
    private int categoryId;

    @NotNull
    @Column(name = DashboardConstants.Budget.PLANNED)
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
