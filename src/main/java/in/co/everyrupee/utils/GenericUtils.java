package in.co.everyrupee.utils;

import org.codehaus.jackson.map.ObjectMapper;

/**
 * Generic utility services
 * 
 * @author Nagarjun
 *
 */
public class GenericUtils {

    public static String asJsonString(final Object obj) {
	try {
	    return new ObjectMapper().writeValueAsString(obj);
	} catch (Exception e) {
	    throw new RuntimeException(e);
	}
    }

}
