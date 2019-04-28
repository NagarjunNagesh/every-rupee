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
	// Used to refresh the transactions only if new ones are added
	var resiteredNewTransaction = false;
	// Divs for error message while adding transactions
	var errorAddingTransactionDiv = '<div class="row ml-auto mr-auto"><i class="material-icons red-icon">highlight_off</i><p class="margin-bottom-zero red-icon margin-left-five">';
	// Divs for success message while adding transactions
	var successfullyAddedTransactionsDiv = '<p class="green-icon margin-bottom-zero margin-left-five">';
	var svgTick = '<div class="svg-container"> <svg class="ft-green-tick" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 48 48" aria-hidden="true"><circle class="circle" fill="#5bb543" cx="24" cy="24" r="22"/><path class="tick" fill="none" stroke="#FFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14 27l5.917 4.917L34 17"/></svg></div>';
	var fetchCategoriesUrl = "/api/category/";
	// Store map of categories
	var categoryMap = {};
	
	// Fetch categories and append it to the select options (Load the categories first)
	fetchJSONForCategories();
	// Call the transaction API to fetch information.
	fetchJSONForTransactions();
	
	// Save Transactions on form submit
	$('#transactionsForm').submit(function(event) {
		registerTransaction(event);
	});
	
	function registerTransaction(event){
	   event.preventDefault();
	   event.stopImmediatePropagation(); // necessary to prevent submitting the form twice
	   $("#successMessage").html("").hide();
	   $("#errorMessage").html("").hide();
	   var formValidation = true;
		
	   var description = $("#description").val();
	   if(description == null || description == ''){
		   fadeoutMessage('#errorMessage',errorAddingTransactionDiv + 'Description field is empty.</p></div> <br/>',2000);
		   formValidation = false;
	   }
	   
	   var amount = $("#amount").val();
	   if(amount == null || amount == ''){
		   fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Amount field is empty.</p></div> <br/>',2000);
		   formValidation = false;
	   }
	   
	   if(!formValidation){
		   return;
	   }
	   
		var formData= $('#transactionsForm').serialize();
	    $.post(saveTransactionsUrl,formData ,function(data){
	        
	    })
	    .done(function(data) {
	    	fadeoutMessage('#successMessage', '<div class="row ml-auto mr-auto">' + svgTick + successfullyAddedTransactionsDiv + 'Successfully added the transaction.</p></div> <br/>', 2000);
	    	let path = document.querySelector(".tick");
	    	let length = path.getTotalLength();
	    	resiteredNewTransaction=true;
	    })
	    .fail(function(data) {
	    	fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Unable to add this transaction.</p></div> <br/>',2000);
	    	resiteredNewTransaction=true;
	    });
	}
	
	// Use this function to fade the message out
	function fadeoutMessage(divId, message, milliSeconds){
		$(divId).show().append(message);
    	setTimeout(function() {
    		$(divId).fadeOut();
    	}, milliSeconds);
	}
	
	// refresh the transactions page on closing the modal
	$('#GSCCModal').on('hidden.bs.modal', function () {
		// Clear form input fields inside the modal and the error or success messages.
		$('#transactionsForm').get(0).reset();
		$("#successMessage").html("").hide();
		$("#errorMessage").html("").hide();
		
		if(resiteredNewTransaction) {
			// Clear the div before appending
			$(replaceTransactionsDiv).empty();
			fetchJSONForTransactions();
			// Disable delete Transactions button on refreshing the transactions
			manageDeleteTransactionsButton();
			// Do not refresh the transactions if no new transactions are added
			resiteredNewTransaction = false;
		}
	});
	
	function fetchJSONForTransactions(){
		// Load all user transaction from API
		$.getJSON(transactionAPIUrl , function(result){
			let count = 1;
			let countGrouped = 1;
			let grouped = _.groupBy(result, 'categoryId');
		   $.each(grouped, function(key,value) {
			   let totalCategoryAmount = 0;
			   // Create category label table row
			   $(replaceTransactionsDiv).append(createTableCategoryRows(key, countGrouped));
			   $.each(value, function(subKey,subValue) {
				   // Create transactions table row
				   $(replaceTransactionsDiv).append(createTableRows(subValue, count, countGrouped));
				   totalCategoryAmount += subValue.amount;
				   count++;
			   });
			   // Load all the total category amount in the category section
			   let categoryAmountDiv = '#amountCategory'+countGrouped;
			   $(categoryAmountDiv).append($('#currentCurrencySymbol').text() + totalCategoryAmount);
			   countGrouped++;
		   }); 
		});
	}
	
	// Building a HTML table for transactions
	function createTableRows(userTransactionData, index, countGrouped){
		var tableRows = '';
		
			tableRows += '<tr class="hideableRow"><td class="text-center">' + index + '</td><td><div class="form-check"><label class="form-check-label"><input class="number form-check-input" type="checkbox" value="' + userTransactionData.transactionId +'">';
			tableRows += '<span class="form-check-sign"><span class="check"></span></span></label></div></td><td>' + '' + '</td>';
			tableRows += '<td>' + userTransactionData.description + '</td>';
			tableRows += '<td class="text-right">'  + $('#currentCurrencySymbol').text() + userTransactionData.amount + '</td>';
			tableRows += '<td class="text-right">' + $('#currentCurrencySymbol').text() + userTransactionData.amount + '</td></tr>';
			// TODO  have to be replaced with budget
		
		return tableRows;
		
	}
	
	// Building a HTML table for category header for transactions
	function createTableCategoryRows(categoryId, countGrouped){
		var tableRows = '';
		
			tableRows += '<tr data-toggle="collapse" class="toggle" role="button"><td class="text-center">' + '' + '</td><td>' + '';
			tableRows += '</td><td>' + categoryMap[categoryId] + '</td>';
			tableRows += '<td>' + '' + '</td>';
			tableRows += '<td id="amountCategory' + countGrouped + '" class="text-right">' + '' + '</td>';
			tableRows += '<td class="text-right"><span th:text="#{message.currencySumbol}"></span>' + '' + '</td></tr>';
		
		return tableRows;
		
	}
	
	// Disable Button if no check box is clicked and vice versa
	$( "tbody" ).on( "click", ".number" ,function() {
		manageDeleteTransactionsButton()
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
			content += '<div class="month col-md-3 col-sm-3 ml-auto mr-auto"><div class="card"><div class="card-body text-center">';
			content += entry;
			content += '</div></div></div>';
		});
		
		return content;
	}
	
	// Loop forward when clicking on more
	$(".nextMonths").click(function(event) {
		loopForwardThroughMonths(event);
	});
	
	// Hide the other months and show only the first three
	showFirstThreeMonths();
	
	function loopForwardThroughMonths(event){
		var items = $('#calendar .month:visible').hide().last();
	    
	    var nextItems = items.nextAll().slice(0, 3);
	    
	    if (nextItems.length === 0) {
	        nextItems = $("#calendar .month").slice(0, 3);
	    }
	    
	    nextItems.show();
	    
	    event.preventDefault();
	}
	
	function showFirstThreeMonths(){
		$('#calendar .month:visible').hide().last();
		$("#calendar .month").slice(0, 3).show();
	}
	
	// Loop previous months when clicking on prevMonths
	$(".prevMonths").click(function(event) {
		loopBackwardsThroughMonths(event);
	});
	
	function loopBackwardsThroughMonths(event){
		var items = $('#calendar .month:visible').hide().first();
		var prevItems = items.prevAll().slice(0, 3);

       if (prevItems.length === 0) {
           prevItems = $("#calendar .month").slice($("#calendar .month").length-3, $("#calendar .month").length);
       }

       prevItems.show();
	    
	    event.preventDefault();
	}
	
	// Swal Sweetalerts
	popup = {
			showSwal: function(type) {
				// Delete transactions On click
				if (type == 'warning-message-and-confirmation') {
					 swal({
			                title: 'Are you sure?',
			                text: 'You will not be able to recover these transactions!',
			                type: 'warning',
			                showCancelButton: true,
			                confirmButtonText: 'Yes, delete it!',
			                cancelButtonText: 'No, keep it',
			                confirmButtonClass: "btn btn-success",
			                cancelButtonClass: "btn btn-danger",
			                buttonsStyling: false,
			                closeOnCancel: true,
			            }).then(function(result) {
			            	
			            	 if (result.value) {
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
			                        	 swal({
					                         title: "Deleted!",
					                         text: "Successfully deleted the selected transactions",
					                         type: 'success',
					                         timer: 1000,
					                         showConfirmButton: false
					                     }).catch(swal.noop)
			                        	 
			                         	// Clear the div before appending
			                     		$(replaceTransactionsDiv).empty();
			                         	fetchJSONForTransactions();
			                         	$("#checkAll").prop("checked", false); // uncheck the select all checkbox if checked
			                         	manageDeleteTransactionsButton(); // disable the delete transactions button
			                         },
			                         error: function (thrownError) {
			                        	 swal({
					                         title: "Unable to Delete!",
					                         text: "Please try again",
					                         type: 'error',
					                         timer: 1000,
					                         showConfirmButton: false
					                     }).catch(swal.noop)
			                         }
			                     });
			             	
			                 }
			            });
			    } 
			}
	}

	// Load all categories from API
	function fetchJSONForCategories(){
		$.getJSON(fetchCategoriesUrl , function(result){
			var count = 1;
		   $.each(result, function(key,value) {
		      $("#categoryOptions").append(createCategoryOption(value, count));
		      count++;
		   }); 
		});
	}
	
	// Create Category Options
	function createCategoryOption(categoryData, index) {
		var catgorySelectOptions = '';
		categoryMap[categoryData.categoryId] = categoryData.categoryName;
		catgorySelectOptions += '<option class="dropdown-menu inner show" value="' + categoryData.categoryId + '">' + categoryData.categoryName + '</option>';
		
		return catgorySelectOptions;
	}
	
	// Show or hide multiple rows in the transactions table
	$( "tbody" ).on( "click", ".toggle" ,function() {
	  	$('#productsJson .hideableRow').toggleClass('d-none');
	 });
	
	
});

