package in.co.everyrupee.utils;

import java.util.regex.Pattern;

public class RegexUtils {

    public boolean isMatchingRegex(String input, final Pattern[] inputRegexes) {
	boolean inputMatches = true;
	for (Pattern inputRegex : inputRegexes) {
	    if (!inputRegex.matcher(input).matches()) {
		inputMatches = false;
	    }
	}
	return inputMatches;
    }
}
