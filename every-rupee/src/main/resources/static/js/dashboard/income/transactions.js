/**
 * To Handle JS for transactions
 * 
 * Nagarjun Nagesh
 */
$(document).ready(function(){
		
	// Constructs transaction API url
	var transactionAPIUrl = window.location.origin + "/api/transactions/";
	var saveTransactionsUrl = "/api/transactions/save";
	var replaceTransactionsDiv = "#productsJson";
	
	// Call the transaction API to fetch information.
	fetchJSONForTransactions();
	
	$('#transactionsForm').submit(function(event) {
		registerTransaction(event);
	});
	
	function registerTransaction(event){
	   event.preventDefault();
	   event.stopImmediatePropagation(); // necessary to prevent submitting the form twice
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
	    $.post(saveTransactionsUrl,formData ,function(data){
	        if(data.message == "success"){
	        }
	        
	    })
	    .done(function(data) {
	    	 if(data.message == "success"){
		        }
	    })
	    .fail(function(data) {});
	}
	
	// refresh the transactions page on closing the modal
	$('#GSCCModal').on('hidden.bs.modal', function () {
		// Clear the div before appending
		$(replaceTransactionsDiv).empty();
		fetchJSONForTransactions();
		// Clear form input fields inside the modal
		$('#transactionsForm').get(0).reset();
		
	});
	
	function fetchJSONForTransactions(){
		//Load all user transaction from API
		$.getJSON(transactionAPIUrl , function(result){
			var count = 1;
		   $.each(result, function(key,value) {
		      $(replaceTransactionsDiv).append(createTableRows(value, count));
		      count++;
		   }); 
		});
	}
	
	// Building a HTML table for transactions
	function createTableRows(userTransactionData, index){
		var tableRows = '';
		
			tableRows += '<tr><td class="text-center">' + index + '</td><td><div class="form-check"><label class="form-check-label"><input class="number form-check-input" type="checkbox" value="' + userTransactionData.transactionId +'">';
			tableRows += '<span class="form-check-sign"><span class="check"></span></span></label></div></td><td>' + userTransactionData.description + '</td>';
			tableRows += '<td>' + userTransactionData.category + '</td>';
			tableRows += '<td class="text-right"><span th:text="#{message.currencySumbol}"></span>' + userTransactionData.amount + '</td>';
			tableRows += '<td class="text-right"><span th:text="#{message.currencySumbol}"></span>' + userTransactionData.amount + '</td>';
			// TODO  have to be replaced with budget
		
		return tableRows;
		
	}
	
	// Disable Button if no check box is clicked and vice versa
	$( "tbody" ).on( "click", ".number" ,function() {
		manageDeleteTransactionsButton()
	});
	
	// Delete transactions on click
	 $("#deleteTransaction").click(function(){
		// Check all check boxes by default
        var transactionIds = [];

        $.each($("input[type=checkbox]:checked"), function(){   
        	// To remove the select all check box values
        	if($(this).val() != "on"){
        		transactionIds.push($(this).val());
        	}
        });

        transactionIds.join(", ")
        
        jQuery.ajax({
            url: transactionAPIUrl + transactionIds,
            type: 'DELETE',
            success: function(data) {
            	// Clear the div before appending
        		$(replaceTransactionsDiv).empty();
            	fetchJSONForTransactions();
            	$("#checkAll").prop("checked", false); // uncheck the select all checkbox if checked
            	manageDeleteTransactionsButton() // disable the delete transactions button
            }
        });
	});
	
	// Select all check boxes for Transactions
	$("#checkAll").click(function () {
		$('input[type="checkbox"]').prop('checked', $(this).prop('checked'));
		manageDeleteTransactionsButton();
	});
	
	// Function to enable of disable the delete transactions button
	function manageDeleteTransactionsButton(){
		if($( ".number:checked" ).length > 0)
		  {
		    $('#manageTransactionButton').prop('disabled', false);
		  }
		  else
		  {
		    $('#manageTransactionButton').prop('disabled', true);
		  }  
	}
	
	// Build calendar for transaction
	$('#calendar').append(appendMonths());
	
	function appendMonths() {
		var content = '';
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		months.forEach(function(entry) {
			content += '<div class="month col-md-2 col-sm-2 ml-auto mr-auto"><div class="card"><div class="card-body text-center">';
			content += entry;
			content += '</div></div></div>';
		});
		
		return content;
	}
	
	$("#calendar .month").slice(0,3).show();

	$(".more").click(function(event) {
	    
	    var items = $('#calendar .month:visible').hide().last();
	    
	    var nextItems = items.nextAll().slice(0, 3);
	    
	    if (nextItems.length === 0) {
	        nextItems = $("#calendar .month").slice(0, 3);
	    }
	    
	    nextItems.show();
	    
	    e.preventDefault();
	});
	
});
