package in.co.everyrupee.configuration;

import java.util.concurrent.Executor;

import org.apache.tomcat.util.threads.ThreadPoolExecutor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Create a custom Async Configuration which overrides the default core size, max size and pool size for efficiency
 * 
 * @author nagarjun
 *
 */
@EnableAsync
@Configuration
@ConfigurationProperties(prefix = "async.thread.pool")
public class AsyncConfiguration implements AsyncConfigurer {


  @Override
  public Executor getAsyncExecutor() {

    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(5);
    executor.setMaxPoolSize(10);
    executor.setQueueCapacity(25);
    executor.setThreadNamePrefix("worker-exec-");
    executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    executor.initialize();
    return executor;

  }

  /**
   * Custom exception for async errors
   * 
   */
  @Override
  public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {

    return (ex, method, params) -> {
      Class<?> targetClass = method.getDeclaringClass();
      Logger logger = LoggerFactory.getLogger(targetClass);
      logger.error(ex.getMessage(), ex);
    };

  }

}