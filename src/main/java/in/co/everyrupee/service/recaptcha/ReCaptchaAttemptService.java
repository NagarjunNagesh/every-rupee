package in.co.everyrupee.service.recaptcha;

import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

@Service("reCaptchaAttemptService")
public class ReCaptchaAttemptService {
    private final int MAX_ATTEMPT = 4;
    private LoadingCache<String, Integer> attemptsCache;

    public ReCaptchaAttemptService() {
	super();
	attemptsCache = CacheBuilder.newBuilder().expireAfterWrite(4, TimeUnit.HOURS)
		.build(new CacheLoader<String, Integer>() {
		    @Override
		    public Integer load(final String key) {
			return 0;
		    }
		});
    }

    public void reCaptchaSucceeded(final String key) {
	getAttemptsCache().invalidate(key);
    }

    public void reCaptchaFailed(final String key) {
	int attempts = getAttemptsCache().getUnchecked(key);
	attempts++;
	getAttemptsCache().put(key, attempts);
    }

    public boolean isBlocked(final String key) {
	return attemptsCache.getUnchecked(key) >= MAX_ATTEMPT;
    }

    public LoadingCache<String, Integer> getAttemptsCache() {
	return attemptsCache;
    }

    public void setAttemptsCache(LoadingCache<String, Integer> attemptsCache) {
	this.attemptsCache = attemptsCache;
    }

}