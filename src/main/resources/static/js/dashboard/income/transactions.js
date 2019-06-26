	
$(document).ready(function(){
	
	// Description Text
	let descriptionTextEdited = '';
	// Amount Text
	let amountEditedTransaction = '';
	
	const replaceTransactionsId = "productsJson";
	// Used to refresh the transactions only if new ones are added
	let resiteredNewTransaction = false;
	// Divs for error message while adding transactions
	let errorAddingTransactionDiv = '<div class="row ml-auto mr-auto"><i class="material-icons red-icon">highlight_off</i><p class="margin-bottom-zero red-icon margin-left-five">';
	// Bills & Fees Options selection
	const selectedOption = '4';
	// Currency Preference
	const currentCurrencyPreference = document.getElementById('currentCurrencySymbol').innerText;
	// Regex to check if the entered value is a float
	const regexForFloat = /^[+-]?\d+(\.\d+)?$/;
	// Delete Transaction Button Inside TD
	const deleteButton = '<button class="btn btn-danger btn-sm removeRowTransaction">Remove</button>';
	// New Pie Chart Storage Variable
	let transactionsChart = '';
	// Fetch Drag Handle for transactions row table
	let dragHandle = fetchDragHandle();
		
	// Call the transaction API to fetch information.
	fetchJSONForTransactions();
	
	// Load Expense category and income category
	expenseSelectionOptGroup = cloneElementAndAppend(document.getElementById('expenseSelection'), expenseSelectionOptGroup);
	incomeSelectionOptGroup = cloneElementAndAppend(document.getElementById('incomeSelection'), incomeSelectionOptGroup);
	
	// Success SVG Fragment
	let successSVGFormed = successSvgMessage();
	
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
	   replaceHTML('errorMessage',"");
	   let formValidation = true;
	   
	   let amount = document.getElementById('amount').value;
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
		   transactionSubmissionButton.removeAttribute("disabled");
		   return;
	   }
	   
	    
	    amount = Math.abs(amount);
	    let description = document.getElementById('description').value;
	    let categoryOptions = document.getElementById('categoryOptions').value;
		let values = {};
		values['amount'] = amount;
		values['description'] = description;
		values['categoryOptions'] = categoryOptions;
		values['dateMeantFor'] = chosenDate;
		$.ajax({
	          type: "POST",
	          url: saveTransactionsUrl + currentUser.financialPortfolioId,
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
	  		    	sessionExpiredSwal(data);
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
			url: transactionAPIUrl + currentUser.financialPortfolioId + dateMeantFor + chosenDate,
            type: 'GET',
            success: function(result) {
    			let totalExpensesTransactions = 0.00;
    			let totalIncomeTransactions = 0.00;
    			let transactionsTableDiv = document.createDocumentFragment();
    			let documentTbody = document.getElementById(replaceTransactionsId);
    			// uncheck the select all checkbox if checked
    			$("#checkAll").prop("checked", false); 
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
     			   if(categoryMap[key].parentCategory == expenseCategory) {
     				   totalExpensesTransactions += totalCategoryAmount;
     			   } else if (categoryMap[key].parentCategory == incomeCategory) {
     				   totalIncomeTransactions += totalCategoryAmount;
     			   }
             	}
    		   
    		   // Update table with empty message if the transactions are empty
    		   if(result.length == 0) {
    			   documentTbody.innerHTML = '';
    			   document.getElementById(replaceTransactionsId).appendChild(fetchEmptyTableMessage());
    		   } else {
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
	
	// Update the budget for all the category rows if present
	function updateBudgetForIncome() {
		jQuery.ajax({
			url: budgetAPIUrl + currentUser.financialPortfolioId + dateMeantFor + chosenDate,
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
			let totalDeficitAsPercentageOfExpense = round((totalDeficitDifference / totalExpensesTransactions) * 100,1);
			   
			let totalIncomeAsPercentageOfExpense = round(((totalExpensesTransactions - totalDeficitDifference) / totalExpensesTransactions) * 100,1);
			   
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
			let totalAvailableAsPercentageOfIncome = round((totalAvailable / totalIncomeTransactions) * 100,1);
			   
			let totalExpenseAsPercentageOfIncome = round(((totalIncomeTransactions - totalAvailable) / totalIncomeTransactions) * 100,1);
			   
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
		
		// Row 1
		let indexTableCell = document.createElement('div');
		indexTableCell.className = 'text-center d-lg-table-cell draggable-handle-wrapper';
		indexTableCell.tabIndex = -1;
		indexTableCell.innerHTML = '';
		indexTableCell.draggable = true;
		
		// obtains the drag handle and clones them into index cell
		dragHandle = cloneElementAndAppend(indexTableCell, dragHandle);
    		tableRows.appendChild(indexTableCell);
    	
		// Table Row 2
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
		
		// Table Row 3
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
		tableRows.appendChild(selectCategoryRow);
		
		// Table Row 4
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
		
		// Table Row 5
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
	   if(categoryMap[categoryId].parentCategory == expenseCategory) {
		   amountDiv.innerHTML = '-' + $('#currentCurrencySymbol').text() + formatNumber(userTransactionData.amount, currentUser.locale);
	   } else {
		   amountDiv.innerHTML = $('#currentCurrencySymbol').text() + formatNumber(userTransactionData.amount, currentUser.locale);
	   }
		
	   amountTransactionsRow.appendChild(amountDiv);
	   tableRows.appendChild(amountTransactionsRow);
	   
	   // Table Row 6
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
		if(categoryMap[categoryId].parentCategory == expenseCategory) {
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
		
		if(categoryMap[categoryId].parentCategory == expenseCategory) {
			amountTransactionsRow.className = 'text-right category-text-danger font-weight-bold d-lg-table-cell amountCategoryId-' + categoryId + ' spendingCategory';
		} else {
			amountTransactionsRow.className = 'text-right category-text-success font-weight-bold d-lg-table-cell amountCategoryId-' + categoryId + ' incomeCategory';
		}
		
		// Append a - sign for the category if it is an expense
	   if(categoryMap[categoryId].parentCategory == expenseCategory) {
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
	   
		//	   <div class="BudgetGroupHeader-column BudgetGroupHeader-column--actions" style="display: block;top: auto;cursor: pointer;height: 100%;text-align: right;vertical-align: middle;"><span class="budget-card-header-action ui-content--sm--r BudgetGroupHeader-deleteGroup" style="color: #8e999e;text-align: center;vertical-align: middle;align-content: center;">
		//	   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 18" style="vertical-align: top;align-self: center !important;margin: auto;/*! display: block; */vertical-align: middle;">
		//	   <path fill="none" stroke="currentColor" stroke-linecap="square" stroke-width="1.25" d="M4.273 3.727V2a1 1 0 0 1 1-1h3.454a1 1 0 0 1 1 1v1.727M13 5.91v10.455a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5.909m6 2.727v5.455M4.273 8.636v5.455m5.454-5.455v5.455M13 3.727H1" style="margin: auto;display: block;vertical-align: middle;">
		//	   </path></svg> Delete Group</span></div>
		
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
		let allCheckedTransactions = $(".number:checked");
		let allTransactions = $(".number");
		if(allCheckedTransactions.length == allTransactions.length) {
			$("#checkAll").prop('checked', true);
		}
		manageDeleteTransactionsButton();
		
		// Change color of the background when the check box is checked
		$(this).parent().closest('div').parent().closest('div').parent().closest('div').toggleClass('background-snow', 300);
	});
	
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
			                         url: transactionAPIUrl + currentUser.financialPortfolioId + '/' + transactionIds + dateMeantFor + chosenDate,
			                         type: 'DELETE',
			                         contentType: "application/json; charset=utf-8", 
			                         success: function() {
			                        	showNotification('Successfully deleted the selected transactions','top','center','success');
			                        	
			                        	let checkAllClicked = $("#checkAll:checked").length > 0;
			                        	
			                        	// If Check All is clicked them empty div and reset pie chart
			                        	if(checkAllClicked){
			                        		// uncheck the select all checkbox if checked
				                			$("#checkAll").prop("checked", false); 
			                        		let documentTbody = document.getElementById(replaceTransactionsId);
			                        		documentTbody.innerHTML = '';
			                 			   	document.getElementById(replaceTransactionsId).appendChild(fetchEmptyTableMessage());
			                 			   	// update the Total Available Section with 0
			                 	    		updateTotalAvailableSection(0 , 0);
			                 	    		// Disable delete Transactions button on refreshing the transactions
				                         	manageDeleteTransactionsButton();
				                         	// Delete The auto generated user budget
				                         	er.deleteAllUserBudget();
			                        	} else {
			                        		// Choose the closest parent Div for the checked elements
				                        	let elementsToDelete = $('.number:checked').parent().closest('div').parent().closest('div').parent().closest('div');
			                        		// Remove all the elements
				                        	elementsToDelete.fadeOut('slow', function(){ 
				                        		$(this).remove(); 
				                        		// Disable delete Transactions button on refreshing the transactions
					                         	manageDeleteTransactionsButton();
				                        	});
				                        	// To recalculate the category total amount and to reduce user budget for the category appropriately
				                        	recalculateCategoryTotalAmount();
			                        	}
			                         },
			                        error:  function (thrownError) {
			                        	 var responseError = JSON.parse(thrownError.responseText);
				                         	if(responseError.error.includes("Unauthorized")){
				                         		sessionExpiredSwal(thrownError);
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
		let categoryId = lastElement(splitElement($(this).attr('id'),'-'));
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
	  	let categoryModalDiv = document.getElementsByClassName('category-modal');
	  	
	  	// Call method only when the category div is expanding and if the category modal is already open by other categories
	  	if(dropdownArrowDiv.contains('dropdown-toggle')) {
	  		// Show the category modal on click category row
		  	handleCategoryModalToggle(categoryId, closestTrElement, childCategories.length);
	  	} else {
	  		// If the category modal is active then hide it
	  		toggleCategoryModal(false);
	  	}
	}
	
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
		let categoryId = $(this).attr('id');
		let selectedTransactionId = splitElement(categoryId,'-');
		let classList = $('#' + categoryId).length > 0 ? $('#' + categoryId)[0].classList : null;
		
		if(!isEmpty(classList)) {
			let values = {};
			values['categoryId'] = $(this).val();
			values['transactionId'] = selectedTransactionId[selectedTransactionId.length - 1];
			values['dateMeantFor'] = chosenDate;
			$.ajax({
		          type: "POST",
		          url: transactionAPIUrl + currentUser.financialPortfolioId + transactionsUpdateUrl + 'category',
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
	                   		sessionExpiredSwal(thrownError);
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
	
	// Description - disable enter key and submit request
	$('#transactionsTable').on('keyup', '.transactionsTableDescription' , function(e) {
		  var keyCode = e.keyCode || e.which;
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
	          url: transactionAPIUrl + currentUser.financialPortfolioId + transactionsUpdateUrl + 'description',
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8", 
	          data : values,
	          error: function (thrownError) {
            	 var responseError = JSON.parse(thrownError.responseText);
                 	if(responseError.error.includes("Unauthorized")){
                 		sessionExpiredSwal(thrownError);
                 	} else{
                 		showNotification('Unable to change the description','top','center','danger');
                 	}
             }
	        });
		
		// Set the description to empty as the data need not be stored.
		descriptionTextEdited = '';
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
	
	// Amount - disable enter key and submit request
	$('#transactionsTable').on('keyup', '.amountTransactionsRow' , function(e) {
		  var keyCode = e.keyCode || e.which;
		  if (keyCode === 13) { 
		    e.preventDefault();

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
		          url: transactionAPIUrl + currentUser.financialPortfolioId + transactionsUpdateUrl + 'transaction',
		          dataType: "json",
		          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		          data : values,
		          success: function(userTransaction){
		        	  updateCategoryAmount(userTransaction.categoryId, totalAddedOrRemovedFromAmount, true);
		        	  autoCreateBudget(userTransaction.categoryId, totalAddedOrRemovedFromAmount);
		          },
		          error: function (thrownError) {
	              	 var responseError = JSON.parse(thrownError.responseText);
	                   	if(responseError.error.includes("Unauthorized")){
	                   		sessionExpiredSwal(thrownError);
	                   	} else{
	                   		showNotification('Unable to change the transacition amount','top','center','danger');
	                   	}
	               }
		        });
		}
		
		// replace the text with a trimmed version
		appendCurrencyToAmount(element, enteredText);
		
		// Set the amount to empty as the data need not be stored.
  	  	amountEditedTransaction = '';
	}
	
	// Automatically create a budget for the category if it is an income category
	function autoCreateBudget(categoryId, totalAddedOrRemovedFromAmount) {
		if(categoryMap[categoryId].parentCategory == incomeCategory) {
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
		let income = convertToNumberFromCurrency($("#totalIncomeTransactions")[0].innerText);
		let expense = convertToNumberFromCurrency($("#totalExpensesTransactions")[0].innerText);

		let minusSign = '';
		let availableCash = income-expense;
		if (availableCash < 0){
			minusSign = '-';
			availableCash = Math.abs(availableCash);
		}
		
		replaceHTML('totalAvailableTransactions' , minusSign + currentCurrencyPreference + formatNumber(availableCash, currentUser.locale));
		
		// Update the pie chart
		transactionsChart.update(updatePieChartTransactions(income, expense));
		
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
            url: transactionAPIUrl + currentUser.financialPortfolioId + '/' + id + dateMeantFor + chosenDate,
            type: 'DELETE',
            success: function(data) {
            	
            	let classListBudget = budgetTableCell.classList;
            	for(let i=0, length = classListBudget.length; i < length; i++) {
            		let classItem = classListBudget[i];
            		if(includesStr(classItem, 'categoryIdForBudget')) {
            			// Remove amount from current Category
	        			previousCategoryId = lastElement(splitElement(classItem,'-'));
	        			let categoryAmount = convertToNumberFromCurrency($('.amountCategoryId-' + previousCategoryId)[0].innerText);
	        			
	        			if(categoryAmount == 0) {
	        				$('.amountCategoryId-' + previousCategoryId).parent().closest('div').fadeOut('slow', function(){ $(this).remove(); });
	        			}
	        			
            		}
            	}
            	
            	// Remove the table row (No need to update category amount or total values as the value of the TR is already 0 )
            	let closestTr = $('#budgetTransactionsRow-' + id).parent().closest('div');
            	$(closestTr).fadeOut('slow', function(){
            		$(this).remove(); 
        			// Disable delete Transactions button on refreshing the transactions
                 	manageDeleteTransactionsButton();
            	});
            	
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
		
		let imgElement =  document.createElement('img');
		imgElement.src = '../img/dashboard/icons8-document-128.png';
		categoryTableCell.appendChild(imgElement);
		emptyTableRow.appendChild(categoryTableCell);
		
		// Row 4
		let descriptionTableCell = document.createElement('div');
		descriptionTableCell.className = 'd-lg-table-cell';
		
		let paragraphElement = document.createElement('p');
		paragraphElement.className = 'text-secondary';
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
		 event.preventDefault();
		 // stop the event from bubbling.
		 event.stopPropagation();
		 event.stopImmediatePropagation();
		 let id = lastElement(splitElement($(this).attr('id'),'-'));
		 let values = {};
		 values['amount'] = 0.00;
		 values['description'] = '';
		 values['categoryOptions'] = id;
		 values['dateMeantFor'] = chosenDate;
		 $.ajax({
	          type: "POST",
	          url: saveTransactionsUrl + currentUser.financialPortfolioId,
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
	          },
	          error:  function (thrownError) {
             	 var responseError = JSON.parse(thrownError.responseText);
                  	if(responseError.error.includes("Unauthorized")){
                  		sessionExpiredSwal(thrownError);
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
			url: transactionAPIUrl + transactionFetchCategoryTotal + currentUser.financialPortfolioId + dateMeantFor + chosenDate,
            type: 'GET',
            async: true,
            success: function(categoryTotalMap) {
            	// Get all the category id's
        		let categoryTotalKeys = Object.keys(categoryTotalMap);
            	// Update category amount
            	for(let countGrouped = 0, lengthArray = categoryTotalKeys.length; countGrouped < lengthArray; countGrouped++) {
              	   let key = categoryTotalKeys[countGrouped];
              	   let value = categoryTotalMap[key];
              	   let categoryAmountDiv = document.getElementById('amountCategory-'+key);
              	   categoryAmountDiv.innerHTML = currentCurrencyPreference + formatNumber(value, currentUser.locale);
              	   categoryTotalKeys.push(key);
            	}
            	
            	let categoryDivs = document.querySelectorAll('*[id^="categoryTableRow"]');
            	let elementsToDelete = document.createDocumentFragment();
            	
            	// Find the categories that are visible to the user but are not present in the database
            	for(let count = 0, lengthArray = categoryDivs.length; count < lengthArray; count++){
            		let categoryDiv = categoryDivs[count];
            		let categoryId = lastElement(splitElement(categoryDiv.id,'-'));
            		// Check if the elements are present inside the keys
            		if(!includesStr(categoryTotalKeys, categoryId)) {
            			// Mark those elements to be deleted
            			$(categoryDiv).fadeOut('slow', function(){
            				elementsToDelete.appendChild(categoryDiv);
            			});
            		}
            	}
            	
            	// Remove the elements which are marked to be deleted
            	if(isNotEmpty(elementsToDelete)) {
            		elementsToDelete.remove(); 
            	}
            }
		});
	}
	
	//convert from currency format to number
	function convertToNumberFromCurrency(amount){
		return round(parseFloat(trimElement(lastElement(splitElement(amount,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
	}
	
	/**
	 * Logic for Category Modal
	 * 
	 */
	
	// Toggle Category modal upon click of a category
	function handleCategoryModalToggle(categoryId, closestTrElement, totalTransactions) {
		toggleCategoryModal(true);
		
		// Populate the category label with the one selected
		let categoryNameDiv = document.getElementById('categoryLabelInModal');
		categoryNameDiv.innerText = categoryMap[categoryId].categoryName;
		
		// Set the number of transactions
		let numberOfTransactionsDiv = document.getElementById('numberOfTransactions');
		numberOfTransactionsDiv.innerText = totalTransactions;
		
		// Update the budget amount to the category Modal if present
		let plannedAmountModal = document.getElementById('plannedAmountCategoryModal');
		let categoryTotalDiv = document.getElementById('amountCategory-' + categoryId);
		let percentageAvailable = document.getElementById('percentageAvailable');
		let remainingAmountDiv = document.getElementById('remainingAmount');
		
		let budgetElementText = closestTrElement.lastChild.innerText;
		if(isNotEmpty(budgetElementText)) {
			plannedAmountModal.innerText = budgetElementText;
			
			// Calculate percentage of budget available to spend or save
			let categoryAmount = convertToNumberFromCurrency(categoryTotalDiv.innerText);
			let budgetAmount = convertToNumberFromCurrency(budgetElementText);
			
			// Calculate remaining budget
			let budgetAvailableToSpendOrSave = budgetAmount - categoryAmount;
			let minusSign = '';
			
			// Change the div if and only if the class is not already present in the div
			let remainingAmountToggleClass = remainingAmountDiv.classList.contains('mild-text-success') ? false : true;
			
			// Calculate the minus sign and appropriate class for the remaining amounr
			if(budgetAvailableToSpendOrSave < 0) {
				remainingAmountToggleClass = remainingAmountDiv.classList.contains('mild-text-danger') ? false : true;
				minusSign = '-';
				budgetAvailableToSpendOrSave = Math.abs(budgetAvailableToSpendOrSave);
			}
			
			// Change color if the amount is negative or positive
			if(remainingAmountToggleClass) {
				remainingAmountDiv.classList.toggle('mild-text-success');
				remainingAmountDiv.classList.toggle('mild-text-danger');
			}
			
			// Change the remaining text appropriately
			remainingAmountDiv.innerText = minusSign + currentCurrencyPreference + formatNumber(budgetAvailableToSpendOrSave, currentUser.locale);

			// Calculate percentage available to spend or save
			let percentageRemaining = round((budgetAvailableToSpendOrSave / budgetAmount) * 100,0);
			percentageAvailable.innerText = percentageRemaining + '%';
		} else {
			plannedAmountModal.innerText = currentCurrencyPreference + '0.00';
			percentageAvailable.innerText = 'NA'
			remainingAmountDiv.innerText = currentCurrencyPreference + '0.00';
				
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
			// show the financial position div and hide the category modal
			categoryModalDiv[0].classList.add('d-none');
			financialPositionDiv[0].classList.remove('d-none');
		}
		
	}
	
	// Close Button functionality for category Modal
	document.getElementById("categoryHeaderClose").addEventListener("click",function(e){
		toggleCategoryModal(false);
	},false);
	
});

//# sourceURL=transaction.js

