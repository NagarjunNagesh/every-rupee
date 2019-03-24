/**
 * Custom Java script for EveryRupee
 * 
 * https://www.foreach.be/blog/spring-social-how-render-social-login-flow-popup
 * 
 * Nagarjun Nagesh
 */

$(document).ready(function() {
	
	function loginSocial( e ) {
	    e.preventDefault();
	    var triggerElement = $( e.target );
	    var __ret = calculatePopupDimensions(); 
	
	    var provider = triggerElement.attr( 'data-social-provider' );
	    var url = '/spring-social-quickstart/signin/' + provider + '/popup';
	    var specs = 'scrollbars=yes, width=' + __ret.w 
	        + ', height=' + __ret.h + ', top=' + __ret.top + ', left=' + __ret.left;
	 
	   window.open( url, '_blank', specs );
	} 
});