package in.co.everyrupee.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.FORBIDDEN)
public class ResourceAlreadyPresentException extends RuntimeException {

    private static final String RESOURCE_FOUND_MESSAGE = "%s found with %s : '%s'";
    private static final long serialVersionUID = -3168326352377787401L;
    private String resourceName;
    private String fieldName;
    private Object fieldValue;

    public ResourceAlreadyPresentException(String resourceName, String fieldName, Object fieldValue) {
	super(String.format(RESOURCE_FOUND_MESSAGE, resourceName, fieldName, fieldValue));
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