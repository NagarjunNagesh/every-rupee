/**
 * 
 */
window.onload = function () {
	$(document).ready(function(){
		//Load all user data for admin users
		$.getJSON("http://localhost:8084/api/transactions/31", function(result){
		   $.each(result, function(key,value) {
		      $("#productsJson").append(value.amount);
		   }); 
		});
		
		$('#transactionsForm').submit(function(event) {
			register(event);
		});
		
		function register(event){
		   event.preventDefault();
		   $("#errorMessage").html("").hide();
		   var formValidation = true;
			
		   var description = $("#description").val();
		   if(description == null || description == ''){
			   $("#errorMessage").show().html("description field is empty <br/>");
			   formValidation = false;
		   }
		   
		   var amount = $("#amount").val();
		   if(amount == null || amount == ''){
			   $("#errorMessage").show().append("amount field is empty <br/>");
			   formValidation = false;
		   }
		   
		   if(!formValidation){
			   return;
		   }
		   
			var formData= $('#transactionsForm').serialize();
		    $.post("/api/transactions/save",formData ,function(data){
		        if(data.message == "success"){
		        }
		        
		    })
		    .done(function(data) {
		    	 if(data.message == "success"){
			        }
		    })
		    .fail(function(data) {});
		}
	});
}
