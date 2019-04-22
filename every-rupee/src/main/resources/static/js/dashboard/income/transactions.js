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
	// Example :
	//	<tr>
	//    <td class="text-center">1</td>
	//    <td>
	//      <div class="form-check">
	//        <label class="form-check-label">
	//          <input class="form-check-input" type="checkbox" value="" checked>
	//          <span class="form-check-sign">
	//            <span class="check"></span>
	//          </span>
	//        </label>
	//      </div>
	//    </td>
	//    <td>Moleskine Agenda</td>
	//    <td><div id="productsJson"></div></td>
	//    <td class="text-right"><span th:text="#{message.currencySumbol}"></span> 49</td>
	//    <td class="text-right"><span th:text="#{message.currencySumbol}"></span> 1,225</td>
	//  </tr>
	function createTableRows(userTransactionData, index){
		var tableRows = '';
		
			tableRows += '<tr><td class="text-center">' + index + '</td><td><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="checkbox" value="">';
			tableRows += '<span class="form-check-sign"><span class="check"></span></span></label></div></td><td>' + userTransactionData.description + '</td>';
			tableRows += '<td>' + userTransactionData.category + '</td>';
			tableRows += '<td class="text-right"><span th:text="#{message.currencySumbol}"></span>' + userTransactionData.amount + '</td>';
			tableRows += '<td class="text-right"><span th:text="#{message.currencySumbol}"></span>' + userTransactionData.amount + '</td>'; // TODO  have to be replaced with budget
		
		return tableRows;
		
	}
	
});
