/**
 * To Handle JS for transactions
 * 
 * Nagarjun Nagesh
 */
$(document).ready(function(){
		
	// Constructs transaction API url
	var transactionAPIUrl =  "/api/transactions/";
	var saveTransactionsUrl = "/api/transactions/save/";
	var transactionsUpdateUrl = "/api/transactions/update/";
	var replaceTransactionsDiv = "#productsJson";
	// Used to refresh the transactions only if new ones are added
	var resiteredNewTransaction = false;
	// Divs for error message while adding transactions
	var errorAddingTransactionDiv = '<div class="row ml-auto mr-auto"><i class="material-icons red-icon">highlight_off</i><p class="margin-bottom-zero red-icon margin-left-five">';
	// Divs for success message while adding transactions
	var successfullyAddedTransactionsDiv = '<p class="green-icon margin-bottom-zero margin-left-five">';
	var svgTick = '<div class="svg-container"> <svg class="ft-green-tick" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 48 48" aria-hidden="true"><circle class="circle" fill="#5bb543" cx="24" cy="24" r="22"/><path class="tick" fill="none" stroke="#FFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14 27l5.917 4.917L34 17"/></svg></div>';
	// empty table message
	let emptyTable =  '<tr><td></td><td></td><td><img src="../img/dashboard/icons8-document-128.png"></td><td><p class="text-secondary">There are no transactions yet. Start adding some to track your spending.</p></td><td></td><td></td></tr>';
	var fetchCategoriesUrl = "/api/category/";
	// Store map of categories (promises require LET for maps)
	let categoryMap = {};
	var fetchCurrentLoggedInUserUrl = "/api/user/";
	//Stores the Loggedin User
	let currentUser = '';
	// Expense Category
	var expenseCategory = "1";
	// Income Category
	var incomeCategory = "2";
	// Bills & Fees Options selection
	var selectedOption = '4';
	// Description Text
	let descriptionTextEdited = '';
	// Amount Text
	let amountEditedTransaction = '';
	// Currency Preference
	let currentCurrencyPreference = $('#currentCurrencySymbol').text();
	
	// Loads the current Logged in User
	fetchJSONForLoggedInUser();
	// Fetch categories and append it to the select options (Load the categories first)
	fetchJSONForCategories();
	// Call the transaction API to fetch information.
	fetchJSONForTransactions();
	// Sidebar 
	$sidebar = $('.sidebar');
	// Regex to check if the entered value is a float
	var regexForFloat = /^[+-]?\d+(\.\d+)?$/;
	// Delete Transaction Button Inside TD
	var deleteButton = '<button class="btn btn-danger btn-sm removeRowTransaction">Remove</button>';
	var loaderBudgetSection = '<div id="loader-remove"></div>';
	
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
	   // disable button after successful submission
	   $('#transactionsFormButtonSubmission').prop('disabled', true);
	   
	   var amount = $("#amount").val();
	   if(amount == null || amount == ''){
		   fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Amount field is empty.</p></div> <br/>',2000);
		   formValidation = false;
	   }
	   
	   if(!formValidation){
		   return;
	   }
	   
		var formData= $('#transactionsForm').serialize();
	    $.post(saveTransactionsUrl + currentUser.financialPortfolioId,formData ,function(data){
	        
	    })
	    .done(function(data) {
	    	fadeoutMessage('#successMessage', '<div class="row ml-auto mr-auto">' + svgTick + successfullyAddedTransactionsDiv + 'Successfully added the transaction.</p></div> <br/>', 2000);
	    	resiteredNewTransaction=true;
	    	// enable button after successful submission
	    	$('#transactionsFormButtonSubmission').prop('disabled', false);
	    })
	    .fail(function(data) {
	    	var responseError = JSON.parse(data.responseText);
         	if(responseError.error.includes("Unauthorized")){
		    	$('#GSCCModal').modal('hide');
		    	sessionExpiredSwal(data);
         	}
	    	fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Unable to add this transaction.</p></div> <br/>',2000);
	    	resiteredNewTransaction=false;
	    	// enable button after successful submission
	    	$('#transactionsFormButtonSubmission').prop('disabled', false);
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
			$("#totalIncomeTransactions").html("");
			$("#totalExpensesTransactions").html("");
			$("#totalAvailableTransactions").html("");
			
			fetchJSONForTransactions();
			// Disable delete Transactions button on refreshing the transactions
			manageDeleteTransactionsButton();
			// Do not refresh the transactions if no new transactions are added
			resiteredNewTransaction = false;
		}
	});
	
	// Populates the transaction table
	function fetchJSONForTransactions(){
		let currentCurrencyPreference = $('#currentCurrencySymbol').text();
		// Load all user transaction from API
		$.getJSON(transactionAPIUrl + currentUser.financialPortfolioId, function(result){
			let count = 1;
			let countGrouped = 1;
			let totalExpensesTransactions = 0.00;
			let totalIncomeTransactions = 0.00;
			let totalAvailableTransactions = 0.00;
			// Grouping the transactions based on their category ID
			let grouped = _.groupBy(result, 'categoryId');
		   $.each(grouped, function(key,value) {
			   let totalCategoryAmount = 0;
			   // Create category label table row
			   $(replaceTransactionsDiv).append(createTableCategoryRows(key, countGrouped));
			   $.each(value, function(subKey,subValue) {
				   // Create transactions table row
				   $(replaceTransactionsDiv).append(createTableRows(subValue, count, key));
				   totalCategoryAmount += subValue.amount;
				   count++;
			   });
			   // Load all the total category amount in the category section
			   let categoryAmountDiv = '#amountCategory'+ countGrouped;
			   $(categoryAmountDiv).append(currentCurrencyPreference + formatNumber(totalCategoryAmount, currentUser.locale));
			   
			   // Total Expenses and Total Income
			   if(categoryMap[key].parentCategory == expenseCategory) {
				   totalExpensesTransactions += totalCategoryAmount;
			   } else if (categoryMap[key].parentCategory == incomeCategory) {
				   totalIncomeTransactions += totalCategoryAmount;
			   }
			   countGrouped++;
		   }); 
		   
		   // Update table with empty message if the transactions are empty
		   if(result.length == 0) {
			  $(replaceTransactionsDiv).append(emptyTable);
		   }
		   
		   totalAvailableTransactions = totalIncomeTransactions - totalExpensesTransactions;
		   if(totalAvailableTransactions < 0) {
			   $("#totalAvailableTransactions").append( '-' + currentCurrencyPreference + formatNumber(Math.abs(totalAvailableTransactions), currentUser.locale));
		   } else {
			   $("#totalAvailableTransactions").append(currentCurrencyPreference + formatNumber(totalAvailableTransactions, currentUser.locale));
		   }
		   $("#totalIncomeTransactions").append(currentCurrencyPreference + formatNumber(totalIncomeTransactions, currentUser.locale));
		   $("#totalExpensesTransactions").append('-' + currentCurrencyPreference + formatNumber(totalExpensesTransactions, currentUser.locale));
		   
		});
	}
	
	// Building a HTML table for transactions
	function createTableRows(userTransactionData, index, categoryId){
		let tableRows = '';
		var categoryOptions = createCategoryOptions(categoryId, categoryMap)
		
		tableRows += '<tr class="hideableRow"><td class="text-center">' + index + '</td><td><div class="form-check"><label class="form-check-label"><input class="number form-check-input" type="checkbox" value="' + userTransactionData.transactionId +'">';
		tableRows += '<span class="form-check-sign"><span class="check"></span></span></label></div></td><td><select id="selectCategoryRow-' + userTransactionData.transactionId + '" class="tableRowSelectCategory" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
		tableRows += '<optgroup label="Expenses">' + categoryOptions['expense'] + '</optgroup><optgroup label="Income">' + categoryOptions['income'] + '</select></td>';
		tableRows += '<td id="descriptionTransactionsRow-' + userTransactionData.transactionId + '" contenteditable="true" class="transactionsTableDescription" data-gramm_editor="false"><div class="descriptionDivCentering">' + userTransactionData.description + '</div></td>';
		
		// Append a - sign if it is an expense
	   if(categoryMap[categoryId].parentCategory == expenseCategory) {
		   // data-gramm_editor="false" is used to disable grammarly
		   tableRows += '<td id="amountTransactionsRow-' + userTransactionData.transactionId + '" class="text-right amountTransactionsRow" contenteditable="true" data-gramm_editor="false"><div class="text-right amountDivCentering">'  + '-' + $('#currentCurrencySymbol').text() + formatNumber(userTransactionData.amount, currentUser.locale) + '</div></td>';
	   } else {
		   tableRows += '<td id="amountTransactionsRow-' + userTransactionData.transactionId + '" class="text-right amountTransactionsRow" contenteditable="true" data-gramm_editor="false"><div class="text-right amountDivCentering">'  + $('#currentCurrencySymbol').text() + formatNumber(userTransactionData.amount, currentUser.locale) + '</div></td>';
	   }
		
	    // append button to remove the transaction if the amount is zero
	   	let buttonDelete = userTransactionData.amount == 0 ? deleteButton : '';
		tableRows += '<td id="budgetTransactionsRow-' + userTransactionData.transactionId + '" class="text-right">' + buttonDelete + '</td></tr>';
		
		return tableRows;
		
	}
	
	// Building a HTML table for category header for transactions
	function createTableCategoryRows(categoryId, countGrouped){
		let tableRows = '';
		
		// Change the table color if for expense vs income
		if(categoryMap[categoryId].parentCategory == expenseCategory) {
			tableRows += '<tr data-toggle="collapse" class="toggle table-danger categoryTableRow" role="button"><td class="text-center dropdown-toggle font-17">' + '' + '</td><td>' + '';
		} else {
			tableRows += '<tr data-toggle="collapse" class="toggle table-success categoryTableRow" role="button"><td class="text-center dropdown-toggle font-17">' + '' + '</td><td>' + '';
		}
		
		tableRows += '</td><td class="font-weight-bold">' + categoryMap[categoryId].categoryName + '</td>';
		tableRows += '<td>' + '' + '</td>';
		
		// Append a - sign for the category if it is an expense
	   if(categoryMap[categoryId].parentCategory == expenseCategory) {
		   tableRows += '<td id="amountCategory' + countGrouped + '" class="text-right amountCategoryId-' + categoryId + '">' + '-' + '</td>';
	   } else {
		   tableRows += '<td id="amountCategory' + countGrouped + '" class="text-right amountCategoryId-' + categoryId + '">' + '' + '</td>';
	   }
		tableRows += '<td id="budgetCategory" class="text-right"><span th:text="#{message.currencySumbol}"></span>' + '' + '</td></tr>';
		// TODO  have to be replaced with budget
		
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
			                        	$("#totalIncomeTransactions").html("");
			                 			$("#totalExpensesTransactions").html("");
			                 			$("#totalAvailableTransactions").html("");
			                         	fetchJSONForTransactions();
			                         	$("#checkAll").prop("checked", false); // uncheck the select all checkbox if checked
			                         	manageDeleteTransactionsButton(); // disable the delete transactions button
			                         },
			                         error: function (thrownError) {
			                        	 var responseError = JSON.parse(thrownError.responseText);
				                         	if(responseError.error.includes("Unauthorized")){
				                         		sessionExpiredSwal(thrownError);
				                         	} else{
				                         		swal({
							                         title: "Unable to Delete!",
							                         text: "Please try again",
							                         type: 'error',
							                         timer: 1000,
							                         showConfirmButton: false
							                     }).catch(swal.noop)
				                         	}
			                         }
			                     });
			             	
			                 }
			            });
			    } 
			}
	}

	// Load all categories from API (Call synchronously to set global variable)
	function fetchJSONForCategories(){
		$.ajax({
			  async: false,
	          type: "GET",
	          url: fetchCategoriesUrl,
	          dataType: "json",
	          success : function(data) {
	        	  $.each(data, function(key,value) {
	        		  if(value.parentCategory == expenseCategory){
	        			  $("#expenseSelection").append(createCategoryOption(value));  
	        		  } else if(value.parentCategory == incomeCategory) {
	        			  $("#incomeSelection").append(createCategoryOption(value));  
	        		  }
	    		      
	    		   }); 
	           }
	        });
	}
	
	// Create Category Options
	function createCategoryOption(categoryData, selectedCategoryId) {
		let catgorySelectOptions = '';
		let isSelected = '';
		categoryMap[categoryData.categoryId] = categoryData;
		if(_.isEmpty(selectedCategoryId) && categoryData.categoryId == selectedOption){
			isSelected = 'selected';
		} else if(!_.isEmpty(selectedCategoryId) && categoryData.categoryId == selectedCategoryId){
			isSelected = 'selected';
		}
		
		catgorySelectOptions += '<option class="dropdown-item inner show" value="' + categoryData.categoryId + '"' + isSelected +'>' + categoryData.categoryName + '</option>';
		
		return catgorySelectOptions;
	}
	
	// Show or hide multiple rows in the transactions table
	$( "tbody" ).on( "click", ".toggle" ,function() {
	  	$('#productsJson .hideableRow').toggleClass('d-none');
	 });
	
	// Throw a session expired error and reload the page.
	function sessionExpiredSwal(data){
		var responseError = JSON.parse(data.responseText);
    	if(responseError.error.includes("Unauthorized")){
    		swal({
                title: "Session Expired!",
                text: 'You will be redirected to the Login Page',
                type: 'warning',
                buttonsStyling: false,
                confirmButtonClass: "btn btn-success"
            }).then(function() {
            	location.reload(); 
            }).catch(swal.noop);
    		
    	}
	}
	
	// Format numbers in Indian Currency
	function formatNumber(num, locale) {
		if(_.isEmpty(locale)){
			locale = "en-IN";
		}
		  return num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}
	
	// Loads the currenct logged in user from API (Call synchronously to set global variable)
	function fetchJSONForLoggedInUser(){
		$.ajax({
	          async: false,
	          type: "GET",
	          url: fetchCurrentLoggedInUserUrl,
	          dataType: "json",
	          success : function(data) {
	        	  currentUser = data;
	           }
	        });
	}
	
	// Load category as a select option
	function createCategoryOptions(selectedCategory, categoryList){
		let categoryOptions = {};
		let expenseCategoryDiv = '';
		let incomeCategoryDiv = '';
		 $.each(categoryList, function(key,value) {
			  if(value.parentCategory == expenseCategory){
				  expenseCategoryDiv += createCategoryOption(value, selectedCategory);  
			  } else if(value.parentCategory == incomeCategory) {
				  incomeCategoryDiv += createCategoryOption(value, selectedCategory);  
			  }
		      
		   }); 
		 categoryOptions['expense'] = expenseCategoryDiv;
		 categoryOptions['income'] = incomeCategoryDiv;
		 return categoryOptions;
	}
	
	// Change trigger on select
	$( "tbody" ).on( "change", ".tableRowSelectCategory" ,function() {
		let selectCategoryId = _.split($(this).attr('id'),'-');
		var values = {};
		values['categoryId'] = $(this).val();
		values['transactionId'] = selectCategoryId[selectCategoryId.length - 1];
		$.ajax({
	          type: "POST",
	          url: transactionsUpdateUrl + 'category',
	          dataType: "json",
	          data : values,
	          success: function(userTransaction){
	        	  updateCategoryAmount(userTransaction, userTransaction.amount);
	        	  
	          },
	          error: function (thrownError) {
              	 var responseError = JSON.parse(thrownError.responseText);
                   	if(responseError.error.includes("Unauthorized")){
                   		sessionExpiredSwal(thrownError);
                   	} else{
                   		swal({
		                         title: "Unable to Change Category!",
		                         text: "Please try again",
		                         type: 'error',
		                         timer: 1000,
		                         showConfirmButton: false
		                     }).catch(swal.noop)
                   	}
               }
	           
	        });
	});
	
	// Catch the description when the user focuses on the description
	$( "tbody" ).on( "focusin", ".transactionsTableDescription" ,function() {
		descriptionTextEdited = _.trim(this.innerText);
	});
	
	// Process the description to find out if the user has changed the description
	$( "tbody" ).on( "focusout", ".transactionsTableDescription" ,function() {
		
		// If the text is not changed then do nothing
		let enteredText = _.trim(this.innerText);
		if(_.isEqual(descriptionTextEdited, enteredText)){
			// replace the text with a trimmed version 
			$(this).html('<div class="descriptionDivCentering">' + enteredText + '</div>');
			return;
		}
		
		let changedDescription = _.split($(this).attr('id'),'-');
		var values = {};
		values['description'] = enteredText;
		values['transactionId'] = changedDescription[changedDescription.length - 1];
		$.ajax({
	          type: "POST",
	          url: transactionsUpdateUrl + 'description',
	          dataType: "json",
	          data : values,
	          error: function (thrownError) {
              	 var responseError = JSON.parse(thrownError.responseText);
                   	if(responseError.error.includes("Unauthorized")){
                   		sessionExpiredSwal(thrownError);
                   	} else{
                   		swal({
		                         title: "Unable to Change Description!",
		                         text: "Please try again",
		                         type: 'error',
		                         timer: 1000,
		                         showConfirmButton: false
		                     }).catch(swal.noop)
                   	}
               }
	        });
	});
	
	// Catch the amount when the user focuses on the transaction
	$( "tbody" ).on( "focusin", ".amountTransactionsRow" ,function() {
		amountEditedTransaction = _.trim(this.innerText);
	});
	
	// Process the amount to find out if the user has changed the transaction amount (Disable async to update total category amount)
	$( "tbody" ).on( "focusout", ".amountTransactionsRow" ,function() {
		
		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = round(parseFloat(_.trim(_.last(_.split(this.innerText,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
		let previousText = parseFloat(_.last(_.split(amountEditedTransaction,currentCurrencyPreference)).replace(/[^0-9.-]+/g,""));
		
		let selectTransactionId = _.split($(this).attr('id'),'-');
		
		// Test if the entered value is valid
		if(isNaN(enteredText) || !regexForFloat.test(enteredText) || enteredText <= 0) {
			// Replace the entered text with 0 inorder for the code to progress.
			enteredText = 0;
		}
		
		// Test if the entered value is the same as the previous one
		if(previousText != enteredText){
		
			// obtain the transaction id of the table row
			let changedAmount = _.split($(this).attr('id'),'-');
			var values = {};
			values['amount'] = enteredText;
			values['transactionId'] = changedAmount[changedAmount.length - 1];
			let totalAddedOrRemovedFromAmount = parseFloat(enteredText - previousText).toFixed(2);
			$.ajax({
				  async: false,
		          type: "POST",
		          url: transactionsUpdateUrl + 'transaction',
		          dataType: "json",
		          data : values,
		          success: function(userTransaction){
		        	  updateCategoryAmount(userTransaction, totalAddedOrRemovedFromAmount);
		          },
		          error: function (thrownError) {
	              	 var responseError = JSON.parse(thrownError.responseText);
	                   	if(responseError.error.includes("Unauthorized")){
	                   		sessionExpiredSwal(thrownError);
	                   	} else{
	                   		swal({
			                         title: "Unable to Change Transaction Amount!",
			                         text: "Please try again",
			                         type: 'error',
			                         timer: 1000,
			                         showConfirmButton: false
			                     }).catch(swal.noop)
	                   	}
	               }
		        });
		}
		
		// replace the text with a trimmed version
		appendCurrencyToAmount(this, enteredText);
		
		// Handles the addition of buttons in the budget column for the row
		appendButtonForAmountEdition(enteredText, selectTransactionId);
	});
	
	// Append appropriate buttons when the amount is edited
	function appendButtonForAmountEdition(enteredText, selectTransactionId) {
		// append remove button if the transaction amount is zero
		enteredText == 0 ? $('#budgetTransactionsRow-' + selectTransactionId[selectTransactionId.length - 1]).html(deleteButton).hide().children().fadeIn('slow', function(){ $('#budgetTransactionsRow-' + selectTransactionId[selectTransactionId.length - 1]).show('slow'); }) : $('#budgetTransactionsRow-' + selectTransactionId[selectTransactionId.length - 1]).children().fadeOut('slow', function(){ $(this).html(''); });
	}
	
	// Update the category amount
	function updateCategoryAmount(userTransaction, totalAddedOrRemovedFromAmount){
		  let newCategoryTotal = 0;
	  	  let categoryTotal = $('.amountCategoryId-' + userTransaction.categoryId)[0].innerText;
	  	  // Convert to number regex
	  	  let previousCategoryTotal = parseFloat(categoryTotal.replace(/[^0-9.-]+/g,""));
	  	  previousCategoryTotal = _.last(_.split(previousCategoryTotal, '-'));
	  	  let minusSign = '';
	  	  if(_.includes(categoryTotal,'-')){
	  		  minusSign = '-';
	  	  }
	  	  newCategoryTotal = parseFloat(parseFloat(previousCategoryTotal) + parseFloat(totalAddedOrRemovedFromAmount)).toFixed(2);
	  	  // Format the newCategoryTotal to number and format the number as currency
	  	  $('.amountCategoryId-' + userTransaction.categoryId).html(minusSign + currentCurrencyPreference + formatNumber(Number(newCategoryTotal), currentUser.locale));
	}
	
	// Append currency to amount if it exist and a '-' sign if it is a transaction
	function appendCurrencyToAmount(element, enteredText){
		// if the currency or the minus sign is removed then replace it back when the focus is lost
		if(!_.includes(element.innerText,currentCurrencyPreference) && _.includes(amountEditedTransaction,currentCurrencyPreference)){
			let minusSign = '';
			if(_.includes(amountEditedTransaction,'-')){
				minusSign = '-';
			}
			let changeInnerTextAmount = minusSign + currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
			let replaceEnteredText = '<div class="text-right amountDivCentering">' + _.trim(changeInnerTextAmount).replace(/ +/g, "") + '</div>';
			$(element).html(replaceEnteredText);
		} else {
			let minusSign = '';
			if(_.includes(amountEditedTransaction,'-')){
				minusSign = '-';
			}
			let changeInnerTextAmount = minusSign + currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
			// replace the space inbetween and trim the text
			let replaceEnteredText = '<div class="text-right amountDivCentering">' + _.trim(changeInnerTextAmount).replace(/ +/g, "") + '</div>';
			$(element).html(replaceEnteredText);
		}
	}
	
	// Change side bar color to green
	changeColorOfSidebar();
	
	function changeColorOfSidebar(){
		if ($sidebar.length != 0) {
			 $sidebar.attr('data-color', 'green');
		 }
	}
	
	// Dynamically generated button click
	$( "tbody" ).on( "click", ".removeRowTransaction" ,function() {
		var id = _.last(_.split($(this).closest('td').attr('id'),'-'));
		// Remove the button and append the loader
		$('#budgetTransactionsRow-' + id).html(loaderBudgetSection);
		
		
		// Handle delete for individual row
		jQuery.ajax({
            url: transactionAPIUrl + id,
            type: 'DELETE',
            success: function(data) {
           	 
            	// Clear the div before appending
        		$(replaceTransactionsDiv).empty();
           	 	$("#totalIncomeTransactions").html("");
    			$("#totalExpensesTransactions").html("");
    			$("#totalAvailableTransactions").html("");
            	fetchJSONForTransactions();
            	$("#checkAll").prop("checked", false); // uncheck the select all checkbox if checked
            	manageDeleteTransactionsButton(); // disable the delete transactions button
            },
            error: function (thrownError) {
           	 var responseError = JSON.parse(thrownError.responseText);
                	if(responseError.error.includes("Unauthorized")){
                		sessionExpiredSwal(thrownError);
                	} else{
                		$('#budgetTransactionsRow-' + id).html(deleteButton);
                		
                		swal({
	                         title: "Unable to Delete!",
	                         text: "Please try again",
	                         type: 'error',
	                         timer: 1000,
	                         showConfirmButton: false
	                     }).catch(swal.noop)
                		
                	}
            }
        });
	});
	
});

