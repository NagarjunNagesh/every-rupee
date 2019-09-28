package in.co.everyrupee.pojo.user;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import in.co.everyrupee.constants.income.DashboardConstants;
import in.co.everyrupee.constants.user.BankAccountConstants;

/**
 * Creating a bean for a Bank Account
 * 
 * @author Nagarjun Nagesh
 *
 */
/**
 * @author nagarjun
 *
 */
@Entity
@Table(name = BankAccountConstants.BANK_ACCOUNT_TABLE)
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = DashboardConstants.ID_SEQ)
    @SequenceGenerator(name = DashboardConstants.ID_SEQ, sequenceName = DashboardConstants.ID_SEQ, allocationSize = 100)
    @Column(name = BankAccountConstants.BANK_ACCOUNT_ID)
    private int id;

    @NotNull
    @Column(name = BankAccountConstants.BANK_ACCOUNT_NAME)
    @Size(max = 300)
    private String bankAccountName;

    @Column(name = BankAccountConstants.LINKED_ACCOUNT, columnDefinition = "boolean default false")
    private boolean linked;

    @Column(name = BankAccountConstants.SELECTED_ACCOUNT, columnDefinition = "boolean default false")
    private boolean selectedAccount;

    @Column(name = BankAccountConstants.BANK_ACCOUNT_NUMBER)
    @Size(max = 60)
    private String bankAccountNumber;

    @NotNull
    @Column(name = BankAccountConstants.FINANCIAL_PORTFOLIO_ID)
    @JsonProperty(access = Access.WRITE_ONLY)
    private Integer financialPortfolioId;

    @NotNull
    @Column(name = BankAccountConstants.USER_ID)
    @JsonProperty(access = Access.WRITE_ONLY)
    private Integer userId;

    @NotNull
    @Column(name = BankAccountConstants.ACCOUNT_BALANCE)
    private double accountBalance;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = DashboardConstants.CREATION_DATE)
    @JsonProperty(access = Access.WRITE_ONLY)
    private Date createDate;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = DashboardConstants.MODIFICATION_DATE)
    @JsonProperty(access = Access.WRITE_ONLY)
    private Date modifyDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = BankAccountConstants.ACCOUNT_TYPE, columnDefinition = BankAccountConstants.ACCOUNT_TYPE_COLUMN_DEFINITION)
    private AccountType accountType;

    public int getId() {
	return id;
    }

    public void setId(int id) {
	this.id = id;
    }

    public String getBankAccountName() {
	return bankAccountName;
    }

    public void setBankAccountName(String bankAccountName) {
	this.bankAccountName = bankAccountName;
    }

    public boolean isLinked() {
	return linked;
    }

    public void setLinked(boolean linked) {
	this.linked = linked;
    }

    public String getBankAccountNumber() {
	return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
	this.bankAccountNumber = bankAccountNumber;
    }

    public Integer getFinancialPortfolioId() {
	return financialPortfolioId;
    }

    public void setFinancialPortfolioId(Integer financialPortfolioId) {
	this.financialPortfolioId = financialPortfolioId;
    }

    public Integer getUserId() {
	return userId;
    }

    public void setUserId(Integer userId) {
	this.userId = userId;
    }

    public double getAccountBalance() {
	return accountBalance;
    }

    public void setAccountBalance(double accountBalance) {
	this.accountBalance = accountBalance;
    }

    public AccountType getAccountType() {
	return accountType;
    }

    public void setAccountType(AccountType accountType) {
	this.accountType = accountType;
    }

    public boolean isSelectedAccount() {
	return selectedAccount;
    }

    public void setSelectedAccount(boolean selectedAccount) {
	this.selectedAccount = selectedAccount;
    }

}
