package in.co.everyrupee.pojo.income;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.GenericGenerator;

/**
 * POJO for financial portfolio
 * 
 * @author nagarjun
 *
 */
@Entity
@Table(name = "user_transactions")
public class UserTransaction implements Serializable {

    /**
     * 
     */
    private static final long serialVersionUID = 4387424250638939980L;

    @Id
    @GeneratedValue(generator = "system-uuid")
    @GenericGenerator(name = "system-uuid", strategy = "uuid")
    @Column(name = "transaction_id")
    private String transactionId;

    @NotNull
    @Column(name = "description")
    private String description;

    @Column(name = "category")
    private String category;

    @NotNull
    @Column(name = "user_id")
    private int userId;

    @NotNull
    @Column(name = "amount")
    private int amount;

    public String getTransactionId() {
	return transactionId;
    }

    public void setTransactionId(String transactionId) {
	this.transactionId = transactionId;
    }

    public String getDescription() {
	return description;
    }

    public void setDescription(String description) {
	this.description = description;
    }

    public String getCategory() {
	return category;
    }

    public void setCategory(String category) {
	this.category = category;
    }

    public int getUserId() {
	return userId;
    }

    public void setUserId(int userId) {
	this.userId = userId;
    }

    public int getAmount() {
	return amount;
    }

    public void setAmount(int amount) {
	this.amount = amount;
    }

}