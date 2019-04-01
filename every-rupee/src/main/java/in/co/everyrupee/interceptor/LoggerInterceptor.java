package in.co.everyrupee.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor class to set the MDC for Logger
 * 
 * @param request
 * @param response
 * @param handler
 * @return
 * @throws Exception
 */
@Component
public class LoggerInterceptor implements HandlerInterceptor {

	private static final String EVERY_RUPEE_APPLICATION_NAME = "EveryRupeeApplication";
	private static final String LOGID_FOR_LOGBACK = "logid";
	private static final String LOG_DEBUG_PRE_HANDLER_MESSAGE = "Pre Handle method is called for log-";

	Logger logger = LoggerFactory.getLogger(this.getClass());

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		MDC.put(LOGID_FOR_LOGBACK, EVERY_RUPEE_APPLICATION_NAME);
		logger.debug(LOG_DEBUG_PRE_HANDLER_MESSAGE + EVERY_RUPEE_APPLICATION_NAME);
		return true;
	}

}