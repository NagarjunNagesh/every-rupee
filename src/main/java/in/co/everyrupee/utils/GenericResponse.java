package in.co.everyrupee.utils;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;

import in.co.everyrupee.constants.GenericConstants;

public class GenericResponse {
	private static final String FIELD = "{\"field\":\"";
	private static final String DEFAULT_MESSAGE = "\",\"defaultMessage\":\"";
	private static final String CURLY_BRACES = "\"}";
	private static final String OBJECT = "{\"object\":\"";
	private static final String OPEN_BRACES = "[";
	private static final String CLOSED_BRACES = "]";
	private String message;
	private String error;

	public GenericResponse(final String message) {
		super();
		this.message = message;
	}

	public GenericResponse(final String message, final String error) {
		super();
		this.message = message;
		this.error = error;
	}

	public GenericResponse(List<ObjectError> allErrors, String error) {
		this.error = error;
		String temp = allErrors.stream().map(e -> {
			if (e instanceof FieldError) {
				return FIELD + ((FieldError) e).getField() + DEFAULT_MESSAGE + e.getDefaultMessage() + CURLY_BRACES;
			} else {
				return OBJECT + e.getObjectName() + DEFAULT_MESSAGE + e.getDefaultMessage() + CURLY_BRACES;
			}
		}).collect(Collectors.joining(GenericConstants.COMMA));
		this.message = OPEN_BRACES + temp + CLOSED_BRACES;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(final String message) {
		this.message = message;
	}

	public String getError() {
		return error;
	}

	public void setError(final String error) {
		this.error = error;
	}

}
