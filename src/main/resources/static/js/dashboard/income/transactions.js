"use strict";
$(document).ready(function(){
	
	// Description Text
	let descriptionTextEdited = '';
	// Amount Text
	let amountEditedTransaction = '';
	// User Updated Budegt
	let userUpdateBudgetCached = '';
	
	const replaceTransactionsId = "productsJson";
	// Used to refresh the transactions only if new ones are added
	let resiteredNewTransaction = false;
	// Divs for error message while adding transactions
	let errorAddingTransactionDiv = '<div class="row ml-auto mr-auto"><i class="material-icons red-icon">highlight_off</i><p class="margin-bottom-zero red-icon margin-left-five">';
	// Bills & Fees Options selection
	const selectedOption = '4';
	// Delete Transaction Button Inside TD
	const deleteButton = '<button class="btn btn-danger btn-sm removeRowTransaction">Remove</button>';
	// New Pie Chart Storage Variable
	let transactionsChart = '';
	// Fetch Drag Handle for transactions row table
	let dragHandle = fetchDragHandle();
		
	// Call the transaction API to fetch information.
	fetchJSONForTransactions();
	
	
	/**
	 * START Load at the end of the javascript
	 */
	
	// Load Expense category and income category
	expenseSelectionOptGroup = cloneElementAndAppend(document.getElementById('expenseSelection'), expenseSelectionOptGroup);
	incomeSelectionOptGroup = cloneElementAndAppend(document.getElementById('incomeSelection'), incomeSelectionOptGroup);
	
	// Success SVG Fragment
	let successSVGFormed = successSvgMessage();
	
	// Load images in category modal
	loadCategoryModalImages();
	
	// Save Transactions on form submit
	$('#transactionsForm').submit(function(event) {
		// disable button after successful submission
	   let transactionSubmissionButton = document.getElementById('transactionsFormButtonSubmission');
	   transactionSubmissionButton.setAttribute("disabled", "disabled");
	   registerTransaction(event, transactionSubmissionButton);
	});
	
	function registerTransaction(event, transactionSubmissionButton){
	   event.preventDefault();
	   event.stopImmediatePropagation(); // necessary to prevent submitting the form twice
	   replaceHTML('successMessage' , '');
	   replaceHTML('errorMessage','');
	   let formValidation = true;
	   
	   let amount = document.getElementById('amount').value;
	   if(amount == null || amount == ''){
		   fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Please fill the Amount.</p></div> <br/>',2000);
		   formValidation = false;
	   }
	   
	   amount = er.convertToNumberFromCurrency(amount,currentCurrencyPreference);
	   if(amount == 0){
		   fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Amount cannot be zero.</p></div> <br/>',2000);
		   formValidation = false;
	   }
	   
	   if(!formValidation){
		   // enable button after successful submission
		   transactionSubmissionButton.removeAttribute("disabled");
		   return;
	   }
	    
	    amount = Math.abs(amount);
	    // Get all the input radio buttons for recurrence to check which one is clicked
	    let recurrence = document.getElementsByName('recurrence');
	    let recurrenceValue = 'NEVER';
	    
	    // If the recurrence is not empty then assign the checked one
	    if(isNotEmpty(recurrence)) {
	    	for(let count = 0, length = recurrence.length; count < length; count++) {
	    		if(recurrence[count].checked) {
	    			recurrenceValue = recurrence[count].value;
	    		}	
	    	}
	    }
	    
	    let description = document.getElementById('description').value;
	    let categoryOptions = document.getElementById('categoryOptions').value;
		let values = {};
		values['amount'] = amount;
		values['description'] = description;
		values['categoryOptions'] = categoryOptions;
		values['dateMeantFor'] = chosenDate;
		values['recurrence'] = recurrenceValue;
		$.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.saveTransactionsUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	          data : values,
	          success: function(data) {
	        	let successMessageDocument = document.getElementById('successMessage');
	        	// Clone and Append the success Message
	        	successSVGFormed = cloneElementAndAppend(successMessageDocument , successSVGFormed);
	        	// Add css3 to fade in and out
	        	successMessageDocument.classList.add('messageFadeInAndOut');
	  	    	resiteredNewTransaction=true;
	  	    	transactionSubmissionButton.removeAttribute("disabled");
	  	      },
	  	      error: function(data) {
	  	    	var responseError = JSON.parse(data.responseText);
	           	if(responseError.error.includes("Unauthorized")){
	  		    	$('#GSCCModal').modal('hide');
	  		    	er.sessionExpiredSwal(data);
	           	}
	  	    	fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Unable to add this transaction.</p></div> <br/>',2000);
	  	    	resiteredNewTransaction=false;
	  	    	transactionSubmissionButton.removeAttribute("disabled");
	  	    }
		});
	    
	}
	
	
	// Use this function to fade the message out
	function fadeoutMessage(divId, message, milliSeconds){
		$(divId).fadeIn('slow').show().append(message);
    	setTimeout(function() {
    		$(divId).fadeOut();
    	}, milliSeconds);
	}
	
	// refresh the transactions page on closing the modal
	$('#GSCCModal').on('hidden.bs.modal', function () {
		// Clear form input fields inside the modal and the error or success messages.
		$('#transactionsForm').get(0).reset();
		replaceHTML('successMessage',"");
		replaceHTML('errorMessage',"");
		
		if(resiteredNewTransaction) {
			fetchJSONForTransactions();
			// Do not refresh the transactions if no new transactions are added
			resiteredNewTransaction = false;
		}
		
	});
	
	// Populates the transaction table
	function fetchJSONForTransactions(){
		// Load all user transaction from API
		jQuery.ajax({
			url: CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate,
            type: 'GET',
            success: function(result) {
    			let totalExpensesTransactions = 0.00;
    			let totalIncomeTransactions = 0.00;
    			let transactionsTableDiv = document.createDocumentFragment();
    			let documentTbody = document.getElementById(replaceTransactionsId);
    			// uncheck the select all checkbox if checked
    			let checkAllBox = document.getElementById('checkAll');
    			// Fetch all the key set for the result
    			let resultKeySet = Object.keys(result)
             	for(let countGrouped = 0, lengthArray = resultKeySet.length; countGrouped < lengthArray; countGrouped++) {
             	   let key = resultKeySet[countGrouped];
             	   let value = result[key];
     			   let transactionsRowDocumentFragment = document.createDocumentFragment();
     			   let totalCategoryAmount = 0;
     			   let valueElementKeySet = Object.keys(value)
     			   for(let count = 0, length = valueElementKeySet.length; count < length; count++) {
     				  let subKey = valueElementKeySet[count];
     				  let subValue = value[subKey];
     				  // Create transactions table row
     				  transactionsRowDocumentFragment.appendChild(createTableRows(subValue, 'd-none', key));
     				  totalCategoryAmount += subValue.amount;
     			   }
     			   // Load all the total category amount in the category section
     			   let categoryAmountTotal = currentCurrencyPreference + formatNumber(totalCategoryAmount, currentUser.locale);
     			   // Create category label table row
     			   transactionsTableDiv.appendChild(createTableCategoryRows(key, countGrouped, categoryAmountTotal));
     			   transactionsTableDiv.appendChild(transactionsRowDocumentFragment);
     			   // Total Expenses and Total Income
     			   if(categoryMap[key].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
     				   totalExpensesTransactions += totalCategoryAmount;
     			   } else if (categoryMap[key].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.incomeCategory) {
     				   totalIncomeTransactions += totalCategoryAmount;
     			   }
             	}
    		   
    		   // Update table with empty message if the transactions are empty
    		   if(result.length == 0) {
    			   checkAllBox.setAttribute('disabled', 'disabled');
    			   documentTbody.innerHTML = '';
    			   document.getElementById(replaceTransactionsId).appendChild(fetchEmptyTableMessage());
    		   } else {
    			   $('#checkAll').prop('checked', false);
       			   checkAllBox.removeAttribute('disabled');
    			   documentTbody.innerHTML = '';
    			   documentTbody.appendChild(transactionsTableDiv);
    		   }
    		   
    		  // Disable delete Transactions button on refreshing the transactions
              manageDeleteTransactionsButton();
    		  // update the Total Available Section
    		  updateTotalAvailableSection(totalIncomeTransactions , totalExpensesTransactions);
    		  // Update Budget from API
    		  updateBudgetForIncome();
    		
            }
		});
	}
	
	// Fetches the budget for all the category rows if present and updates the category row
	function updateBudgetForIncome() {
		jQuery.ajax({
			url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate,
            type: 'GET',
            success: function(data) {
            	let dataKeySet = Object.keys(data)
            	for(let count = 0, length = dataKeySet.length; count < length; count++){
	        		  let key = dataKeySet[count];
	            	  let value = data[key];
	            	  
	            	  if(isEmpty(value)) {
	            		  continue;
	            	  }
	            	  
	            	  let categoryRowToUpdate = document.getElementById('budgetCategory-' + value.categoryId);
	            	  
	            	  if(categoryRowToUpdate == null) {
	            		  continue;
	            	  }
	            	  
	            	  categoryRowToUpdate.innerHTML = currentCurrencyPreference + formatNumber(value.planned, currentUser.locale);
            	}
            }
		});
	}
	
	// Updates the total income and total expenses
	function updateTotalAvailableSection(totalIncomeTransactions , totalExpensesTransactions) {
			let totalAvailableTransactions = totalIncomeTransactions - totalExpensesTransactions;
		   if(totalAvailableTransactions < 0) {
			   replaceHTML('totalAvailableTransactions' , '-' + currentCurrencyPreference + formatNumber(Math.abs(totalAvailableTransactions), currentUser.locale));
		   } else {
			   replaceHTML('totalAvailableTransactions', currentCurrencyPreference + formatNumber(totalAvailableTransactions, currentUser.locale));
		   }
		   replaceHTML('totalIncomeTransactions', currentCurrencyPreference + formatNumber(totalIncomeTransactions, currentUser.locale));
		   replaceHTML('totalExpensesTransactions', '-' + currentCurrencyPreference + formatNumber(totalExpensesTransactions, currentUser.locale));
		   
		   // Build Pie chart
		   buildPieChart(updatePieChartTransactions(totalIncomeTransactions, totalExpensesTransactions), 'chartFinancialPosition');
		   
	}
	
	// Update the pie chart with transactions data
	function updatePieChartTransactions(totalIncomeTransactions, totalExpensesTransactions) {
		let dataPreferences = {};
		if(totalIncomeTransactions === 0 && totalExpensesTransactions === 0) {
			replaceHTML('legendPieChart', 'Please fill in adequare data build the chart');
		} else if (totalIncomeTransactions < totalExpensesTransactions) {
			let totalDeficitDifference = totalExpensesTransactions - totalIncomeTransactions;
			let totalDeficitAsPercentageOfExpense = round(((totalDeficitDifference / totalExpensesTransactions) * 100),1);
			   
			let totalIncomeAsPercentageOfExpense = round((((totalExpensesTransactions - totalDeficitDifference) / totalExpensesTransactions) * 100),1);
			   
			// labels: [INCOME,EXPENSE,AVAILABLE]
			dataPreferences = {
		                labels: [totalIncomeAsPercentageOfExpense + '%',,totalDeficitAsPercentageOfExpense + '%'],
		                series: [totalIncomeAsPercentageOfExpense,,totalDeficitAsPercentageOfExpense]
		            };
			
			replaceHTML('legendPieChart', 'Total Income & Total Overspent as a percentage of Total Expense');
			replaceHTML('totalAvailableLabel', 'Total Overspent');
		} else  {
			// (totalIncomeTransactions > totalExpensesTransactions) || (totalIncomeTransactions == totalExpensesTransactions)
			let totalAvailable = totalIncomeTransactions - totalExpensesTransactions;
			let totalAvailableAsPercentageOfIncome = round(((totalAvailable / totalIncomeTransactions) * 100),1);
			   
			let totalExpenseAsPercentageOfIncome = round((((totalIncomeTransactions - totalAvailable) / totalIncomeTransactions) * 100),1);
			   
			// labels: [INCOME,EXPENSE,AVAILABLE]
			dataPreferences = {
		                labels: [, totalExpenseAsPercentageOfIncome + '%',totalAvailableAsPercentageOfIncome + '%'],
		                series: [, totalExpenseAsPercentageOfIncome,totalAvailableAsPercentageOfIncome]
		            };
			
			replaceHTML('legendPieChart', 'Total Expense & Total Available as a percentage of Total Income');
			replaceHTML('totalAvailableLabel', 'Total Available');
		        
		}
		
		return dataPreferences;
		
	}
	
	
	// Building a HTML table for transactions
	function createTableRows(userTransactionData, displayNoneProperty, categoryId){
		let tableRows = document.createElement("div");
		tableRows.className = 'hideableRow-' + categoryId + ' hideableRow ' + displayNoneProperty;
		
		// Cell 1
		let indexTableCell = document.createElement('div');
		indexTableCell.className = 'text-center d-lg-table-cell draggable-handle-wrapper';
		indexTableCell.tabIndex = -1;
		indexTableCell.innerHTML = '';
		indexTableCell.draggable = true;
		
		// obtains the drag handle and clones them into index cell
		dragHandle = cloneElementAndAppend(indexTableCell, dragHandle);
    	tableRows.appendChild(indexTableCell);
    	
		// Table Cell 2
		let formCheckDiv = document.createElement('div');
		formCheckDiv.className = 'form-check';
		formCheckDiv.tabIndex = -1;
		
		let fromCheckLabel = document.createElement('label');
		fromCheckLabel.className = 'form-check-label';
		fromCheckLabel.tabIndex = -1;
		
		let inputFormCheckInput = document.createElement('input');
		inputFormCheckInput.className = 'number form-check-input';
		inputFormCheckInput.type = 'checkbox';
		inputFormCheckInput.innerHTML = userTransactionData.transactionId;
		inputFormCheckInput.tabIndex = -1;
		
		let formCheckSignSpan = document.createElement('span');
		formCheckSignSpan.className = 'form-check-sign';
		formCheckSignSpan.tabIndex = -1;
		
		let checkSpan = document.createElement('span');
		checkSpan.className = 'check';
		formCheckSignSpan.appendChild(checkSpan);
		fromCheckLabel.appendChild(inputFormCheckInput);
		fromCheckLabel.appendChild(formCheckSignSpan);
		formCheckDiv.appendChild(fromCheckLabel);
		
		let checkboxCell = document.createElement('div');
		checkboxCell.tabIndex = -1;
		checkboxCell.className = 'd-lg-table-cell text-center';
		checkboxCell.appendChild(formCheckDiv);
		tableRows.appendChild(checkboxCell);
		
		// Table Cell 3
		let selectCategoryRow = document.createElement('div');
		selectCategoryRow.className = 'd-lg-table-cell';
		
		// Build Select
		let selectCategory = document.createElement('select');
		selectCategory.setAttribute("id", 'selectCategoryRow-' + userTransactionData.transactionId);
		selectCategory.className = 'tableRowForSelectCategory categoryIdForSelect-' + categoryId + ' tableRowSelectCategory';
		selectCategory.setAttribute('aria-haspopup', true);
		selectCategory.setAttribute('aria-expanded', false);
		
		let optGroupExpense = document.createElement('optgroup');
		optGroupExpense.label = 'Expenses';
		expenseSelectionOptGroup = cloneElementAndAppend(optGroupExpense, expenseSelectionOptGroup);
		selectCategory.appendChild(optGroupExpense);
		
		let optGroupIncome = document.createElement('optgroup');
		optGroupIncome.label = 'Income';
		incomeSelectionOptGroup =  cloneElementAndAppend(optGroupIncome, incomeSelectionOptGroup);
		selectCategory.appendChild(optGroupIncome);
		selectCategoryRow.appendChild(selectCategory);
		
		// Set the relevant category in the options to selected
		let toSelectOption = selectCategoryRow.getElementsByClassName('categoryOption-' + categoryId);
		toSelectOption[0].selected = 'selected';
		tableRows.appendChild(selectCategoryRow);
		
		// Table Cell 4
		let descriptionTableRow = document.createElement('div');
		descriptionTableRow.setAttribute('id', 'descriptionTransactionsRow-' + userTransactionData.transactionId);
		descriptionTableRow.className = 'transactionsTableDescription d-lg-table-cell';
		descriptionTableRow.setAttribute('data-gramm_editor' , false);
		descriptionTableRow.tabIndex = -1;
		
		let descriptionDiv = document.createElement('div');
		descriptionDiv.setAttribute('contenteditable', true);
		descriptionDiv.tabIndex = 0;
		descriptionDiv.className = 'descriptionDivCentering';
		descriptionDiv.innerHTML = userTransactionData.description;
		
		descriptionTableRow.appendChild(descriptionDiv);
		tableRows.appendChild(descriptionTableRow);
		
		// Table Cell 5
		let amountTransactionsRow = document.createElement('div');
		amountTransactionsRow.setAttribute('id', 'amountTransactionsRow-' + userTransactionData.transactionId);
		amountTransactionsRow.className = 'text-right amountTransactionsRow d-lg-table-cell';
		amountTransactionsRow.setAttribute('data-gramm_editor', false);
		amountTransactionsRow.tabIndex = -1;
		
		// Append Amount To Div
		let amountDiv = document.createElement('div');
		amountDiv.setAttribute('contenteditable', true);
		amountDiv.className = 'amountDivCentering';
		amountDiv.tabIndex = 0;
		
		// Append a - sign if it is an expense
	   if(categoryMap[categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
		   amountDiv.innerHTML = '-' + currentCurrencyPreference + formatNumber(userTransactionData.amount, currentUser.locale);
	   } else {
		   amountDiv.innerHTML = currentCurrencyPreference + formatNumber(userTransactionData.amount, currentUser.locale);
	   }
		
	   amountTransactionsRow.appendChild(amountDiv);
	   tableRows.appendChild(amountTransactionsRow);
	   
	   // Table Cell 6
	   let budgetTransactionRow = document.createElement('div');
	   budgetTransactionRow.setAttribute('id', 'budgetTransactionsRow-' + userTransactionData.transactionId);
	   budgetTransactionRow.className = 'text-right d-lg-table-cell categoryIdForBudget-' + categoryId;
	   budgetTransactionRow.tabIndex = -1;
	   
	    // append button to remove the transaction if the amount is zero
	   	let buttonDelete = userTransactionData.amount == 0 ? deleteButton : '';
	   	
	   	budgetTransactionRow.innerHTML = buttonDelete;
	   	tableRows.appendChild(budgetTransactionRow);
	   	
		
		return tableRows;
		
	}
	
	// Building a HTML table for category header for transactions
	function createTableCategoryRows(categoryId, countGrouped, categoryAmountTotal){
		let tableRow = document.createElement("div");
		tableRow.setAttribute('id', 'categoryTableRow-' + categoryId);
		tableRow.setAttribute('data-toggle', 'collapse');
		tableRow.setAttribute('role' , 'button');
		
		// Change the table color if for expense vs income
		if(categoryMap[categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			tableRow.className = 'toggle d-lg-table-row expenseCategory categoryTableRow-' + categoryId;
		} else {
			tableRow.className = 'toggle d-lg-table-row incomeCategory categoryTableRow-' + categoryId;
		}
		
		// Row 1
		let indexTableCell = document.createElement('div');
		indexTableCell.className = 'text-center d-lg-table-cell dropdown-toggle-right font-17';
		tableRow.appendChild(indexTableCell);
		
		// Table Row 2
		let checkboxCell = document.createElement('div');
		checkboxCell.tabIndex = -1;
		checkboxCell.className = 'd-lg-table-cell';
		tableRow.appendChild(checkboxCell);
		
		
		// Table Row 3
		let selectCategoryRow = document.createElement('div');
		selectCategoryRow.className = 'font-weight-bold d-lg-table-cell';
		
		let categoryNameWrapper = document.createElement('div');
		categoryNameWrapper.className = 'd-lg-inline';
		categoryNameWrapper.innerHTML = categoryMap[categoryId].categoryName;
		
		let linkElementWrapper = document.createElement('a');
		linkElementWrapper.href = '#';
		linkElementWrapper.id = 'addTableRow-' + categoryId;
		linkElementWrapper.className = 'd-lg-inline addTableRowListener align-self-center';
		
		let addIconElement = document.createElement('i');
		addIconElement.className = 'material-icons displayCategoryAddIcon';
		addIconElement.innerHTML = 'add_circle_outline';
		
		linkElementWrapper.appendChild(addIconElement);
		categoryNameWrapper.appendChild(linkElementWrapper);
		selectCategoryRow.appendChild(categoryNameWrapper);
		tableRow.appendChild(selectCategoryRow);
		
		// Table Row 4
		let descriptionTableRow = document.createElement('div');
		descriptionTableRow.className = 'd-lg-table-cell';
		tableRow.appendChild(descriptionTableRow);
		
		// Table Row 5
		let amountTransactionsRow = document.createElement('div');
		amountTransactionsRow.setAttribute('id', 'amountCategory-' + categoryId);
		
		if(categoryMap[categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			amountTransactionsRow.className = 'text-right category-text-danger font-weight-bold d-lg-table-cell amountCategoryId-' + categoryId + ' spendingCategory';
		} else {
			amountTransactionsRow.className = 'text-right category-text-success font-weight-bold d-lg-table-cell amountCategoryId-' + categoryId + ' incomeCategory';
		}
		
		// Append a - sign for the category if it is an expense
	   if(categoryMap[categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
		   amountTransactionsRow.innerHTML = '-' + categoryAmountTotal;
	   } else {
		   amountTransactionsRow.innerHTML = categoryAmountTotal;
	   }
	   tableRow.appendChild(amountTransactionsRow);
	   
	   // Table Row 6
	   let budgetTransactionsRow = document.createElement('div');
	   budgetTransactionsRow.setAttribute('id', 'budgetCategory-' + categoryId);
	   budgetTransactionsRow.className = 'text-right d-lg-table-cell font-weight-bold';
	   tableRow.appendChild(budgetTransactionsRow);
	   
	   return tableRow;
		
	}
	
	// Disable Button if no check box is clicked and vice versa
	$( "#transactionsTable" ).on( "click", ".number" ,function() {
		let checkAllElementChecked = $("#checkAll:checked");
		if(checkAllElementChecked.length > 0) {
			// uncheck the check all if a check is clicked and if the check all is already clicked
			checkAllElementChecked.prop('checked', false);
		}
		
		// Click the checkAll is all the checkboxes are clicked
		checkAllIfAllAreChecked();
		manageDeleteTransactionsButton();
		
		// Change color of the background when the check box is checked
		$(this).parent().closest('div').parent().closest('div').parent().closest('div').toggleClass('background-snow', 300);
	});
	
	// Check All if all of the checkbox is clicked
	function checkAllIfAllAreChecked() {
		// Click the checkAll is all the checkboxes are clicked
		let allCheckedTransactions = $(".number:checked");
		let allTransactions = $(".number");
		if(allCheckedTransactions.length == allTransactions.length) {
			$("#checkAll").prop('checked', true);
		}
	}
	
	// Select all check boxes for Transactions
	$("#checkAll").click(function () {
		$('input[type="checkbox"]').prop('checked', $(this).prop('checked'));
		manageDeleteTransactionsButton();
	});
	
	// Function to enable of disable the delete transactions button
	function manageDeleteTransactionsButton(){
		let manageTransactionsButton = document.getElementById('manageTransactionButton');
		if($( ".number:checked" ).length > 0) {
			manageTransactionsButton.removeAttribute('disabled');
		  } else {
			 manageTransactionsButton.setAttribute('disabled','disabled');
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
			            }).then(function(result) {
			            	
			            	 if (result.value) {
			             		// Check all check boxes by default
			                     var transactionIds = [];
			                    
			                     let allCheckedItems = $("input[type=checkbox]:checked")
			                     for(let i = 0, length = allCheckedItems.length; i < length; i++) {
			                     	// To remove the select all check box values
			                    	let transactionId = allCheckedItems[i].innerHTML;
			                     	if(transactionId != "on" && isNotBlank(transactionId)){
			                     		transactionIds.push(transactionId);
			                     	}
			                     }

			                     transactionIds.join(",")
			                     
			                     jQuery.ajax({
			                         url: CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.financialPortfolioId + '/' + transactionIds + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate,
			                         type: 'DELETE',
			                         contentType: "application/json; charset=utf-8", 
			                         success: function() {
			                        	showNotification('Successfully deleted the selected transactions','top','center','success');
			                        	
			                        	let checkAllClicked = $("#checkAll:checked").length > 0;
			                        	
			                        	// If Check All is clicked them empty div and reset pie chart
			                        	if(checkAllClicked){
			                        		// uncheck the select all checkbox if checked
			                        		let checkAllBox = document.getElementById('checkAll');
			                        		$('#checkAll').prop('checked',false);
			                        		checkAllBox.setAttribute('disabled','disabled');
			                        		let documentTbody = document.getElementById(replaceTransactionsId);
			                        		documentTbody.innerHTML = '';
			                 			   	document.getElementById(replaceTransactionsId).appendChild(fetchEmptyTableMessage());
			                 			   	// update the Total Available Section with 0
			                 	    		updateTotalAvailableSection(0 , 0);
			                 	    		// Disable delete Transactions button on refreshing the transactions
				                         	manageDeleteTransactionsButton();
				                         	// Delete The auto generated user budget
				                         	er.deleteAllAutoGeneratedUserBudget();
				                         	// Close category modal
				                         	closeCategoryModal();
			                        	} else {
			                        		// Choose the closest parent Div for the checked elements
				                        	let elementsToDelete = $('.number:checked').parent().closest('div').parent().closest('div').parent().closest('div');
				                        	let iterateOnceAfterCompletion = elementsToDelete.length;
			                        		// Remove all the elements
				                        	elementsToDelete.fadeOut('slow', function(){ 
				                        		$(this).remove(); 
				                        		
				                        		// Execute the condition only once after all the transactions are removed.
				                        		if(!--iterateOnceAfterCompletion) {
				                        			// Disable delete Transactions button on refreshing the transactions
						                         	manageDeleteTransactionsButton();
						                         	
						                         	// To recalculate the category total amount and to reduce user budget for the category appropriately
						                         	recalculateCategoryTotalAmount();
				                        		}
					                         	
				                        	});
			                        	}
			                         },
			                        error:  function (thrownError) {
			                        	 var responseError = JSON.parse(thrownError.responseText);
				                         	if(responseError.error.includes("Unauthorized")){
				                         		er.sessionExpiredSwal(thrownError);
				                         	} else{
				                         		showNotification('Unable to delete the transactions','top','center','danger');
				                         	}
			                         }
			                     });
			             	
			                 }
			            });
			    } 
			}
	}

	// Show or hide multiple rows in the transactions table
	$( "#transactionsTable" ).on( "click", ".toggle" ,function() {
		let categoryId = lastElement(splitElement(this.id,'-'));
		
		if(er.checkIfInvalidCategory(categoryId)) {
			return;
		}
		
		toggleDropdown(categoryId, this);
	 });
	
	// toggle dropdown
	function toggleDropdown(categoryId, closestTrElement) {
		let classToHide = '.hideableRow-' + categoryId;
		let childCategories = $(classToHide);
		let dropdownArrowDiv = closestTrElement.firstChild.classList;
		// Hide all child categories
		childCategories.toggleClass('d-none').toggleClass('d-lg-table-row');
		// Toggle the drop down arrow
	  	dropdownArrowDiv.toggle('dropdown-toggle');
	  	dropdownArrowDiv.toggle('dropdown-toggle-right');
	  	
	  	// Call method only when the category div is expanding and if the category modal is already open by other categories
	  	if(dropdownArrowDiv.contains('dropdown-toggle')) {
	  		toggleCategoryModal(true);
	  		// Show the category modal on click category row
		  	handleCategoryModalToggle(categoryId, closestTrElement, childCategories.length);
	  	} else {
	  		// If the category modal is active then hide it
	  		toggleCategoryModal(false);
	  	}
	}
	
	// Catch the description when the user focuses on the description
	$( "#transactionsTable" ).on( "focusin", ".tableRowForSelectCategory" ,function() {
		let closestTableRow = $(this).parent().closest('div');
		// Remove BR appended by mozilla
		if(closestTableRow != null && closestTableRow.length > 0 && closestTableRow[0] != null) {
			if(closestTableRow[0].children != null && closestTableRow[0].children.length >= 4) {
				if(closestTableRow[0].children[3] != null && closestTableRow[0].children[3].children != null && closestTableRow[0].children[3].children[1] != null) {
					closestTableRow[0].children[3].children[1].remove();
				}
			}
		}
		closestTableRow[0].classList.add('tableRowTransactionHighlight');
	});
	
	// Process the description to find out if the user has changed the description
	$( "#transactionsTable" ).on( "focusout", ".tableRowForSelectCategory" ,function() {
		$(this).parent().closest('div')[0].classList.remove('tableRowTransactionHighlight');
	});
	
	// Change trigger on select
	$( "#transactionsTable" ).on( "change", ".tableRowForSelectCategory" ,function() {
		let categoryId = this.id;
		let selectedTransactionId = splitElement(categoryId,'-');
		let classList = $('#' + categoryId).length > 0 ? $('#' + categoryId)[0].classList : null;
		
		if(isNotEmpty(classList)) {
			
			// Ensure that the category id is valid
			if(er.checkIfInvalidCategory(this.value)) {
				return;
			}
			
			let values = {};
			values['categoryId'] = this.value;
			values['transactionId'] = selectedTransactionId[selectedTransactionId.length - 1];
			values['dateMeantFor'] = chosenDate;
			$.ajax({
		          type: "POST",
		          url: CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.transactionsUpdateUrl + 'category',
		          dataType: "json",
		          contentType: "application/x-www-form-urlencoded; charset=UTF-8", 
		          data : values,
		          success: function(userTransaction){
		        	  let previousCategoryId ='';
		        	  
		        		// Update the current category
			        	  for(let i=0, length = classList.length; i < length ; i++) {
			        		  let classItem = classList[i]
			        		  if(includesStr(classItem,'categoryIdForSelect')){
			        			// Remove amount from current Category
			        			  previousCategoryId = lastElement(splitElement(classItem,'-'));
			    	        	  updateCategoryAmount(previousCategoryId , parseFloat('-' + userTransaction.amount), false);
			        		  }
			        	  }
			        	  
			        	  // Remove previous class related to category id and add the new one
			        	  let selectOption = document.getElementById(categoryId);
			        	  selectOption.classList.remove('categoryIdForSelect-' + previousCategoryId);
			        	  selectOption.classList.add('categoryIdForSelect-'+ userTransaction.categoryId);
			        	  // Add to the new category
			        	  updateCategoryAmount(userTransaction.categoryId, userTransaction.amount, false);
		          },
		          error: function (thrownError) {
	              	 var responseError = JSON.parse(thrownError.responseText);
	                   	if(responseError.error.includes("Unauthorized")){
	                   		er.sessionExpiredSwal(thrownError);
	                   	} else{
	                   		showNotification('Unable to change the category','top','center','danger');
	                   	}
	               }
		           
		        });
		}
	});
	
	// Catch the description when the user focuses on the description
	$( "#transactionsTable" ).on( "focusin", ".transactionsTableDescription" ,function() {
		// Remove BR appended by mozilla
		$('.transactionsTableDescription br[type="_moz"]').remove();
		descriptionTextEdited = trimElement(this.innerText);
		$(this).parent().closest('div').addClass('tableRowTransactionHighlight');
	});
	
	// Process the description to find out if the user has changed the description
	$( "#transactionsTable" ).on( "focusout", ".transactionsTableDescription" ,function() {
		
		postNewDescriptionToUserTransactions(this);
		$(this).parent().closest('div').removeClass('tableRowTransactionHighlight');
	});
	
	// Description - disable enter key and submit request (key press necessary for prevention of a new line)
	$('#transactionsTable').on('keypress', '.transactionsTableDescription' , function(e) {
		  let keyCode = e.keyCode || e.which;
		  if (keyCode === 13) {
		    e.preventDefault();

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
			// Set the description to empty as the data need not be stored.
			descriptionTextEdited = '';
			return;
		}
		
		let changedDescription = splitElement($(element).attr('id'),'-');
		var values = {};
		values['description'] = enteredText;
		values['transactionId'] = changedDescription[changedDescription.length - 1];
		values['dateMeantFor'] = chosenDate;
		$.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.transactionsUpdateUrl + 'description',
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8", 
	          data : values,
	          success: function() {
	        	// Set the description to empty as the data need not be stored.
	      		descriptionTextEdited = '';
	          },
	          error: function (thrownError) {
            	 var responseError = JSON.parse(thrownError.responseText);
                 	if(responseError.error.includes("Unauthorized")){
                 		er.sessionExpiredSwal(thrownError);
                 	} else{
                 		showNotification('Unable to change the description','top','center','danger');
                 	}
             }
	        });
		
		// Prevent repeated enter button press from calling the server
  		descriptionTextEdited = enteredText;
		
	}
	
	// Catch the amount when the user focuses on the transaction
	$( "#transactionsTable" ).on( "focusin", ".amountTransactionsRow" ,function() {
		amountEditedTransaction = trimElement(this.innerText);
		$(this).parent().closest('div').addClass('tableRowTransactionHighlight');
	});
	
	// Process the amount to find out if the user has changed the transaction amount (Disable async to update total category amount)
	$( "#transactionsTable" ).on( "focusout", ".amountTransactionsRow" ,function() {
		postNewAmountToUserTransactions(this);
		$(this).parent().closest('div').removeClass('tableRowTransactionHighlight');
	});
	
	// Amount - disable enter key and submit request (Key up for making sure that the remove button is shown)
	$('#transactionsTable').on('keyup', '.amountTransactionsRow' , function(e) {
		  let keyCode = e.keyCode || e.which;
		  if (keyCode === 13) { 
		    e.preventDefault();

		    $(this).blur(); 
		    return false;
		  }
		  
		  let amountEntered = er.convertToNumberFromCurrency(this.innerText,currentCurrencyPreference);
		  let selectTransactionId = splitElement(this.id,'-');
		  // Handles the addition of buttons in the budget column for the row
		  appendButtonForAmountEdition(amountEntered, selectTransactionId);
	});

	// Append amount to user transaction
	function postNewAmountToUserTransactions(element){
		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = round(parseFloat(trimElement(lastElement(splitElement(element.innerText,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
		let previousText = parseFloat(lastElement(splitElement(amountEditedTransaction,currentCurrencyPreference)).replace(/[^0-9.-]+/g,""));
		
		// Test if the entered value is valid
		if(isNaN(enteredText) || !regexForFloat.test(enteredText) || enteredText == 0) {
			// Replace the entered text with 0 inorder for the code to progress.
			enteredText = 0;
		} else if(enteredText < 0){
			// Replace negative sign to positive sign if entered by the user
			enteredText = parseFloat(Math.abs(enteredText),2);
		}
		
		// Test if the previous value is valid
		if(isNaN(previousText) || !regexForFloat.test(previousText) || previousText == 0) {
			previousText = 0;
		}
		
		
		// Test if the entered value is the same as the previous one
		if(previousText != enteredText){
			// obtain the transaction id of the table row
			let changedAmount = splitElement($(element).attr('id'),'-');
			var values = {};
			values['amount'] = enteredText;
			values['transactionId'] = changedAmount[changedAmount.length - 1];
			values['dateMeantFor'] = chosenDate;
			let totalAddedOrRemovedFromAmount = round(parseFloat(enteredText - previousText),2);
			$.ajax({
		          type: "POST",
		          url: CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.transactionsUpdateUrl + 'transaction',
		          dataType: "json",
		          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		          data : values,
		          success: function(userTransaction){
		        	  // Set the amount to empty as the data need not be stored.
		        	  amountEditedTransaction = '';
		        	  let categoryRowElement = document.getElementById('categoryTableRow-' + userTransaction.categoryId);
		        	  updateCategoryAmount(userTransaction.categoryId, totalAddedOrRemovedFromAmount, true);
		        	  autoCreateBudget(userTransaction.categoryId, totalAddedOrRemovedFromAmount);
		        	  handleCategoryModalToggle(userTransaction.categoryId, categoryRowElement, '');
		          },
		          error: function (thrownError) {
	              	 var responseError = JSON.parse(thrownError.responseText);
	                   	if(responseError.error.includes("Unauthorized")){
	                   		er.sessionExpiredSwal(thrownError);
	                   	} else{
	                   		showNotification('Unable to change the transacition amount','top','center','danger');
	                   	}
	               }
		        });
		}
		
		// replace the text with a trimmed version
		appendCurrencyToAmount(element, enteredText);
		
		// Prevent repeated enter button press from calling the server
  	  	amountEditedTransaction = enteredText;
	}
	
	// Automatically create a budget for the category if it is an income category
	function autoCreateBudget(categoryId, totalAddedOrRemovedFromAmount) {
		if(categoryMap[categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.incomeCategory) {
			if(isEmpty(updateBudgetMap[categoryId])) {
				updateBudgetMap[categoryId] = totalAddedOrRemovedFromAmount;
			} else {
				let oldValue = updateBudgetMap[categoryId];
				updateBudgetMap[categoryId] = oldValue + totalAddedOrRemovedFromAmount;
			}
		}
	}
	
	// Append appropriate buttons when the amount is edited
	function appendButtonForAmountEdition(enteredText, selectTransactionId) {
		// append remove button if the transaction amount is zero
		let budgetTableCell = document.getElementById('budgetTransactionsRow-' + selectTransactionId[selectTransactionId.length - 1]);
		
		if(enteredText == 0 || isNaN(enteredText)){
		  // Handles the addition of buttons in the budget column for the row
		  budgetTableCell.innerHTML = deleteButton;
		  budgetTableCell.classList.add('fadeInAnimation');
		} else if(enteredText > 0 && budgetTableCell != null){
		  budgetTableCell.classList.add('fadeOutAnimation');
		  budgetTableCell.innerHTML = '';
		}
	}
	
	// Update the category amount
	function updateCategoryAmount(categoryId, totalAddedOrRemovedFromAmount, updateTotal){
		
		  let categoryRows = document.getElementsByClassName('amountCategoryId-' + categoryId);
		  // if the category has not been added yet
		  if(isEmpty(categoryRows)){
			 return;
		  }
		  
		  categoryRows = categoryRows[0];
		  let newCategoryTotal = 0;
	  	  let categoryTotal = categoryRows.innerText;
	  	  // Convert to number regex
	  	  let previousCategoryTotal = parseFloat(categoryTotal.replace(/[^0-9.-]+/g,""));
	  	  previousCategoryTotal = Math.abs(previousCategoryTotal);
	  	  let minusSign = '';
	  	  if(includesStr(categoryTotal,'-')){
	  		  minusSign = '-';
	  	  }
	  	  newCategoryTotal = round(previousCategoryTotal + totalAddedOrRemovedFromAmount,2);
	  	  // Format the newCategoryTotal to number and format the number as currency
	  	  replaceHTML(categoryRows , minusSign + currentCurrencyPreference + formatNumber(newCategoryTotal, currentUser.locale));
	  	  
	  	  if(updateTotal){
	  		  // Obtain the class list of the category table row
		  	  let categoryForCalculation = categoryRows.classList;
		  	  updateTotalCalculations(categoryForCalculation, totalAddedOrRemovedFromAmount);
	  	  }
	}
	
	// Updates the final amount section with the current value
	function updateTotalCalculations(categoryForCalculation , totalAddedOrRemovedFromAmount){
		
		if(categoryForCalculation.contains('spendingCategory')) {
			let currentValueExpense = round(parseFloat(trimElement(lastElement(splitElement($("#totalExpensesTransactions")[0].innerText,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
			let totalAmountLeftForExpenses = currentValueExpense+ totalAddedOrRemovedFromAmount;
			replaceHTML('totalExpensesTransactions' , '-' + currentCurrencyPreference + formatNumber(Number(totalAmountLeftForExpenses), currentUser.locale));
			
		} else if(categoryForCalculation.contains('incomeCategory')) {
			let currentValueIncome = round(parseFloat(trimElement(lastElement(splitElement($("#totalIncomeTransactions")[0].innerText,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
			let totalAmountLeftForIncome = currentValueIncome + totalAddedOrRemovedFromAmount;
			replaceHTML('totalIncomeTransactions' , currentCurrencyPreference + formatNumber(Number(totalAmountLeftForIncome), currentUser.locale));
		}
		
		// Update the total available 
		let income = er.convertToNumberFromCurrency($("#totalIncomeTransactions")[0].innerText,currentCurrencyPreference);
		let expense = er.convertToNumberFromCurrency($("#totalExpensesTransactions")[0].innerText,currentCurrencyPreference);

		let minusSign = '';
		let availableCash = income-expense;
		if (availableCash < 0){
			minusSign = '-';
			availableCash = Math.abs(availableCash);
		}
		
		replaceHTML('totalAvailableTransactions' , minusSign + currentCurrencyPreference + formatNumber(availableCash, currentUser.locale));
		
		// Update the pie chart
		let dataPreferencesChart = updatePieChartTransactions(income, expense);
		// If the chart is empty then build the chart
		if(isNotEmpty(transactionsChart)) {
			transactionsChart.update(dataPreferencesChart);
		} else {
			buildPieChart(dataPreferencesChart, 'chartFinancialPosition');
		}
	}
	
	// Append currency to amount if it exist and a '-' sign if it is a transaction
	function appendCurrencyToAmount(element, enteredText){
		// if the currency or the minus sign is removed then replace it back when the focus is lost
		let minusSign = '';
		if(includesStr(amountEditedTransaction,'-')){
			minusSign = '-';
		}
		let changeInnerTextAmount = minusSign + currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
		let replaceEnteredText = document.createElement('div');
		replaceEnteredText.className = 'text-right amountDivCentering';
		replaceEnteredText.setAttribute('contenteditable', true);
		replaceEnteredText.tabIndex = 0;
		replaceEnteredText.innerHTML = trimElement(changeInnerTextAmount).replace(/ +/g, "");
		element.innerHTML = '';
		element.appendChild(replaceEnteredText);
	}
	
	
	// Dynamically generated button click event
	$( "#transactionsTable" ).on( "click", ".removeRowTransaction" ,function() {
		// Prevents the add amount event listener focus out from being executed
		var id = lastElement(splitElement($(this).parent().closest('div').attr('id'),'-'));
		// Remove the button and append the loader with fade out
		let budgetTableCell = document.getElementById('budgetTransactionsRow-' + id);
		budgetTableCell.classList.add('fadeOutAnimation');
		
		
		// Handle delete for individual row
		jQuery.ajax({
            url: CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.financialPortfolioId + '/' + id + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate,
            type: 'DELETE',
            success: function(data) {
            	let previousCategoryId = '';
            	let classListBudget = budgetTableCell.classList;
            	// Set the previous category Id for updating the catergory modal
            	for(let i=0, length = classListBudget.length; i < length; i++) {
                	// Remove the nearest category along with the last transaction row.
            		let classItem = classListBudget[i];
            		if(includesStr(classItem, 'categoryIdForBudget')) {
            			// Remove amount from current Category
	        			previousCategoryId = lastElement(splitElement(classItem,'-'));
	        			let categoryAmount = er.convertToNumberFromCurrency($('.amountCategoryId-' + previousCategoryId)[0].innerText,currentCurrencyPreference);
	        			
	        			if(categoryAmount == 0) {
	        				$('.amountCategoryId-' + previousCategoryId).parent().closest('div').fadeOut('slow', function(){ 
	        					$(this).remove(); 
	        					// Toggle Category Modal 
	                        	toggleCategoryModal(false);
	                        	// Check all functionality if all transactions are clicked
	                        	checkAllIfAllAreChecked();
	        				});
	        			}
	        			
            		}
            	}
            	
            	// Remove the table row (No need to update category amount or total values as the value of the TR is already 0 )
            	let closestTr = $('#budgetTransactionsRow-' + id).parent().closest('div');
            	let closestTrLength = closestTr.length;
            	
            	closestTr.fadeOut('slow', function(){
            		$(this).remove(); 
            		
            		// Execute these transactions only once after all elements have faded out
            		if(!--closestTrLength) {
            			// Disable delete Transactions button on refreshing the transactions
                     	manageDeleteTransactionsButton();
                     	// Updates total transactions in category Modal if open with this category
        	        	updateTotalTransactionsInCategoryModal(previousCategoryId);
        	        	// Display Table Empty Div if all the table rows are deleted
        	        	let tableBodyDiv = document.getElementById(replaceTransactionsId);
                    	if(tableBodyDiv.childElementCount === 0) {
                    		tableBodyDiv.appendChild(fetchEmptyTableMessage());
                    		// uncheck the select all checkbox if checked
                			let checkAllBox = document.getElementById('checkAll');
                			$('#checkAll').prop('checked',false);
                			checkAllBox.setAttribute('disabled', 'disabled');
                    	}
            		}
            	});
            },
            error: function (thrownError) {
           	 let responseError = JSON.parse(thrownError.responseText);
                	if(responseError.error.includes("Unauthorized")){
                		er.sessionExpiredSwal(thrownError);
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
	
	// Build empty table message as document
	function fetchEmptyTableMessage() {
		let emptyTableRow = document.createElement("div");
		emptyTableRow.className = 'd-lg-table-row';
		
		// Row 1
		let indexTableCell = document.createElement('div');
		indexTableCell.className = 'd-lg-table-cell';
		emptyTableRow.appendChild(indexTableCell);
		
		// Row 2
		let selectAllTableCell = document.createElement('div');
		selectAllTableCell.className = 'd-lg-table-cell';
		emptyTableRow.appendChild(selectAllTableCell);
		
		// Row 3
		let categoryTableCell = document.createElement('div');
		categoryTableCell.className = 'd-lg-table-cell text-center align-middle';
		categoryTableCell.appendChild(buildEmptyTransactionsSvg());
		emptyTableRow.appendChild(categoryTableCell);
		
		// Row 4
		let descriptionTableCell = document.createElement('div');
		descriptionTableCell.className = 'd-lg-table-cell';
		
		let paragraphElement = document.createElement('p');
		paragraphElement.className = 'text-secondary mb-0';
		paragraphElement.innerHTML = 'There are no transactions yet. Start adding some to track your spending.';
		
		descriptionTableCell.appendChild(paragraphElement);
		emptyTableRow.appendChild(descriptionTableCell);
		
		// Row 5
		let amountTableCell = document.createElement('div');
		amountTableCell.className = 'd-lg-table-cell';
		emptyTableRow.appendChild(amountTableCell);
		
		// Row 6
		let budgetTableCell = document.createElement('div');
		budgetTableCell.className = 'd-lg-table-cell';
		emptyTableRow.appendChild(budgetTableCell);
		
		return emptyTableRow;
	}
	
	// Empty Transactions SVG
	function buildEmptyTransactionsSvg() {
		
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('width','64');
		svgElement.setAttribute('height','64');
    	svgElement.setAttribute('viewBox','0 0 64 64');
    	svgElement.setAttribute('class','transactions-empty-svg');
    	
    	let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement1.setAttribute('d','M 5 8 C 3.346 8 2 9.346 2 11 L 2 53 C 2 54.654 3.346 56 5 56 L 59 56 C 60.654 56 62 54.654 62 53 L 62 11 C 62 9.346 60.654 8 59 8 L 5 8 z M 5 10 L 59 10 C 59.551 10 60 10.449 60 11 L 60 20 L 4 20 L 4 11 C 4 10.449 4.449 10 5 10 z M 28 12 C 26.897 12 26 12.897 26 14 L 26 16 C 26 17.103 26.897 18 28 18 L 56 18 C 57.103 18 58 17.103 58 16 L 58 14 C 58 12.897 57.103 12 56 12 L 28 12 z M 28 14 L 56 14 L 56.001953 16 L 28 16 L 28 14 z M 4 22 L 60 22 L 60 53 C 60 53.551 59.551 54 59 54 L 5 54 C 4.449 54 4 53.551 4 53 L 4 22 z'); 
    	svgElement.appendChild(pathElement1);
    	
    	let pathElement11 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement11.setAttribute('class','coloredTransactionLine');
    	pathElement11.setAttribute('d',' M 8 13 A 2 2 0 0 0 6 15 A 2 2 0 0 0 8 17 A 2 2 0 0 0 10 15 A 2 2 0 0 0 8 13 z'); 
    	svgElement.appendChild(pathElement11);
    	
    	let pathElement12 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement12.setAttribute('d',' M 14 13 A 2 2 0 0 0 12 15 A 2 2 0 0 0 14 17 A 2 2 0 0 0 16 15 A 2 2 0 0 0 14 13 z M 20 13 A 2 2 0 0 0 18 15 A 2 2 0 0 0 20 17 A 2 2 0 0 0 22 15 A 2 2 0 0 0 20 13 z '); 
    	svgElement.appendChild(pathElement12);
    	
    	let pathElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement2.setAttribute('class','coloredTransactionLine');
    	pathElement2.setAttribute('d','M 11 27.974609 C 10.448 27.974609 10 28.422609 10 28.974609 C 10 29.526609 10.448 29.974609 11 29.974609 L 15 29.974609 C 15.552 29.974609 16 29.526609 16 28.974609 C 16 28.422609 15.552 27.974609 15 27.974609 L 11 27.974609 z M 19 27.974609 C 18.448 27.974609 18 28.422609 18 28.974609 C 18 29.526609 18.448 29.974609 19 29.974609 L 33 29.974609 C 33.552 29.974609 34 29.526609 34 28.974609 C 34 28.422609 33.552 27.974609 33 27.974609 L 19 27.974609 z'); 
    	svgElement.appendChild(pathElement2);
    	
    	let pathElement21 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement21.setAttribute('d',' M 39 27.974609 C 38.448 27.974609 38 28.422609 38 28.974609 C 38 29.526609 38.448 29.974609 39 29.974609 L 41 29.974609 C 41.552 29.974609 42 29.526609 42 28.974609 C 42 28.422609 41.552 27.974609 41 27.974609 L 39 27.974609 z M 45 27.974609 C 44.448 27.974609 44 28.422609 44 28.974609 C 44 29.526609 44.448 29.974609 45 29.974609 L 47 29.974609 C 47.552 29.974609 48 29.526609 48 28.974609 C 48 28.422609 47.552 27.974609 47 27.974609 L 45 27.974609 z M 51 27.974609 C 50.448 27.974609 50 28.422609 50 28.974609 C 50 29.526609 50.448 29.974609 51 29.974609 L 53 29.974609 C 53.552 29.974609 54 29.526609 54 28.974609 C 54 28.422609 53.552 27.974609 53 27.974609 L 51 27.974609 z');
    	svgElement.appendChild(pathElement21);
    	
    	let pathElement3 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement3.setAttribute('class','coloredTransactionLine');
    	pathElement3.setAttribute('d','M 11 33.974609 C 10.448 33.974609 10 34.422609 10 34.974609 C 10 35.526609 10.448 35.974609 11 35.974609 L 15 35.974609 C 15.552 35.974609 16 35.526609 16 34.974609 C 16 34.422609 15.552 33.974609 15 33.974609 L 11 33.974609 z M 19 33.974609 C 18.448 33.974609 18 34.422609 18 34.974609 C 18 35.526609 18.448 35.974609 19 35.974609 L 33 35.974609 C 33.552 35.974609 34 35.526609 34 34.974609 C 34 34.422609 33.552 33.974609 33 33.974609 L 19 33.974609 z'); 
    	svgElement.appendChild(pathElement3);
    	
    	let pathElement31 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement31.setAttribute('d',' M 45 33.974609 C 44.448 33.974609 44 34.422609 44 34.974609 C 44 35.526609 44.448 35.974609 45 35.974609 L 47 35.974609 C 47.552 35.974609 48 35.526609 48 34.974609 C 48 34.422609 47.552 33.974609 47 33.974609 L 45 33.974609 z M 51 33.974609 C 50.448 33.974609 50 34.422609 50 34.974609 C 50 35.526609 50.448 35.974609 51 35.974609 L 53 35.974609 C 53.552 35.974609 54 35.526609 54 34.974609 C 54 34.422609 53.552 33.974609 53 33.974609 L 51 33.974609 z'); 
    	svgElement.appendChild(pathElement31);
    	
    	let pathElement4 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement4.setAttribute('class','coloredTransactionLine');
    	pathElement4.setAttribute('d','M 11 39.974609 C 10.448 39.974609 10 40.422609 10 40.974609 C 10 41.526609 10.448 41.974609 11 41.974609 L 15 41.974609 C 15.552 41.974609 16 41.526609 16 40.974609 C 16 40.422609 15.552 39.974609 15 39.974609 L 11 39.974609 z M 19 39.974609 C 18.448 39.974609 18 40.422609 18 40.974609 C 18 41.526609 18.448 41.974609 19 41.974609 L 33 41.974609 C 33.552 41.974609 34 41.526609 34 40.974609 C 34 40.422609 33.552 39.974609 33 39.974609 L 19 39.974609 z'); 
    	svgElement.appendChild(pathElement4);
    	
    	let pathElement41 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement41.setAttribute('d','M 39 39.974609 C 38.448 39.974609 38 40.422609 38 40.974609 C 38 41.526609 38.448 41.974609 39 41.974609 L 41 41.974609 C 41.552 41.974609 42 41.526609 42 40.974609 C 42 40.422609 41.552 39.974609 41 39.974609 L 39 39.974609 z M 45 39.974609 C 44.448 39.974609 44 40.422609 44 40.974609 C 44 41.526609 44.448 41.974609 45 41.974609 L 47 41.974609 C 47.552 41.974609 48 41.526609 48 40.974609 C 48 40.422609 47.552 39.974609 47 39.974609 L 45 39.974609 z M 51 39.974609 C 50.448 39.974609 50 40.422609 50 40.974609 C 50 41.526609 50.448 41.974609 51 41.974609 L 53 41.974609 C 53.552 41.974609 54 41.526609 54 40.974609 C 54 40.422609 53.552 39.974609 53 39.974609 L 51 39.974609 z ');
    	svgElement.appendChild(pathElement41);
    	
    	let pathElement5 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement5.setAttribute('d','M 7 48 C 6.448 48 6 48.448 6 49 L 6 51 C 6 51.552 6.448 52 7 52 C 7.552 52 8 51.552 8 51 L 8 49 C 8 48.448 7.552 48 7 48 z M 12 48 C 11.448 48 11 48.448 11 49 L 11 51 C 11 51.552 11.448 52 12 52 C 12.552 52 13 51.552 13 51 L 13 49 C 13 48.448 12.552 48 12 48 z M 17 48 C 16.448 48 16 48.448 16 49 L 16 51 C 16 51.552 16.448 52 17 52 C 17.552 52 18 51.552 18 51 L 18 49 C 18 48.448 17.552 48 17 48 z M 22 48 C 21.448 48 21 48.448 21 49 L 21 51 C 21 51.552 21.448 52 22 52 C 22.552 52 23 51.552 23 51 L 23 49 C 23 48.448 22.552 48 22 48 z M 27 48 C 26.448 48 26 48.448 26 49 L 26 51 C 26 51.552 26.448 52 27 52 C 27.552 52 28 51.552 28 51 L 28 49 C 28 48.448 27.552 48 27 48 z M 32 48 C 31.448 48 31 48.448 31 49 L 31 51 C 31 51.552 31.448 52 32 52 C 32.552 52 33 51.552 33 51 L 33 49 C 33 48.448 32.552 48 32 48 z M 37 48 C 36.448 48 36 48.448 36 49 L 36 51 C 36 51.552 36.448 52 37 52 C 37.552 52 38 51.552 38 51 L 38 49 C 38 48.448 37.552 48 37 48 z M 42 48 C 41.448 48 41 48.448 41 49 L 41 51 C 41 51.552 41.448 52 42 52 C 42.552 52 43 51.552 43 51 L 43 49 C 43 48.448 42.552 48 42 48 z M 47 48 C 46.448 48 46 48.448 46 49 L 46 51 C 46 51.552 46.448 52 47 52 C 47.552 52 48 51.552 48 51 L 48 49 C 48 48.448 47.552 48 47 48 z M 52 48 C 51.448 48 51 48.448 51 49 L 51 51 C 51 51.552 51.448 52 52 52 C 52.552 52 53 51.552 53 51 L 53 49 C 53 48.448 52.552 48 52 48 z M 57 48 C 56.448 48 56 48.448 56 49 L 56 51 C 56 51.552 56.448 52 57 52 C 57.552 52 58 51.552 58 51 L 58 49 C 58 48.448 57.552 48 57 48 z'); 
    	svgElement.appendChild(pathElement5);

    	return svgElement;
    	
	}
	
	// Introduce Chartist pie chart
	function buildPieChart(dataPreferences, id) {
		 /*  **************** Public Preferences - Pie Chart ******************** */

        var optionsPreferences = {
		  donut: true,
		  donutWidth: 50,
		  donutSolid: true,
		  startAngle: 270,
		  showLabel: true,
		  height: '230px'
        };
        
        // Reset the chart
        if(isNotEmpty(transactionsChart)) {
        	transactionsChart.detach();
        }
        replaceHTML(id, '');
        
        if(isNotEmpty(dataPreferences)) {
        	transactionsChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences);
        	let chartLegend = document.getElementById('chartLegend');
        	let incomeAmount = document.getElementById('totalIncomeTransactions');
        	let expenseAmount = document.getElementById('totalExpensesTransactions');
        	let totalAvailable = document.getElementById('totalAvailableTransactions');
        	
        	transactionsChart.on('created', function(donut) {
        		  $('.ct-slice-donut-solid').on('mouseover mouseout', function() {
        			  chartLegend.classList.toggle('hiddenAfterHalfASec');
        			  chartLegend.classList.toggle('visibleAfterHalfASec');
        		  });
        		  
        		  $('.ct-series-a').on('mouseover mouseout', function() {
        			  incomeAmount.classList.toggle('transitionTextToNormal');
        			  incomeAmount.classList.toggle('transitionTextTo120');
        		  });
        		  
        		  $('.ct-series-b').on('mouseover mouseout', function() {
        			  expenseAmount.classList.toggle('transitionTextToNormal');
        			  expenseAmount.classList.toggle('transitionTextTo120');
        		  });
        		  
        		  $('.ct-series-c').on('mouseover mouseout', function() {
        			  totalAvailable.classList.toggle('transitionTextToNormal');
        			  totalAvailable.classList.toggle('transitionTextTo120');
        		  });
        			  
        		});
        }
        
	}
	
    // Generate SVG Tick Element and success element
    function successSvgMessage() {
    	let alignmentDiv = document.createElement('div');
    	alignmentDiv.className = 'row justify-content-center';
    	
    	// Parent Div Svg container
    	let divSvgContainer = document.createElement('div');
    	divSvgContainer.className = 'svg-container';
    	
    	
    	// SVG element
    	let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    	svgElement.setAttribute('class','ft-green-tick');
    	svgElement.setAttribute('height','20');
    	svgElement.setAttribute('width','20');
    	svgElement.setAttribute('viewBox','0 0 48 48');
    	svgElement.setAttribute('aria-hidden',true);
    	
    	let circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    	circleElement.setAttribute('class','circle');
    	circleElement.setAttribute('fill','#5bb543');
    	circleElement.setAttribute('cx','24');
    	circleElement.setAttribute('cy','24');
    	circleElement.setAttribute('r','22');
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('class','tick');
    	pathElement.setAttribute('fill','none');
    	pathElement.setAttribute('stroke','#FFF');
    	pathElement.setAttribute('stroke-width','6');
    	pathElement.setAttribute('stroke-linecap','round');
    	pathElement.setAttribute('stroke-linejoin','round');
    	pathElement.setAttribute('stroke-miterlimit','10');
    	pathElement.setAttribute('d','M14 27l5.917 4.917L34 17');
    	
    	svgElement.appendChild(circleElement);
    	svgElement.appendChild(pathElement);
    	divSvgContainer.appendChild(svgElement);
    	
    	let messageParagraphElement = document.createElement('p');
    	messageParagraphElement.className = 'green-icon margin-bottom-zero margin-left-five';
    	messageParagraphElement.innerHTML = 'Successfully added the transaction.';
    	
    	var br = document.createElement('br');
    	
    	alignmentDiv.appendChild(divSvgContainer);
    	alignmentDiv.appendChild(messageParagraphElement);
    	alignmentDiv.appendChild(br);
    	
    	
    	return alignmentDiv;
    }
    
    // Add button to add the table row to the corresponding category
	$( "#transactionsTable" ).on( "click", ".addTableRowListener" ,function(event) {
		 // Add small Material Spinner
		 let spinnerDocumentFragment = document.createDocumentFragment();
		 let divMaterialSpinner = document.createElement('div');
		 divMaterialSpinner.classList = 'material-spinner-small d-lg-inline-block';
		 spinnerDocumentFragment.appendChild(divMaterialSpinner);
		 this.classList.remove('d-lg-inline');
		 this.classList.add('d-none');
		 this.parentNode.appendChild(spinnerDocumentFragment);
		 let currentElement = this;
		 
		 event.preventDefault();
		 // stop the event from bubbling.
		 event.stopPropagation();
		 event.stopImmediatePropagation();
		 let id = lastElement(splitElement(this.id,'-'));
		 let values = {};
		 values['amount'] = 0.00;
		 values['description'] = '';
		 values['categoryOptions'] = id;
		 values['dateMeantFor'] = chosenDate;
		 $.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.saveTransactionsUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8", 
	          data : values,
	          success: function(userTransaction){
	        	  let categoryParent = document.getElementById('categoryTableRow-' + userTransaction.categoryId);
	        	  let closestSibling = categoryParent.nextSibling;
	        	  let lastClassName =  lastElement(splitElement(closestSibling.className, ' '));
	        	  
	        	  // Toggle dropdown if the rows are hidden
        		  if(includesStr(lastClassName , 'd-none')) {
        			  toggleDropdown(id, categoryParent);
        		  }
        		  
        		  // Add the new row to the category
	        	  categoryParent.parentNode.insertBefore(createTableRows(userTransaction,'d-lg-table-row', userTransaction.categoryId), closestSibling);
	        	  
	        	  // Remove material spinner and remove d none
	        	  currentElement.parentNode.removeChild(currentElement.parentNode.lastChild);
	        	  currentElement.classList.add('d-lg-inline');
	        	  currentElement.classList.remove('d-none');
	        	  
	        	  // Updates total transactions in category Modal
	        	  updateTotalTransactionsInCategoryModal(userTransaction.categoryId);
	          },
	          error:  function (thrownError) {
             	 var responseError = JSON.parse(thrownError.responseText);
                  	if(responseError.error.includes("Unauthorized")){
                  		er.sessionExpiredSwal(thrownError);
                  	} else{
                  		showNotification('Unable to add a new transaction','top','center','danger');
                  	}
              }
		 });
	});
	
	// Builds the drag handle for transaction rows
	function fetchDragHandle() {
		
		// Build SVG Drag Handle for table rows
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    	svgElement.setAttribute('class','drag-handle');
    	svgElement.setAttribute('height','20');
    	svgElement.setAttribute('width','9');
    	svgElement.setAttribute('viewBox','0 0 9 20');
    	svgElement.setAttribute('focusable',false);
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('fill','#B6BEC2');
    	pathElement.setAttribute('d','M1.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0-6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5-12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z');
    	
    	svgElement.appendChild(pathElement);
    	
    	return svgElement;
	}
	
	// Before navigating away from page update the budget (Synchronous to avoid loss of transfer to server)
	window.onbeforeunload = function() {
		if(!window.isRefresh) {
			er.updateBudget(false);
		}
		window.isRefresh = false;
	}
	
	// Do not update the budget if the value is old (Safari)
	window.onpageshow = function(event) {
	    if (event.persisted) {
	        window.isRefresh = true;
	    }
	}
	
	// Recalculate category amount and append them to the table While updating auto generated user budget 
	function recalculateCategoryTotalAmount() {
    	
		// Load all user transaction from API
		jQuery.ajax({
			url: CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.transactionFetchCategoryTotal + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate + CUSTOM_DASHBOARD_CONSTANTS.updateBudgetTrueParam,
            type: 'GET',
            async: true,
            success: function(categoryTotalMap) {
            	// Category open in Modal
            	let categoryIdOpenInModal = document.getElementById('categoryIdCachedForUserBudget').innerText;
            	// Get all the category id's
        		let categoryTotalKeys = Object.keys(categoryTotalMap);
            	let categoryDivs = document.querySelectorAll('*[id^="categoryTableRow"]');
            	
            	// Find the categories that are visible to the user but are not present in the database
            	for(let count = 0, lengthArray = categoryDivs.length; count < lengthArray; count++){
            		let categoryDiv = categoryDivs[count];
            		let categoryId = lastElement(splitElement(categoryDiv.id,'-'));
            		// Check if the elements are present inside the keys
            		if(!includesStr(categoryTotalKeys, categoryId)) {
            			// Mark those elements to be deleted
            			$(categoryDiv).fadeOut('slow', function(){
            				categoryDiv.remove();
            				
            				// Toggle Category Modal 
                        	toggleCategoryModal(false);
                        	
                    		// Delete category ids which are autogenerated
                    		er.deleteAutoGeneratedUserBudgets(categoryId);
            			});
            		} else {
                   	    let value = categoryTotalMap[categoryId];
                   	    let categoryAmountDiv = document.getElementById('amountCategory-'+categoryId);
                	    categoryAmountDiv.innerHTML = currentCurrencyPreference + formatNumber(value, currentUser.locale);
                	    
                	   // Check if the modal is open
                   	   if(categoryIdOpenInModal == categoryId) {
                     		// Handle category Modal
                         	let categoryRowElement = document.getElementById('categoryTableRow-' + categoryId);
                         	// Fetch all the categories child transactions
                         	let hideableRowElement = document.getElementsByClassName('hideableRow-' + categoryId);
                         	// Edit Category Modal
                         	handleCategoryModalToggle(categoryId, categoryRowElement, hideableRowElement.length);
                   	   }
            		}
            	}

            }
		});
	}
	
	/**
	 * Logic for Category Modal
	 * 
	 */
	
	// Toggle Category modal upon click of a category
	function handleCategoryModalToggle(categoryId, closestTrElement, totalTransactions) {
		
		let categoryModal = document.getElementsByClassName('category-modal');
		// If the category modal is closed then do not calculate and return
		if(categoryModal[0].classList.contains('d-none')) {
			return;
		}
		
		// Populate the category label with the one selected
		let categoryNameDiv = document.getElementById('categoryLabelInModal');
		categoryNameDiv.innerText = categoryMap[categoryId].categoryName;
		
		// Set the number of transactions if present
		if(isNotEmpty(totalTransactions)) {
			let numberOfTransactionsDiv = document.getElementById('numberOfTransactions');
			numberOfTransactionsDiv.innerText = totalTransactions;
		}
		
		// Update the budget amount to the category Modal if present
		let plannedAmountModal = document.getElementById('plannedAmountCategoryModal');
		let categoryTotalDiv = document.getElementById('amountCategory-' + categoryId);
		let percentageAvailable = document.getElementById('percentageAvailable');
		let remainingAmountDiv = document.getElementById('remainingAmount');
		let categoryIdForUserBudget = document.getElementById('categoryIdCachedForUserBudget');
		let budgetPercentageLabel = document.getElementById('budgetInfoLabelInModal');
		let progressBarCategoryModal = document.getElementById('amountSpentAgainstBudget');
		let categoryRowClassList = closestTrElement.classList;
		categoryIdForUserBudget.innerText = categoryId;
		
		let budgetElementText = closestTrElement.lastChild.innerText;
		
		if(isNotEmpty(budgetElementText)) {
			plannedAmountModal.innerText = budgetElementText;
			
			// Calculate percentage of budget available to spend or save
			let categoryAmount = er.convertToNumberFromCurrency(categoryTotalDiv.innerText,currentCurrencyPreference);
			let budgetAmount = er.convertToNumberFromCurrency(budgetElementText,currentCurrencyPreference);
			
			// Calculate remaining budget
			let budgetAvailableToSpendOrSave = budgetAmount - categoryAmount;
			let minusSign = '';
			
			// Change the div if and only if the class is not already present in the div
			let remainingAmountToggleClass = !remainingAmountDiv.classList.contains('mild-text-success');
			
			// Calculate the minus sign and appropriate class for the remaining amount 
			if(budgetAvailableToSpendOrSave < 0) {
				// if the transaction category is expense category then show overspent else show To be budgeted
				if(categoryRowClassList.contains('expenseCategory')) {
					remainingAmountToggleClass = !remainingAmountDiv.classList.contains('mild-text-danger');
					budgetPercentageLabel.innerText = 'Overspent (%)';
				} else if(categoryRowClassList.contains('incomeCategory')) {
					budgetPercentageLabel.innerText = 'To Be Budgeted (%)';
				}
				
				minusSign = '-';
				budgetAvailableToSpendOrSave = Math.abs(budgetAvailableToSpendOrSave);
				
			} else {
				budgetPercentageLabel.innerText = 'Remaining (%)';
			}
			
			// Change color if the amount is negative or positive
			if(remainingAmountToggleClass) {
				remainingAmountDiv.classList.toggle('mild-text-success');
				remainingAmountDiv.classList.toggle('mild-text-danger');
				progressBarCategoryModal.classList.toggle('progress-bar-success-striped');
				progressBarCategoryModal.classList.toggle('progress-bar-danger-striped');
			}
			
			// Change the remaining text appropriately
			remainingAmountDiv.innerText = minusSign + currentCurrencyPreference + formatNumber(budgetAvailableToSpendOrSave, currentUser.locale);

			// Calculate percentage available to spend or save
			let percentageRemaining = round(((budgetAvailableToSpendOrSave / budgetAmount) * 100),0);
			// Assign progress bar value. If the category amount is higher then the progress is 100%
			let progressBarPercentage = isNaN(percentageRemaining) ? 0 : (categoryAmount > budgetAmount) ? 100 : (100 - percentageRemaining);
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', progressBarPercentage);
			progressBarCategoryModal.style.width = progressBarPercentage + '%'; 
			
			percentageRemaining = isNaN(percentageRemaining) ? 'NA' : percentageRemaining + '%';
			percentageAvailable.innerText = percentageRemaining;
		} else {
			budgetPercentageLabel.innerText = 'Remaining (%)'
			plannedAmountModal.innerText = currentCurrencyPreference + '0.00';
			percentageAvailable.innerText = 'NA'
			remainingAmountDiv.innerText = currentCurrencyPreference + '0.00';
			progressBarCategoryModal.setAttribute('aria-valuenow', 0);
			progressBarCategoryModal.style.width = '0%'; 
			
			// Change the remaining amount to green if it is red in color
			if(!remainingAmountDiv.classList.contains('mild-text-success')){
				remainingAmountDiv.classList.toggle('mild-text-success');
				remainingAmountDiv.classList.toggle('mild-text-danger');
				progressBarCategoryModal.classList.toggle('progress-bar-success-striped');
				progressBarCategoryModal.classList.toggle('progress-bar-danger-striped');
			}
			
		}
	}
	
	// Toggles the category modal
	function toggleCategoryModal(keepCategoryModalOpened) {
		let financialPositionDiv = document.getElementsByClassName('transactions-chart');
		let categoryModalDiv = document.getElementsByClassName('category-modal');
		
		if(keepCategoryModalOpened) {
			// Hide the financial position div and show the category modal
			categoryModalDiv[0].classList.remove('d-none');
			financialPositionDiv[0].classList.add('d-none');
		} else {
			// Find all the category rows that are expanded
			let categoryRowsDiv = document.getElementsByClassName('dropdown-toggle');
			
			if(categoryRowsDiv.length == 0) {
				// show the financial position div and hide the category modal
				categoryModalDiv[0].classList.add('d-none');
				financialPositionDiv[0].classList.remove('d-none');
			} else {
				// If there are other drop down categories open then show the first one from the list
				let categoryRowToShowInModal = categoryRowsDiv[0].parentNode;
				let categoryId = lastElement(splitElement(categoryRowToShowInModal.id,'-'));
				// Fetch all the categories child transactions
				let hideableRowElement = document.getElementsByClassName('hideableRow-' + categoryId);
				handleCategoryModalToggle(categoryId, categoryRowToShowInModal, hideableRowElement.length);
			}
			
		}
		
	}
	
	// Close Category Modal
	function closeCategoryModal() {
		let financialPositionDiv = document.getElementsByClassName('transactions-chart');
		let categoryModalDiv = document.getElementsByClassName('category-modal');
		// show the financial position div and hide the category modal
		categoryModalDiv[0].classList.add('d-none');
		financialPositionDiv[0].classList.remove('d-none');
	}
	
	// Close Button functionality for category Modal
	document.getElementById("categoryHeaderClose").addEventListener("click",function(e){
		closeCategoryModal();
	},false);
	
	const plannedAmountCategoryModal = document.getElementById('plannedAmountCategoryModal');
	plannedAmountCategoryModal.addEventListener("focusin",function(){
		userUpdateBudgetCached = trimElement(this.innerText);
	},false);
	
	plannedAmountCategoryModal.addEventListener("focusout",function(){
		userUpdatedBudget(this);
	},false);
	
	// Budget Amount - disable enter key and submit request
	plannedAmountCategoryModal.addEventListener('keyup', function(e) {
		  var keyCode = e.keyCode || e.which;
		  if (keyCode === 13) { 
		    e.preventDefault();

		    $(this).blur(); 
		    return false;
		  }
	},false);
	
	// Double Click Budget Event
	plannedAmountCategoryModal.addEventListener("dblclick", function() {
		
		
	},false);
	
	// User updates the budget
	function userUpdatedBudget(element) {
		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = er.convertToNumberFromCurrency(element.innerText,currentCurrencyPreference);
		let previousText = er.convertToNumberFromCurrency(userUpdateBudgetCached,currentCurrencyPreference);
		
		// Test if the entered value is valid
		if(isNaN(enteredText) || !regexForFloat.test(enteredText) || enteredText == 0) {
			// Replace the entered text with 0 inorder for the code to progress.
			enteredText = 0;
		} else if(enteredText < 0){
			// Replace negative sign to positive sign if entered by the user
			enteredText = parseFloat(Math.abs(enteredText),2);
		}
		
		// Test if the previous value is valid
		if(isNaN(previousText) || !regexForFloat.test(previousText) || previousText == 0) {
			previousText = 0;
		}
		
		let categoryIdForUserBudget = document.getElementById('categoryIdCachedForUserBudget');
		// Test if the entered value is the same as the previous one
		if(previousText != enteredText){
			
			let categoryIdForBudget = Number(categoryIdForUserBudget.innerText);
			// Security check to ensure that the category is present in the map
			if(er.checkIfInvalidCategory(categoryIdForBudget)) {
				return;
			}
			
			var values = {};
			values['planned'] = enteredText;
			values['category_id'] = categoryIdForBudget;
			values['autoGenerated'] = 'false';
			values['dateMeantFor'] = chosenDate;
			$.ajax({
		          type: "POST",
		          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.budgetSaveUrl + currentUser.financialPortfolioId,
		          dataType: "json",
		          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		          data : values,
		          success: function(userBudget){
		        	  let categoryRowElement = document.getElementById('categoryTableRow-' + userBudget.categoryId);
		        	  // Update the budget amount in the category row
		        	  let formattedBudgetAmount = currentCurrencyPreference + formatNumber(userBudget.planned , currentUser.locale);
		        	  categoryRowElement.lastChild.innerText = formattedBudgetAmount;
		        	  handleCategoryModalToggle(userBudget.categoryId, categoryRowElement, '');
		          },
		          error: function (thrownError) {
	              	 var responseError = JSON.parse(thrownError.responseText);
	                   	if(responseError.error.includes("Unauthorized")){
	                   		er.sessionExpiredSwal(thrownError);
	                   	} else{
	                   		showNotification('Unable to change the budget. Please try again','top','center','danger');
	                   		// update the current element with the previous amount
	                   		let formattedBudgetAmount = currentCurrencyPreference + formatNumber(previousText , currentUser.locale);
	                   		element.innerText = formattedBudgetAmount;
	                   	}
	               }
		        });
		}
		
	}
	
	// Updates the category modal if the modal is open for the category udates
	function updateTotalTransactionsInCategoryModal(categoryIdToUpdate) {
		  // Is the category modal open with the category added?
		  let categoryIdInModal = document.getElementById('categoryIdCachedForUserBudget');

		  if(Number(categoryIdToUpdate) == Number(categoryIdInModal.innerText)) {
			  // If Category Modal is open then update the transaction amount 
			  let categoryModalElement = document.getElementsByClassName('category-modal');
			  if(!categoryModalElement[0].classList.contains('d-none')) {
				  // Get the number of hide able rows under the category for Category Modal
	      	  let hideableRowElement = document.getElementsByClassName('hideableRow-' + categoryIdToUpdate);
	      	  // Update the number of transactions
	      	  let numberOfTransactionsElement = document.getElementById('numberOfTransactions');
	      	  numberOfTransactionsElement.innerText = hideableRowElement.length;
			  }
		  }
	}
	
	// Load Images dynamically after javascript loads
	function loadCategoryModalImages() {
		
		let budgetImageDiv = document.getElementById('budgetImage');
		budgetImageDiv.src = '../img/dashboard/transactions/icons8-restaurant-40.png';
		
	}
	
});

//# sourceURL=transaction.js

