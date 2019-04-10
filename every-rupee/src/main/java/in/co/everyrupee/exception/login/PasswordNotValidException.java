package in.co.everyrupee.exception.login;

public class PasswordNotValidException extends RuntimeException {

	private static final long serialVersionUID = -8239063451607584382L;

	public PasswordNotValidException() {
		super();
	}

	public PasswordNotValidException(final String message, final Throwable cause) {
		super(message, cause);
	}

	public PasswordNotValidException(final String message) {
		super(message);
	}

	public PasswordNotValidException(final Throwable cause) {
		super(cause);
	}

}