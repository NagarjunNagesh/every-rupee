package in.co.everyrupee.events.registration;

import java.util.Locale;

import org.springframework.context.ApplicationEvent;

import in.co.everyrupee.pojo.login.Profile;

/**
 * An event which is registered for the listener to listen to, for registration
 * scenarios.
 * 
 * @author nagarjun
 *
 */
@SuppressWarnings("serial")
public class OnRegistrationCompleteEvent extends ApplicationEvent {

    private final String appUrl;
    private final Locale locale;
    private final Profile profile;

    public OnRegistrationCompleteEvent(final Profile profile, final Locale locale, final String appUrl) {
	super(profile);
	this.profile = profile;
	this.locale = locale;
	this.appUrl = appUrl;
    }

    //

    public String getAppUrl() {
	return appUrl;
    }

    public Locale getLocale() {
	return locale;
    }

    public Profile getUser() {
	return profile;
    }

}