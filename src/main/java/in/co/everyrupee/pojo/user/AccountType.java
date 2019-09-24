package in.co.everyrupee.pojo.user;

public enum AccountType {
    CASH("CASH"), SAVINGSACCOUNT("SAVINGS ACCOUNT"), CURRENTACCOUNT("CURRENT ACCOUNT"), ASSETS("ASSETS"),
    CREDITCARD("CREDIT CARD"), LIABILITY("LIABILITY");

    // declaring private variable for getting values
    private String type;

    public String getType() {
	return this.type;
    }

    // enum constructor - cannot be public or protected (Singleton)
    private AccountType(String type) {
	this.type = type;
    }
}
