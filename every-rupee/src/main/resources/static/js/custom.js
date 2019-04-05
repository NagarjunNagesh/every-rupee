/**
 * Custom Java script for EveryRupee
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
	   
	   $('#signUpForm').submit(function(event) {
			register(event);
		});
	   
	   function register(event){
		   event.preventDefault();
		   
		   if (typeof grecaptcha !== 'undefined') {
		        var resp = grecaptcha.getResponse();
		        if (resp.length == 0) {
		            $("#captchaError").show().html("Please verify that you are not a robot.");
		            return;
		        }
		    }
		   
		   var formData= $('#signUpForm').serialize();
		    $.post("/sign-up",formData ,function(data){
		        if(data.message == "success"){
		            window.location.href = "/dashboard/home";
		        }
		        
		    })
		    .done(function(data) {
		    	 if(data.message == "success"){
			            window.location.href = "/dashboard/home";
			        }
		    })
		    .fail(function(data) {
		    	 grecaptcha.reset();
		    	 
		    	 // TODO change the error Response to JSON in Spring Boot
		    	 if(data.responseJSON.error == "InvalidReCaptcha"){ 
		             $("#captchaError").show().html(data.responseJSON.message);
		         }
		    	 else if(data.responseJSON.error == "UserAlreadyExist"){
		             $("#errorMessage").show().html(data.responseJSON.message);
		         }
		         else if(data.responseJSON.error.indexOf("InternalError") > -1){
		             window.location.href = "/sign-up?error=" + data.responseJSON.message;
		         }
		         else{
		        	 if(data.responseJSON.message != null) {
		        		 $("#errorMessage").show().html(data.responseJSON.message);
		        	 }
		        }
		    	 
		    });
		   
	   }
	   
	   var onReCaptchaSuccess = function(response) {
		    $("#captchaError").html("").hide();
	   };
	   
	   var onReCaptchaExpired = function(response) {
		    $("#captchaError").html("reCaptcha has expired.  Please solve a new reCaptcha").show();
		    grecaptcha.reset();
	   };
	   
	});
}
	
