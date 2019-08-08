package in.co.everyrupee.pojo;

public enum TransactionType {
    INCOME("Income"), EXPENSE("Expense");

    private String type;

    private TransactionType(String type) {
	this.type = type;
    }

}
