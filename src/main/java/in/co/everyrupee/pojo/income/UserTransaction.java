package in.co.everyrupee.pojo.income;

import java.io.Serializable;
import java.util.Date;

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
 * POJO for User Transactions
 * 
 * @author nagarjun
 *
 */
@Entity
@Table(name = DashboardConstants.Transactions.TRANSACTIONS_TABLE)
public class UserTransaction implements Serializable {

    private static final long serialVersionUID = 4387424250638939980L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = DashboardConstants.COUPON_SEQ)
    @SequenceGenerator(name = DashboardConstants.COUPON_SEQ, sequenceName = DashboardConstants.COUPON_SEQ, allocationSize = 100)
    @Column(name = DashboardConstants.Transactions.TRANSACTIONS_ID)
    private int transactionId;

    @Column(name = DashboardConstants.Transactions.DESCRIPTION)
    private String description;

    @Column(name = DashboardConstants.Category.CATEGORY_ID)
    private int categoryId;

    @NotNull
    @Column(name = DashboardConstants.Transactions.FINANCIAL_PORTFOLIO_ID)
    private String financialPortfolioId;

    @NotNull
    @Column(name = DashboardConstants.Transactions.AMOUNT)
    private double amount;
    
    @NotNull
    @Column(name = DashboardConstants.Budget.DATE_MEANT_FOR)
    private Date dateMeantFor;

    public int getTransactionId() {
	return transactionId;
    }

    public void setTransactionId(int transactionId) {
	this.transactionId = transactionId;
    }

    public String getDescription() {
	return description;
    }

    public void setDescription(String description) {
	this.description = description;
    }

    public int getCategoryId() {
	return categoryId;
    }

    public void setCategoryId(int categoryId) {
	this.categoryId = categoryId;
    }

    public double getAmount() {
	return amount;
    }

    public void setAmount(double amount) {
	this.amount = amount;
    }

    public String getFinancialPortfolioId() {
	return financialPortfolioId;
    }

    public void setFinancialPortfolioId(String financialPortfolioId) {
	this.financialPortfolioId = financialPortfolioId;
    }
    
    public Date getDateMeantFor() {
        return dateMeantFor;
    }

    public void setDateMeantFor(Date dateMeantFor) {
        this.dateMeantFor = dateMeantFor;
    }

}