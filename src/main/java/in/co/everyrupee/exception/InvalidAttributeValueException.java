package in.co.everyrupee.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_ACCEPTABLE)
public class InvalidAttributeValueException extends RuntimeException {

    private static final String INVALID_ATTRIBUTE_VALUE_MESSAGE = "%s should not be called to copy for the parameter %s : '%s'";
    private static final long serialVersionUID = -3168326352377787401L;
    private String resourceName;
    private String fieldName;
    private Object fieldValue;

    public InvalidAttributeValueException(String resourceName, String fieldName, Object fieldValue) {
	super(String.format(INVALID_ATTRIBUTE_VALUE_MESSAGE, resourceName, fieldName, fieldValue));
	this.resourceName = resourceName;
	this.fieldName = fieldName;
	this.fieldValue = fieldValue;
    }

    public String getResourceName() {
	return resourceName;
    }

    public String getFieldName() {
	return fieldName;
    }

    public Object getFieldValue() {
	return fieldValue;
    }
}