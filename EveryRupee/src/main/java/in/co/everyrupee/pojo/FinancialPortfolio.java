/**
 * 
 */
package in.co.everyrupee.pojo;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

/**
 * @author nagarjun
 *
 */
@Entity
@Table(name = "FINANCIAL_PORTFOLIO")
public class FinancialPortfolio implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 4387424250638939980L;

	@Id @GeneratedValue(generator="system-uuid")
	@GenericGenerator(name="system-uuid", strategy = "uuid")
	@Column(name="CUSTOMER_ID")
	private String customerId;	
	
	@Column(name="CASH_AVAILABLE")
	private Double cashAvailable;
	
	@Column(name="CREDITCARD_BALANCE")
	private Double creditcardBalance;
	
	@Column(name="HOME_LOAN_BALANCE")
	private Double homeLoanBalance;
	
	

	/**
	 * @return the customerId
	 */
	public String getCustomerId() {
		return customerId;
	}

	/**
	 * @param customerId the customerId to set
	 */
	public void setCustomerId(String customerId) {
		this.customerId = customerId;
	}

	/**
	 * @return the cashAvailable
	 */
	public Double getCashAvailable() {
		return cashAvailable;
	}

	/**
	 * @param cashAvailable the cashAvailable to set
	 */
	public void setCashAvailable(Double cashAvailable) {
		this.cashAvailable = cashAvailable;
	}

	/**
	 * @return the creditcardBalance
	 */
	public Double getCreditcardBalance() {
		return creditcardBalance;
	}

	/**
	 * @param creditcardBalance the creditcardBalance to set
	 */
	public void setCreditcardBalance(Double creditcardBalance) {
		this.creditcardBalance = creditcardBalance;
	}

	/**
	 * @return the homeLoanBalance
	 */
	public Double getHomeLoanBalance() {
		return homeLoanBalance;
	}

	/**
	 * @param homeLoanBalance the homeLoanBalance to set
	 */
	public void setHomeLoanBalance(Double homeLoanBalance) {
		this.homeLoanBalance = homeLoanBalance;
	}
}
