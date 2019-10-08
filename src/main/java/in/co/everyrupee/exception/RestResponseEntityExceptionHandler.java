package in.co.everyrupee.exception;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import in.co.everyrupee.exception.login.PasswordNotValidException;
import in.co.everyrupee.exception.login.UserAlreadyExistException;
import in.co.everyrupee.exception.login.UserNotFoundException;
import in.co.everyrupee.exception.recaptcha.ReCaptchaInvalidException;
import in.co.everyrupee.exception.recaptcha.ReCaptchaUnavailableException;
import in.co.everyrupee.utils.GenericResponse;

@ControllerAdvice
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

	@Autowired
	private MessageSource messages;

	public RestResponseEntityExceptionHandler() {
		super();
	}

	// API

	// 400
	@Override
	@ResponseBody
	protected ResponseEntity<Object> handleBindException(final BindException ex, final HttpHeaders headers,
			final HttpStatus status, final WebRequest request) {
		logger.error("400 Status Code", ex);
		final BindingResult result = ex.getBindingResult();
		final GenericResponse bodyOfResponse = new GenericResponse(result.getAllErrors(),
				"Invalid" + result.getObjectName());
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
	}

	@Override
	@ResponseBody
	protected ResponseEntity<Object> handleMethodArgumentNotValid(final MethodArgumentNotValidException ex,
			final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
		logger.error("400 Status Code", ex);
		final BindingResult result = ex.getBindingResult();
		final GenericResponse bodyOfResponse = new GenericResponse(result.getAllErrors(),
				"Invalid" + result.getObjectName());
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
	}

//	@ExceptionHandler({ InvalidOldPasswordException.class })
//	public ResponseEntity<Object> handleInvalidOldPassword(final RuntimeException ex, final WebRequest request) {
//		logger.error("400 Status Code", ex);
//		final GenericResponse bodyOfResponse = new GenericResponse(
//				messages.getMessage("message.invalidOldPassword", null, request.getLocale()), "InvalidOldPassword");
//		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
//	}

	@ExceptionHandler({ ReCaptchaInvalidException.class })
	@ResponseBody
	public ResponseEntity<Object> handleReCaptchaInvalid(final RuntimeException ex, final WebRequest request) {
		logger.error("400 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.invalidReCaptcha", null, request.getLocale()), "InvalidReCaptcha");
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
	}

	// 404
	@ExceptionHandler({ UserNotFoundException.class })
	@ResponseBody
	public ResponseEntity<Object> handleUserNotFound(final RuntimeException ex, final WebRequest request) {
		logger.error("404 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.userNotFound", null, request.getLocale()), "UserNotFound");
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.NOT_FOUND, request);
	}

	// 409
	@ExceptionHandler({ UserAlreadyExistException.class })
	@ResponseBody
	public ResponseEntity<Object> handleUserAlreadyExist(final RuntimeException ex, final WebRequest request) {
		logger.error("409 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.regError", null, request.getLocale()), "UserAlreadyExist");
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.CONFLICT, request);
	}

	// 500
	@ExceptionHandler({ MailAuthenticationException.class })
	@ResponseBody
	public ResponseEntity<Object> handleMail(final RuntimeException ex, final WebRequest request) {
		logger.error("500 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.email.config.error", null, request.getLocale()), "MailError");
		return new ResponseEntity<Object>(bodyOfResponse, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@ExceptionHandler({ ReCaptchaUnavailableException.class })
	@ResponseBody
	public ResponseEntity<Object> handleReCaptchaUnavailable(final RuntimeException ex, final WebRequest request) {
		logger.error("500 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.unavailableReCaptcha", null, request.getLocale()), "InvalidReCaptcha");
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR,
				request);
	}

	@ExceptionHandler({ Exception.class })
	@ResponseBody
	public ResponseEntity<Object> handleInternal(final RuntimeException ex, final WebRequest request) {
		logger.error("500 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.error", null, request.getLocale()), "InternalError");
		return new ResponseEntity<Object>(bodyOfResponse, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	// 400
	@ExceptionHandler({ PasswordNotValidException.class })
	@ResponseBody
	public ResponseEntity<Object> handlePasswordNotValidException(final RuntimeException ex, final WebRequest request) {
		logger.error("400 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.passwordNotValidError", null, request.getLocale()), "PasswordNotValid");
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
	}

	// 400
	@ExceptionHandler({ ResourceNotFoundException.class })
	@ResponseBody
	public ResponseEntity<Object> handleResourceNotFoundException(final RuntimeException ex, final WebRequest request) {
		logger.error("400 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.resourceNotFound", null, request.getLocale()), "ResourceNotFound");
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
	}

	// 401
	@ExceptionHandler({ SecurityException.class })
	@ResponseBody
	public ResponseEntity<Object> handleSecurityException(final RuntimeException ex, final WebRequest request) {
		logger.error("401 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.unauth", null, request.getLocale()), "Unauthorized");
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.UNAUTHORIZED, request);
	}

	// 403
	@ExceptionHandler({ ResourceAlreadyPresentException.class })
	@ResponseBody
	public ResponseEntity<Object> handleResourceAlreadyPresentException(final RuntimeException ex,
			final WebRequest request) {
		logger.error("403 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.resourceFound", null, request.getLocale()), "ResourceAlreadyPresent");
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.FORBIDDEN, request);
	}

	// 406
	@ExceptionHandler({ InvalidAttributeValueException.class })
	@ResponseBody
	public ResponseEntity<Object> handleInvalidAttributeValueException(final RuntimeException ex,
			final WebRequest request) {
		logger.error("406 Status Code", ex);
		final GenericResponse bodyOfResponse = new GenericResponse(
				messages.getMessage("message.invalidAttributeValue", null, request.getLocale()),
				"InvalidAttributeValue");
		return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), HttpStatus.NOT_ACCEPTABLE, request);
	}

}