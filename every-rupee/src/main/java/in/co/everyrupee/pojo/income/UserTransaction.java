package in.co.everyrupee.pojo.income;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * POJO for User Transactions
 * 
 * @author nagarjun
 *
 */
@Entity
@Table(name = "user_transactions")
public class UserTransaction implements Serializable {

    private static final long serialVersionUID = 4387424250638939980L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "transaction_id")
    private int transactionId;

    @Column(name = "description")
    private String description;

    @Column(name = "category_id")
    private int categoryId;

    @NotNull
    @Column(name = "financial_portfolio_id")
    private String financialPortfolioId;

    @NotNull
    @Column(name = "amount")
    private double amount;

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

}