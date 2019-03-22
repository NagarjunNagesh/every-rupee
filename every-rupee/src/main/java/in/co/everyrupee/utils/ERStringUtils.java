/**
 * 
 */
package in.co.everyrupee.utils;

import org.apache.commons.lang3.StringUtils;

/**
 * @author nagarjun
 *
 */
public class ERStringUtils extends StringUtils {
	
	/**
     * This method returns the opposite of equalsignorecase method
     *
     * @param pString
     * @param pString2
     * @return
     */
    public static boolean notEqualsIgnoreCase(CharSequence pString,
                                              CharSequence pString2) {
        return !equalsIgnoreCase(pString, pString2);
    }

    /**
     * This method returns the opposite of contains method
     *
     * @param seq
     * @param searchSeq
     * @return
     */
    public static boolean notContains(CharSequence seq,
                                      CharSequence searchSeq) {
        return !contains(seq, searchSeq);

    }

    /**
     * This method returns the opposite of starts with method
     *
     * @param str
     * @param prefix
     * @return
     */
    public static boolean notStartsWith(CharSequence str,
                                        CharSequence prefix) {
        return !startsWith(str, prefix);

    }

}
