package in.co.everyrupee.pojo.income;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.pojo.RecurrencePeriod;

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
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = DashboardConstants.ID_SEQ)
    @SequenceGenerator(name = DashboardConstants.ID_SEQ, sequenceName = DashboardConstants.ID_SEQ, allocationSize = 100)
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
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateMeantFor;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = DashboardConstants.CREATION_DATE)
    private Date createDate;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = DashboardConstants.MODIFICATION_DATE)
    private Date modifyDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = DashboardConstants.Transactions.RECURRENCE, columnDefinition = DashboardConstants.RECURRENCE_COLUMN_DEFINITION)
    private RecurrencePeriod recurrence;

    @PrePersist
    protected void onCreate() {
	if (getDateMeantFor() == null) {
	    setDateMeantFor(new Date());
	}

	if (getRecurrence() == null) {
	    setRecurrence(RecurrencePeriod.NEVER);
	}
    }

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

    public RecurrencePeriod getRecurrence() {
	return recurrence;
    }

    public void setRecurrence(RecurrencePeriod recurrence) {
	this.recurrence = recurrence;
    }

}