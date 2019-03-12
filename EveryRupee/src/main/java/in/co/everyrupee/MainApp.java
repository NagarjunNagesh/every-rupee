/**
 * 
 */
package in.co.everyrupee;

import org.hibernate.Session;

import in.co.everyrupee.config.HibernateUtil;
import in.co.everyrupee.pojo.FinancialPortfolio;

/**
 * @author nagarjun
 *
 */
public class MainApp {
	public static void main(String[] args) {
	    Session session = HibernateUtil.getSessionFactory().openSession();
	    session.beginTransaction();

	    FinancialPortfolio financialPortfolio = new FinancialPortfolio();
    	financialPortfolio.setCashAvailable(200d);
    	financialPortfolio.setCreditcardBalance(300d);
    	financialPortfolio.setHomeLoanBalance(500d);
    	session.save(financialPortfolio);
    	System.out.println(financialPortfolio.getCustomerId());

	    session.getTransaction().commit();
	    session.close();
	    System.out.println("Successfully inserted");
	    
	    HibernateUtil.shutdown();
	    
	   
	    	
	    	
	  }
}
