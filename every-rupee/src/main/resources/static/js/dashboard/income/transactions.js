/**
 * To Handle JS for transactions
 * 
 * Nagarjun Nagesh
 */
$(document).ready(function(){
	
	// Change side bar color to green
	changeColorOfSidebar();
	
	
	//Stores the Loggedin User
	let currentUser = '';
	var fetchCurrentLoggedInUserUrl = "/api/user/";
	// Loads the current Logged in User
	fetchJSONForLoggedInUser();
	
	// Store map of categories (promises require LET for maps)
	let categoryMap = {};
	// Expense Category
	const expenseCategory = "1";
	// Income Category
	const incomeCategory = "2";
	var fetchCategoriesUrl = "/api/category/";
	// Load Expense category and income category
	let expenseSelectionOptGroup = document.createDocumentFragment();
	let incomeSelectionOptGroup = document.createDocumentFragment();
	// Fetch categories and append it to the select options (Load the categories first)
	fetchJSONForCategories();
		
	// Constructs transaction API url
	const transactionAPIUrl =  "/api/transactions/";
	const saveTransactionsUrl = "/api/transactions/save/";
	const transactionsUpdateUrl = "/api/transactions/update/";
	const replaceTransactionsDiv = "#productsJson";
	const replaceTransactionsId = "productsJson";
	// Used to refresh the transactions only if new ones are added
	var resiteredNewTransaction = false;
	// Divs for error message while adding transactions
	var errorAddingTransactionDiv = '<div class="row ml-auto mr-auto"><i class="material-icons red-icon">highlight_off</i><p class="margin-bottom-zero red-icon margin-left-five">';
	// Divs for success message while adding transactions
	var successfullyAddedTransactionsDiv = '<p class="green-icon margin-bottom-zero margin-left-five">';
	var svgTick = '<div class="svg-container"> <svg class="ft-green-tick" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 48 48" aria-hidden="true"><circle class="circle" fill="#5bb543" cx="24" cy="24" r="22"/><path class="tick" fill="none" stroke="#FFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14 27l5.917 4.917L34 17"/></svg></div>';
	// empty table message
	const emptyTable =  '<tr><td></td><td></td><td><img src="../img/dashboard/icons8-document-128.png"></td><td><p class="text-secondary">There are no transactions yet. Start adding some to track your spending.</p></td><td></td><td></td></tr>';
	// Bills & Fees Options selection
	const selectedOption = '4';
	// Description Text
	let descriptionTextEdited = '';
	// Amount Text
	let amountEditedTransaction = '';
	// Currency Preference
	const currentCurrencyPreference = $('#currentCurrencySymbol').text();
	// Sidebar 
	$sidebar = $('.sidebar');
	// Regex to check if the entered value is a float
	const regexForFloat = /^[+-]?\d+(\.\d+)?$/;
	// Delete Transaction Button Inside TD
	const deleteButton = '<button class="btn btn-danger btn-sm removeRowTransaction">Remove</button>';
	const loaderBudgetSection = '<div id="loader-remove"></div>';
	
	// Call the transaction API to fetch information.
	fetchJSONForTransactions();
	
	// Save Transactions on form submit
	$('#transactionsForm').submit(function(event) {
		registerTransaction(event);
	});
	
	function registerTransaction(event){
	   event.preventDefault();
	   event.stopImmediatePropagation(); // necessary to prevent submitting the form twice
	   replaceHtml('successMessage' , '');
	   replaceHtml('errorMessage',"");
	   let formValidation = true;
	   // disable button after successful submission
	   $('#transactionsFormButtonSubmission').prop('disabled', true);
	   
	   let amount = $("#amount").val();
	   if(amount == null || amount == ''){
		   fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Please fill the Amount.</p></div> <br/>',2000);
		   formValidation = false;
	   }
	   
	   amount = convertToNumberFromCurrency(amount);
	   if(amount == 0){
		   fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Amount cannot be zero.</p></div> <br/>',2000);
		   formValidation = false;
	   }
	   
	   if(!formValidation){
		   // enable button after successful submission
		   $('#transactionsFormButtonSubmission').prop('disabled', false);
		   return;
	   }
	   
	    
	    amount = Math.abs(amount);
	    let description = $('#description').val();
	    let categoryOptions = $('#categoryOptions').val();
		let values = {};
		values['amount'] = amount;
		values['description'] = description;
		values['categoryOptions'] = categoryOptions;
		$.ajax({
	          type: "POST",
	          url: saveTransactionsUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          data : values,
	          success: function(data) {
	  	    	fadeoutMessage('#successMessage', '<div class="row ml-auto mr-auto">' + svgTick + successfullyAddedTransactionsDiv + 'Successfully added the transaction.</p></div> <br/>', 2000);
	  	    	resiteredNewTransaction=true;
	  	      },
	  	      error: function(data) {
	  	    	var responseError = JSON.parse(data.responseText);
	           	if(responseError.error.includes("Unauthorized")){
	  		    	$('#GSCCModal').modal('hide');
	  		    	sessionExpiredSwal(data);
	           	}
	  	    	fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Unable to add this transaction.</p></div> <br/>',2000);
	  	    	resiteredNewTransaction=false;
	  	    }
		});
	    
	    // enable button after successful submission
    	$('#transactionsFormButtonSubmission').prop('disabled', false);
	}
	
	
	// Use this function to fade the message out
	function fadeoutMessage(divId, message, milliSeconds){
		$(divId).fadeIn('slow').show().append(message);
    	setTimeout(function() {
    		$(divId).fadeOut();
    	}, milliSeconds);
	}
	
	function fadeOutDiv(element, milliSeconds, html) {
		$(element).fadeOut(milliSeconds, function(){ $(this).html(html).show(); });
	}
	
	// refresh the transactions page on closing the modal
	$('#GSCCModal').on('hidden.bs.modal', function () {
		// Clear form input fields inside the modal and the error or success messages.
		$('#transactionsForm').get(0).reset();
		replaceHtml('successMessage',"");
		replaceHtml('errorMessage',"");
		
		if(resiteredNewTransaction) {
			fetchJSONForTransactions();
			// Do not refresh the transactions if no new transactions are added
			resiteredNewTransaction = false;
		}
	});
	
	// Populates the transaction table
	function fetchJSONForTransactions(){
		// Load all user transaction from API
		$.getJSON(transactionAPIUrl + currentUser.financialPortfolioId, function(result){
			let count = 1;
			let countGrouped = 1;
			let totalExpensesTransactions = 0.00;
			let totalIncomeTransactions = 0.00;
			let transactionsTableDiv = document.createDocumentFragment();
			let documentTbody = document.getElementById('productsJson');
			// uncheck the select all checkbox if checked
			$("#checkAll").prop("checked", false); 
			// Disable delete Transactions button on refreshing the transactions
         	manageDeleteTransactionsButton();
		   $.each(result, function(key,value) {
			   let transactionsRowDocumentFragment = document.createDocumentFragment();
			   let totalCategoryAmount = 0;
			   $.each(value, function(subKey,subValue) {
				   // Create transactions table row
				   transactionsRowDocumentFragment.appendChild(createTableRows(subValue, count, key));
				   totalCategoryAmount += subValue.amount;
				   count++;
			   });
			   // Load all the total category amount in the category section
			   let categoryAmountTotal = currentCurrencyPreference + formatNumber(totalCategoryAmount, currentUser.locale);
			   // Create category label table row
			   transactionsTableDiv.appendChild(createTableCategoryRows(key, countGrouped, categoryAmountTotal));
			   transactionsTableDiv.appendChild(transactionsRowDocumentFragment);
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
			   replaceHtml(replaceTransactionsId, emptyTable);
		   } else {
			   documentTbody.innerHTML = '';
			   documentTbody.appendChild(transactionsTableDiv);
		   }
		   
		  // update the Total Available Section
		  updateTotalAvailableSection(totalIncomeTransactions , totalExpensesTransactions);
		   
		});
	}
	
	function updateTotalAvailableSection(totalIncomeTransactions , totalExpensesTransactions) {
			let totalAvailableTransactions = totalIncomeTransactions - totalExpensesTransactions;
		   if(totalAvailableTransactions < 0) {
			   replaceHtml('totalAvailableTransactions' , '-' + currentCurrencyPreference + formatNumber(Math.abs(totalAvailableTransactions), currentUser.locale));
		   } else {
			   replaceHtml('totalAvailableTransactions', currentCurrencyPreference + formatNumber(totalAvailableTransactions, currentUser.locale));
		   }
		   replaceHtml('totalIncomeTransactions', currentCurrencyPreference + formatNumber(totalIncomeTransactions, currentUser.locale));
		   replaceHtml('totalExpensesTransactions', '-' + currentCurrencyPreference + formatNumber(totalExpensesTransactions, currentUser.locale));
	}
	
	// Building a HTML table for transactions
	function createTableRows(userTransactionData, index, categoryId){
		let tableRows = document.createElement("tr");
		tableRows.className = 'hideableRow-' + categoryId + ' hideableRow d-none';
		
		// Row 1
		let indexTableCell = document.createElement('td');
		indexTableCell.className = 'text-center';
		indexTableCell.tabIndex = -1;
		indexTableCell.innerHTML = index;
		tableRows.appendChild(indexTableCell);
		
		// Table Row 2
		let htmlString = '<div class="form-check" tabindex="-1"><label class="form-check-label" tabindex="-1"><input class="number form-check-input" type="checkbox" value="' + userTransactionData.transactionId +'" tabindex="-1"><span class="form-check-sign" tabindex="-1"><span class="check"></span></span></label></div>';
		let checkboxCell = document.createElement('td');
		checkboxCell.tabIndex = -1;
		checkboxCell.innerHTML = htmlString.trim();
		tableRows.appendChild(checkboxCell);
		
		// Table Row 3
		let selectCategoryRow = document.createElement('td');
		
		// Build Select
		let selectCategory = document.createElement('select');
		selectCategory.setAttribute("id", 'selectCategoryRow-' + userTransactionData.transactionId);
		selectCategory.className = 'tableRowForSelectCategory categoryIdForSelect-' + categoryId + ' tableRowSelectCategory';
		selectCategory.setAttribute('aria-haspopup', true);
		selectCategory.setAttribute('aria-expanded', false);
		
		let optGroupExpense = document.createElement('optgroup');
		optGroupExpense.label = 'Expenses';
		optGroupExpense.appendChild(expenseSelectionOptGroup);
		selectCategory.appendChild(optGroupExpense);
		
		let optGroupIncome = document.createElement('optgroup');
		optGroupIncome.label = 'Income';
		optGroupIncome.appendChild(incomeSelectionOptGroup);
		selectCategory.appendChild(optGroupIncome);
		selectCategoryRow.appendChild(selectCategory);
		tableRows.appendChild(selectCategoryRow);
		
		// Table Row 4
		let descriptionTableRow = document.createElement('td');
		descriptionTableRow.setAttribute('id', 'descriptionTransactionsRow-' + userTransactionData.transactionId);
		descriptionTableRow.className = 'transactionsTableDescription';
		descriptionTableRow.setAttribute('data-gramm_editor' , false);
		descriptionTableRow.tabIndex = -1;
		
		let descriptionDiv = document.createElement('div');
		descriptionDiv.setAttribute('contenteditable', true);
		descriptionDiv.tabIndex = 0;
		descriptionDiv.className = 'descriptionDivCentering';
		descriptionDiv.innerHTML = userTransactionData.description;
		
		descriptionTableRow.appendChild(descriptionDiv);
		tableRows.appendChild(descriptionTableRow);
		
		// Table Row 5
		let amountTransactionsRow = document.createElement('td');
		amountTransactionsRow.setAttribute('id', 'amountTransactionsRow-' + userTransactionData.transactionId);
		amountTransactionsRow.className = 'text-right amountTransactionsRow';
		amountTransactionsRow.setAttribute('data-gramm_editor', false);
		amountTransactionsRow.tabIndex = -1;
		
		// Append Amount To Div
		let amountDiv = document.createElement('div');
		amountDiv.setAttribute('contenteditable', true);
		amountDiv.className = 'amountDivCentering';
		amountDiv.tabIndex = 0;
		
		// Append a - sign if it is an expense
	   if(categoryMap[categoryId].parentCategory == expenseCategory) {
		   amountDiv.innerHTML = '-' + $('#currentCurrencySymbol').text() + formatNumber(userTransactionData.amount, currentUser.locale);
	   } else {
		   amountDiv.innerHTML = $('#currentCurrencySymbol').text() + formatNumber(userTransactionData.amount, currentUser.locale);
	   }
		
	   amountTransactionsRow.appendChild(amountDiv);
	   tableRows.appendChild(amountTransactionsRow);
	   
	   // Table Row 6
	   let budgetTransactionRow = document.createElement('td');
	   budgetTransactionRow.setAttribute('id', 'budgetTransactionsRow-' + userTransactionData.transactionId);
	   budgetTransactionRow.className = 'text-right categoryIdForBudget-' + categoryId;
	   budgetTransactionRow.tabIndex = -1;
	   
	    // append button to remove the transaction if the amount is zero
	   	let buttonDelete = userTransactionData.amount == 0 ? deleteButton : '';
	   	
	   	budgetTransactionRow.innerHTML = buttonDelete;
	   	tableRows.appendChild(budgetTransactionRow);
	   	
		
		return tableRows;
		
	}
	
	// Building a HTML table for category header for transactions
	function createTableCategoryRows(categoryId, countGrouped, categoryAmountTotal){
		let tableRow = document.createElement("tr");
		tableRow.setAttribute('id', 'categoryTableRow-' + categoryId);
		tableRow.setAttribute('data-toggle', 'collapse');
		tableRow.setAttribute('role' , 'button');
		
		// Change the table color if for expense vs income
		if(categoryMap[categoryId].parentCategory == expenseCategory) {
			tableRow.className = 'toggle table-danger categoryTableRow-' + categoryId;
		} else {
			tableRow.className = 'toggle table-success categoryTableRow-' + categoryId;
		}
		
		// Row 1
		let indexTableCell = document.createElement('td');
		indexTableCell.className = 'text-center dropdown-toggle-right font-17';
		tableRow.appendChild(indexTableCell);
		
		// Table Row 2
		let checkboxCell = document.createElement('td');
		checkboxCell.tabIndex = -1;
		tableRow.appendChild(checkboxCell);
		
		
		// Table Row 3
		let selectCategoryRow = document.createElement('td');
		selectCategoryRow.className = 'font-weight-bold';
		selectCategoryRow.innerHTML = categoryMap[categoryId].categoryName;
		tableRow.appendChild(selectCategoryRow);
		
		// Table Row 4
		let descriptionTableRow = document.createElement('td');
		tableRow.appendChild(descriptionTableRow);
		
		// Table Row 5
		let amountTransactionsRow = document.createElement('td');
		amountTransactionsRow.setAttribute('id', 'amountCategory-' + categoryId);
		amountTransactionsRow.className = 'text-right amountCategoryId-' + categoryId + ' spendingCategory';
		
		// Append a - sign for the category if it is an expense
	   if(categoryMap[categoryId].parentCategory == expenseCategory) {
		   amountTransactionsRow.innerHTML = '-' + categoryAmountTotal;
	   } else {
		   amountTransactionsRow.innerHTML = categoryAmountTotal;
	   }
	   tableRow.appendChild(amountTransactionsRow);
	   
	   // Table Row 6
	   let budgetTransactionsRow = document.createElement('td');
	   budgetTransactionsRow.setAttribute('id', 'budgetCategory-' + categoryId);
	   budgetTransactionsRow.className = 'text-right';
	   tableRow.appendChild(budgetTransactionsRow);
	   // TODO  have to be replaced with budget
		
		return tableRow;
		
	}
	
	// Disable Button if no check box is clicked and vice versa
	$( "tbody" ).on( "click", ".number" ,function() {
		manageDeleteTransactionsButton();
		
		// Change color of the background when the check box is checked
		$(this).closest('tr').toggleClass('background-snow', 300);
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
			                        	showNotification('Successfully deleted the selected transactions','top','center','success');
			                        	 
			                         	fetchJSONForTransactions();
			                         },
			                         error: function (thrownError) {
			                        	 var responseError = JSON.parse(thrownError.responseText);
				                         	if(responseError.error.includes("Unauthorized")){
				                         		sessionExpiredSwal(thrownError);
				                         	} else{
				                         		showNotification('Unable to delete the transaction','top','center','error');
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
	        		  categoryMap[value.categoryId] = value;
	        		  let option = document.createElement('option');
        			  option.className = 'categoruOption-' + value.categoryId;
        			  option.value = value.categoryId;
        			  option.text = value.categoryName;
	        		  if(value.parentCategory == expenseCategory){
	        			  expenseSelectionOptGroup.appendChild(option);
	        		  } else if(value.parentCategory == incomeCategory) {
	        			  incomeSelectionOptGroup.appendChild(option);
	        		  }
	    		   }); 
	        	  
	        	  document.getElementById('expenseSelection').appendChild(expenseSelectionOptGroup);
	        	  document.getElementById('incomeSelection').appendChild(incomeSelectionOptGroup);
	           }
	        });
	}
	
	// Show or hide multiple rows in the transactions table
	$( "tbody" ).on( "click", ".toggle" ,function() {
		let categoryId = splitElement($(this).attr('id'),'-');
		let classToHide = '.hideableRow-' + lastElement(categoryId);
	  	$(classToHide).toggleClass('d-none');
	  	$($(this)[0].children[0]).toggleClass('dropdown-toggle', 100, 'easeInQuad').toggleClass('dropdown-toggle-right', 100, 'easeInQuad');
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
		if(isEmpty(locale)){
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
	
	// Catch the description when the user focuses on the description
	$( "tbody" ).on( "focusin", ".tableRowForSelectCategory" ,function() {
		let closestTableRow = $(this).closest('tr');
		// Remove BR appended by mozilla
		if(closestTableRow != null && closestTableRow.length > 0 && closestTableRow[0] != null) {
			if(closestTableRow[0].children != null && closestTableRow[0].children.length >= 4) {
				if(closestTableRow[0].children[3] != null && closestTableRow[0].children[3].children != null && closestTableRow[0].children[3].children[1] != null) {
					closestTableRow[0].children[3].children[1].remove();
				}
			}
		}
		closestTableRow.addClass('tableRowTransactionHighlight');
	});
	
	// Process the description to find out if the user has changed the description
	$( "tbody" ).on( "focusout", ".tableRowForSelectCategory" ,function() {
		$(this).closest('tr').removeClass('tableRowTransactionHighlight');
	});
	
	// Change trigger on select
	$( "tbody" ).on( "change", ".tableRowForSelectCategory" ,function() {
		let categoryId = $(this).attr('id');
		let selectedTransactionId = splitElement(categoryId,'-');
		let classList = $('#' + categoryId).length > 0 ? $('#' + categoryId)[0].classList : null;
		
		if(!isEmpty(classList)) {
			let values = {};
			values['categoryId'] = $(this).val();
			values['transactionId'] = selectedTransactionId[selectedTransactionId.length - 1];
			$.ajax({
		          type: "POST",
		          url: transactionsUpdateUrl + 'category',
		          dataType: "json",
		          data : values,
		          success: function(userTransaction){
		        	  let previousCategoryId ='';
		        	  
		        		// Update the current category
			        	  classList.forEach(function (classItem) {
			        		  if(includesStr(classItem,'categoryIdForSelect')){
			        			// Remove amount from current Category
			        			  previousCategoryId = lastElement(splitElement(classItem,'-'));
			    	        	  updateCategoryAmount(previousCategoryId , parseFloat('-' + userTransaction.amount), false);
			        		  }
			        	  });
			        	  
			        	  // Remove previous class related to category id and add the new one
			        	  $('#' + categoryId).removeClass('categoryIdForSelect-' + previousCategoryId).addClass('categoryIdForSelect-'+ userTransaction.categoryId);
			        	  // Add to the new category
			        	  updateCategoryAmount(userTransaction.categoryId, userTransaction.amount, false);
		          },
		          error: function (thrownError) {
	              	 var responseError = JSON.parse(thrownError.responseText);
	                   	if(responseError.error.includes("Unauthorized")){
	                   		sessionExpiredSwal(thrownError);
	                   	} else{
	                   		showNotification('Unable to change the category','top','center','error');
	                   	}
	               }
		           
		        });
		}
	});
	
	// Catch the description when the user focuses on the description
	$( "tbody" ).on( "focusin", ".transactionsTableDescription" ,function() {
		// Remove BR appended by mozilla
		$('.transactionsTableDescription br[type="_moz"]').remove();
		descriptionTextEdited = trimElement(this.innerText);
		$(this).closest('tr').addClass('tableRowTransactionHighlight');
	});
	
	// Process the description to find out if the user has changed the description
	$( "tbody" ).on( "focusout", ".transactionsTableDescription" ,function() {
		
		postNewDescriptionToUserTransactions(this);
		$(this).closest('tr').removeClass('tableRowTransactionHighlight');
	});
	
	// Description - disable enter key and submit request
	$('tbody').on('keyup keypress', '.transactionsTableDescription' , function(e) {
		  var keyCode = e.keyCode || e.which;
		  if (keyCode === 13) { 
		    e.preventDefault();

		    postNewDescriptionToUserTransactions(this);
		    $(this).blur(); 
		    return false;
		  }
	});
	
	// A function to post an ajax call to description
	function postNewDescriptionToUserTransactions(element) {
		// If the text is not changed then do nothing
		let enteredText = trimElement(element.innerText);
		if(isEqual(descriptionTextEdited, enteredText)){
			// replace the text with a trimmed version 
			let documentDescription = document.createElement('div');
			documentDescription.setAttribute('contenteditable', true);
			documentDescription.tabIndex = 0;
			documentDescription.className = 'descriptionDivCentering';
			documentDescription.innerHTML = enteredText;
			element.innerHTML = '';
			element.appendChild(documentDescription);
			return;
		}
		
		let changedDescription = splitElement($(element).attr('id'),'-');
		var values = {};
		values['description'] = enteredText;
		values['transactionId'] = changedDescription[changedDescription.length - 1];
		
		$.ajax({
			  async: false,
	          type: "POST",
	          url: transactionsUpdateUrl + 'description',
	          dataType: "json",
	          data : values,
	          success: function (userTransaction){
	        	  // To prevent form re-submission on focus out of the user has pressed enter 
	        	  descriptionTextEdited =  trimElement(element.innerText);
	          },
	          error: function (thrownError) {
            	 var responseError = JSON.parse(thrownError.responseText);
                 	if(responseError.error.includes("Unauthorized")){
                 		sessionExpiredSwal(thrownError);
                 	} else{
                 		showNotification('Unable to change the description','top','center','error');
                 	}
             }
	        });
	}
	
	// Catch the amount when the user focuses on the transaction
	$( "tbody" ).on( "focusin", ".amountTransactionsRow" ,function() {
		amountEditedTransaction = trimElement(this.innerText);
		$(this).closest('tr').addClass('tableRowTransactionHighlight');
	});
	
	// Process the amount to find out if the user has changed the transaction amount (Disable async to update total category amount)
	$( "tbody" ).on( "focusout", ".amountTransactionsRow" ,function() {
		postNewAmountToUserTransactions(this);
		$(this).closest('tr').removeClass('tableRowTransactionHighlight');
	});
	
	// Amount - disable enter key and submit request
	$('tbody').on('keyup keypress', '.amountTransactionsRow' , function(e) {
		  var keyCode = e.keyCode || e.which;
		  if (keyCode === 13) { 
		    e.preventDefault();

		    postNewAmountToUserTransactions(this);
		    $(this).blur(); 
		    return false;
		  }
		  
		  let amountEntered = convertToNumberFromCurrency(this.innerText);
		  let selectTransactionId = splitElement($(this).attr('id'),'-');
		  // Handles the addition of buttons in the budget column for the row
		  appendButtonForAmountEdition(amountEntered, selectTransactionId);
	});
	
	// Append amount to user transaction
	function postNewAmountToUserTransactions(element){

		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = round(parseFloat(trimElement(lastElement(splitElement(element.innerText,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
		let previousText = parseFloat(lastElement(splitElement(amountEditedTransaction,currentCurrencyPreference)).replace(/[^0-9.-]+/g,""));
		
		let selectTransactionId = splitElement($(element).attr('id'),'-');
		
		// Test if the entered value is valid
		if(isNaN(enteredText) || !regexForFloat.test(enteredText) || enteredText == 0) {
			// Replace the entered text with 0 inorder for the code to progress.
			enteredText = 0;
		}
		
		// Replace negative sign to positive sign if entered by the user
		if(enteredText < 0){
			enteredText = parseFloat(lastElement(splitElement(enteredText,'-')),2);
		}
		
		// Test if the entered value is the same as the previous one
		if(previousText != enteredText){
		
			// obtain the transaction id of the table row
			let changedAmount = splitElement($(element).attr('id'),'-');
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
		        	  updateCategoryAmount(userTransaction.categoryId, totalAddedOrRemovedFromAmount, true);
		        	  amountEditedTransaction = trimElement(element.innerText);
		          },
		          error: function (thrownError) {
	              	 var responseError = JSON.parse(thrownError.responseText);
	                   	if(responseError.error.includes("Unauthorized")){
	                   		sessionExpiredSwal(thrownError);
	                   	} else{
	                   		showNotification('Unable to change the transacition amount','top','center','error');
	                   	}
	               }
		        });
		}
		
		// replace the text with a trimmed version
		appendCurrencyToAmount(element, enteredText);
		
		// Handles the addition of buttons in the budget column for the row
		appendButtonForAmountEdition(enteredText, selectTransactionId);
	}
	
	// Append appropriate buttons when the amount is edited
	function appendButtonForAmountEdition(enteredText, selectTransactionId) {
		// append remove button if the transaction amount is zero
		let budgetTableCell = $('#budgetTransactionsRow-' + selectTransactionId[selectTransactionId.length - 1]);
		  if(enteredText == 0 && isEmpty(budgetTableCell[0].innerText)){
			// Handles the addition of buttons in the budget column for the row
			  budgetTableCell.html(deleteButton).hide().children().fadeIn('slow', function(){ budgetTableCell.show('slow'); })
		  } else if(enteredText > 0 && !isEmpty(budgetTableCell[0].innerText)){
			  budgetTableCell.children().fadeOut('slow', function(){ $(this).html(''); });
		  }
	}
	
	// Update the category amount
	function updateCategoryAmount(categoryId, totalAddedOrRemovedFromAmount, updateTotal){
		
			// if the category has not been added yet
			if(isEmpty($('.amountCategoryId-' + categoryId))){
				return;
			}
			
		  let newCategoryTotal = 0;
	  	  let categoryTotal = $('.amountCategoryId-' + categoryId)[0].innerText;
	  	  // Convert to number regex
	  	  let previousCategoryTotal = parseFloat(categoryTotal.replace(/[^0-9.-]+/g,""));
	  	  previousCategoryTotal = lastElement(splitElement(previousCategoryTotal, '-'));
	  	  let minusSign = '';
	  	  if(includesStr(categoryTotal,'-')){
	  		  minusSign = '-';
	  	  }
	  	  newCategoryTotal = round(parseFloat(parseFloat(previousCategoryTotal) + parseFloat(totalAddedOrRemovedFromAmount)),2);
	  	  // Format the newCategoryTotal to number and format the number as currency
	  	  $('.amountCategoryId-' + categoryId).html(minusSign + currentCurrencyPreference + formatNumber(Number(newCategoryTotal), currentUser.locale));
	  	  
	  	  if(updateTotal){
	  		  // Obtain the class list of the category table row
		  	  let categoryForCalculation = $('.amountCategoryId-' + categoryId)[0].classList;
		  	  updateTotalCalculations(categoryForCalculation, totalAddedOrRemovedFromAmount);
	  	  }
	}
	
	// Updates the final amount section with the current value
	function updateTotalCalculations(categoryForCalculation , totalAddedOrRemovedFromAmount){
		
		if(includesStr(categoryForCalculation, 'spendingCategory')) {
			let currentValueExpense = round(parseFloat(trimElement(lastElement(splitElement($("#totalExpensesTransactions")[0].innerText,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
			let totalAmountLeftForExpenses = currentValueExpense+ round(parseFloat(totalAddedOrRemovedFromAmount),2);
			replaceHtml('totalExpensesTransactions' , '-' + currentCurrencyPreference + formatNumber(Number(totalAmountLeftForExpenses), currentUser.locale));
			
		} else if(includesStr(categoryForCalculation, 'incomeCategory')) {
			let currentValueIncome = round(parseFloat(trimElement(lastElement(splitElement($("#totalIncomeTransactions")[0].innerText,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
			let totalAmountLeftForIncome = currentValueIncome + round(parseFloat(totalAddedOrRemovedFromAmount),2);
			replaceHtml('totalIncomeTransactions' , currentCurrencyPreference + formatNumber(Number(totalAmountLeftForIncome), currentUser.locale));
		}
		
		// Update the total available 
		let income = convertToNumberFromCurrency(fetchFirstElement($("#totalIncomeTransactions")).innerText);
		let expense = convertToNumberFromCurrency(fetchFirstElement($("#totalExpensesTransactions")).innerText);

		let minusSign = '';
		let availableCash = income-expense;
		if (availableCash < 0){
			minusSign = '-';
			availableCash = lastElement(splitElement(availableCash, '-'));
		}
		
		replaceHtml('totalAvailableTransactions' , minusSign + currentCurrencyPreference + formatNumber(Number(availableCash), currentUser.locale));
		
	}
	
	// Append currency to amount if it exist and a '-' sign if it is a transaction
	function appendCurrencyToAmount(element, enteredText){
		// if the currency or the minus sign is removed then replace it back when the focus is lost
		if(!includesStr(element.innerText,currentCurrencyPreference) && includesStr(amountEditedTransaction,currentCurrencyPreference)){
			let minusSign = '';
			if(includesStr(amountEditedTransaction,'-')){
				minusSign = '-';
			}
			let changeInnerTextAmount = minusSign + currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
			let replaceEnteredText = '<div class="text-right amountDivCentering"  contenteditable="true" tabindex="0">' + trimElement(changeInnerTextAmount).replace(/ +/g, "") + '</div>';
			element.innerHTML = replaceEnteredText;
		} else {
			let minusSign = '';
			if(includesStr(amountEditedTransaction,'-')){
				minusSign = '-';
			}
			let changeInnerTextAmount = minusSign + currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
			// Replace the space in between and trim the text
			let replaceEnteredText = '<div class="text-right amountDivCentering"  contenteditable="true" tabindex="0">' + trimElement(changeInnerTextAmount).replace(/ +/g, "") + '</div>';
			element.innerHTML = replaceEnteredText;
		}
	}
	
	
	function changeColorOfSidebar(){
		if ($sidebar.length != 0) {
			 $sidebar.attr('data-color', 'green');
		 }
	}
	
	// Dynamically generated button click
	$( "tbody" ).on( "click", ".removeRowTransaction" ,function() {
		var id = lastElement(splitElement($(this).closest('td').attr('id'),'-'));
		// Remove the button and append the loader with fade out
		$('#budgetTransactionsRow-' + id).children().fadeOut('slow', function(){ $(this).html(loaderBudgetSection); });
		
		
		// Handle delete for individual row
		jQuery.ajax({
            url: transactionAPIUrl + id,
            type: 'DELETE',
            success: function(data) {
            	
            	let classListBudget = $('#budgetTransactionsRow-' + id)[0].classList;
            	classListBudget.forEach(function(classItem) {
            		if(includesStr(classItem, 'categoryIdForBudget')) {
            			// Remove amount from current Category
	        			previousCategoryId = lastElement(splitElement(classItem,'-'));
	        			let categoryAmount = convertToNumberFromCurrency($('.amountCategoryId-' + previousCategoryId)[0].innerText);
	        			
	        			if(categoryAmount == 0) {
	        				$('.amountCategoryId-' + previousCategoryId).closest('tr').fadeOut('slow', function(){ $(this).remove(); });
	        			}
	        			
            		}
            	});
            	
            	// Remove the table row (No need to update category amount or total values as the value of the TR is already 0 )
            	let closestTr = $('#budgetTransactionsRow-' + id).closest('tr');
            	$(closestTr).fadeOut('slow', function(){ $(this).remove(); });
            	
            },
            error: function (thrownError) {
           	 let responseError = JSON.parse(thrownError.responseText);
                	if(responseError.error.includes("Unauthorized")){
                		sessionExpiredSwal(thrownError);
                	} else{
                		document.getElementById('budgetTransactionsRow-' + id).innerHTML = deleteButton;
                		
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
	
	// convert from currency format to number
	function convertToNumberFromCurrency(amount){
		return round(parseFloat(trimElement(lastElement(splitElement(amount,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
	}
     
});

