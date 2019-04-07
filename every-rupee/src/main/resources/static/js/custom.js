/**
 * Custom Java script for EveryRupee
 * 
 * Nagarjun Nagesh
 */

	
window.onload = function () {
	$(document).ready(function(){
		
		var emailValidationRegularExpression = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	   
	   var nameRegularExpression = /^[A-Za-z ]+$/;
	   
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
		   $("#captchaError").html("").hide();
		   $("#errorMessage").html("").hide();
		   var formValidation = true;
		   
		   // Form Validation
		   var nameSignUp = $("#nameSignUp").val();
		   if(!(nameRegularExpression.test(nameSignUp))){
			   $("#errorMessage").show().html("Name field is empty <br/>");
			   formValidation = false;
		   }
		   
		   var emailSignUp = $("#emailSignUp").val();
		   if (emailSignUp == '' || !emailValidationRegularExpression.test(emailSignUp)) {
			   $("#errorMessage").show().append("Email field is empty or not valid");
			   formValidation = false;
		   }
		   
		   var passwordSignUp = $("#password").val();
		   
		   
		   if (typeof grecaptcha !== 'undefined') {
		        var resp = grecaptcha.getResponse();
		        if (resp.length == 0) {
		            $("#captchaError").show().html("Please verify that you are not a robot.");
		            formValidation = false;
		        }
		    }
		   
		   if(!formValidation) {
			   return;
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
		    	 
		    	 if(data.responseJSON.error == "InvalidReCaptcha"){ 
		             $("#captchaError").show().html(data.responseJSON.message);
		         }
		    	 else if(data.responseJSON.error == "UserAlreadyExist"){
		             $("#errorMessage").show().html(data.responseJSON.message);
		         }
		         else if(data.responseJSON.error.indexOf("InternalError") > -1){
		        	  $("#errorMessage").show().html(data.responseJSON.message);
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
	   
	   // LOGIN JS attempt
	});
}
	
