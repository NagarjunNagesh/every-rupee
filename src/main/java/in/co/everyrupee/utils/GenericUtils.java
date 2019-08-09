package in.co.everyrupee.utils;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

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

    public static List<Integer> removeAll(List<Integer> list, int element) {
	return list.stream().filter(e -> !Objects.equals(e, element)).collect(Collectors.toList());
    }

}
