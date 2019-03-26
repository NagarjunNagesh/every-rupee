/**
 * Custom Java script for EveryRupee
 * 
 * https://github.com/ccoloradoc/OAuth2Sample
 * 
 * Nagarjun Nagesh
 */

	
window.onload = function () {
	$(document).ready(function(){
		
		//	Load all user data for admin users
	   $.getJSON("http://localhost:8084/api/financial_portfolio", function(result){
	      $.each(result, function(key,value) {
	         $("#productsJson").append(value.cashAvailable+" "+value.creditcardBalance+" ");
	      }); 
	   });
	   
	});
}
	
