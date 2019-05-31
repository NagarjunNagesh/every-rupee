	
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
	// Sidebar 
	$sidebar = $('.sidebar');
	// Regex to check if the entered value is a float
	const regexForFloat = /^[+-]?\d+(\.\d+)?$/;
	// Delete Transaction Button Inside TD
	const deleteButton = '<button class="btn btn-danger btn-sm removeRowTransaction">Remove</button>';
	// New Pie Chart Storage Variable
	let transactionsChart = '';
		
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
		$.ajax({
	          type: "POST",
	          url: saveTransactionsUrl + currentUser.financialPortfolioId,
	          dataType: "json",
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
			url: transactionAPIUrl + currentUser.financialPortfolioId,
            type: 'GET',
            success: function(result) {
    			let totalExpensesTransactions = 0.00;
    			let totalIncomeTransactions = 0.00;
    			let transactionsTableDiv = document.createDocumentFragment();
    			let documentTbody = document.getElementById('productsJson');
    			// uncheck the select all checkbox if checked
    			$("#checkAll").prop("checked", false); 
    			// Disable delete Transactions button on refreshing the transactions
             	manageDeleteTransactionsButton();
             	let transactionIndex = 1;
             	for(let countGrouped = 0, lengthArray = Object.keys(result).length; countGrouped < lengthArray; countGrouped++) {
             	   let key = Object.keys(result)[countGrouped];
             	   let value = result[key];
     			   let transactionsRowDocumentFragment = document.createDocumentFragment();
     			   let totalCategoryAmount = 0;
     			   for(let count = 0, length = Object.keys(value).length; count < length; count++) {
     				  let subKey = Object.keys(value)[count];
     				  let subValue = value[subKey];
     				  // Create transactions table row
     				  transactionsRowDocumentFragment.appendChild(createTableRows(subValue, transactionIndex, key));
     				  totalCategoryAmount += subValue.amount;
     				  transactionIndex++;
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
    		   
    		  // update the Total Available Section
    		  updateTotalAvailableSection(totalIncomeTransactions , totalExpensesTransactions);
    		
            }
		});
	}
	
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
		
		if(totalIncomeTransactions > totalExpensesTransactions) {
			let totalAvailable = totalIncomeTransactions - totalExpensesTransactions;
			let totalAvailableAsPercentageOfIncome = round((totalAvailable / totalIncomeTransactions) * 100,1);
			   
			let totalExpenseAsPercentageOfIncome = round(((totalIncomeTransactions - totalAvailable) / totalIncomeTransactions) * 100,1);
			   
			dataPreferences = {
		                labels: [totalAvailableAsPercentageOfIncome + '%', totalExpenseAsPercentageOfIncome + '%'],
		                series: [totalAvailableAsPercentageOfIncome, totalExpenseAsPercentageOfIncome]
		            };
			
			replaceHTML('legendPieChart', 'Total Expense & Total Available as a percentage of Total Income');
			replaceHTML('totalAvailableLabel', 'Total Available');
		        
		} else if (totalIncomeTransactions < totalExpensesTransactions){
			let totalDeficitDifference = totalExpensesTransactions - totalIncomeTransactions;
			let totalDeficitAsPercentageOfExpense = round((totalDeficitDifference / totalExpensesTransactions) * 100,1);
			   
			let totalIncomeAsPercentageOfExpense = round(((totalExpensesTransactions - totalDeficitDifference) / totalExpensesTransactions) * 100,1);
			   
			dataPreferences = {
		                labels: [totalDeficitAsPercentageOfExpense + '%',,totalIncomeAsPercentageOfExpense + '%'],
		                series: [totalDeficitAsPercentageOfExpense,,totalIncomeAsPercentageOfExpense]
		            };
			
			replaceHTML('legendPieChart', 'Total Income & Total Overspent as a percentage of Total Expense');
			replaceHTML('totalAvailableLabel', 'Total Overspent');
		} else {
			replaceHTML('legendPieChart', 'Please fill in adequare data build the chart');
		}
		
		return dataPreferences;
		
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
		
		let checkboxCell = document.createElement('td');
		checkboxCell.tabIndex = -1;
		checkboxCell.appendChild(formCheckDiv);
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
		expenseSelectionOptGroup = cloneElementAndAppend(optGroupExpense, expenseSelectionOptGroup);
		selectCategory.appendChild(optGroupExpense);
		
		let optGroupIncome = document.createElement('optgroup');
		optGroupIncome.label = 'Income';
		incomeSelectionOptGroup =  cloneElementAndAppend(optGroupIncome, incomeSelectionOptGroup);
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
		selectCategoryRow.className = 'row font-weight-bold';
		selectCategoryRow.innerHTML = categoryMap[categoryId].categoryName;
		
		let linkElementWrapper = document.createElement('a');
		linkElementWrapper.href = '#';
		linkElementWrapper.id = 'addTableRow-' + categoryId;
		linkElementWrapper.className = 'addTableRowListener align-self-center';
		
		let addIconElement = document.createElement('i');
		addIconElement.className = 'material-icons displayCategoryAddIcon';
		addIconElement.innerHTML = 'add_circle_outline';
		
		linkElementWrapper.appendChild(addIconElement);
		selectCategoryRow.appendChild(linkElementWrapper);
		tableRow.appendChild(selectCategoryRow);
		
		// Table Row 4
		let descriptionTableRow = document.createElement('td');
		tableRow.appendChild(descriptionTableRow);
		
		// Table Row 5
		let amountTransactionsRow = document.createElement('td');
		amountTransactionsRow.setAttribute('id', 'amountCategory-' + categoryId);
		
		if(categoryMap[categoryId].parentCategory == expenseCategory) {
			amountTransactionsRow.className = 'text-right amountCategoryId-' + categoryId + ' spendingCategory';
		} else {
			amountTransactionsRow.className = 'text-right amountCategoryId-' + categoryId + ' incomeCategory';
		}
		
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
			                         url: transactionAPIUrl + currentUser.financialPortfolioId + '/' + transactionIds,
			                         type: 'DELETE',
			                         success: function() {
			                        	showNotification('Successfully deleted the selected transactions','top','center','success');
			                        	 
			                        	let elementsToDelete = $( ".number:checked" ).closest('tr');
			                        	let clonedElementsToDelete = elementsToDelete.clone();
			                        	
			                        	// Remove all the elements
			                        	elementsToDelete.fadeOut('slow', function(){ 
			                        		$(this).remove(); 
			                        		
			                        		// uncheck the select all checkbox if checked
				                			$("#checkAll").prop("checked", false); 
			                        		// Disable delete Transactions button on refreshing the transactions
				                         	manageDeleteTransactionsButton();
			                        	});
			                        	
			                        	let mapCategoryAndTransactions = {};
			                        	// Update the Category Amount
			                        	for(let count = 0, length = Object.keys(clonedElementsToDelete).length; count < length; count++){
			                        		let key = Object.keys(clonedElementsToDelete)[count];
			          	            	  	let value = clonedElementsToDelete[key];
			          	            	  	let classNameForClass = value.classList;
			          	            	  	for(let countCategory = 0, lengthClass = Object.keys(classNameForClass).length; countCategory < lengthClass; countCategory++){
			          	            	  		// TODO Obtain Classlist and append it to mapCategoryAndTransactions
			          	            	  	}
			                        	}
			                        	
			                        	// TODO use the mapCategoryAndTransactions to iterate every category with their corresponding transactions
			                        	// And remove the amount from the category.
			                        	// If the amount is zero then remove the category table row
			                        	
			                        	// Recalcualte the Total values accordingly and update them in a different loop
			                        	
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
		closestTableRow[0].classList.add('tableRowTransactionHighlight');
	});
	
	// Process the description to find out if the user has changed the description
	$( "tbody" ).on( "focusout", ".tableRowForSelectCategory" ,function() {
		$(this).closest('tr')[0].classList.remove('tableRowTransactionHighlight');
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
		          url: transactionAPIUrl + currentUser.financialPortfolioId + transactionsUpdateUrl + 'category',
		          dataType: "json",
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
	$('tbody').on('keyup', '.transactionsTableDescription' , function(e) {
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
		
		$.ajax({
	          type: "POST",
	          url: transactionAPIUrl + currentUser.financialPortfolioId + transactionsUpdateUrl + 'description',
	          dataType: "json",
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
	$('tbody').on('keyup', '.amountTransactionsRow' , function(e) {
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
		
		let selectTransactionId = splitElement($(element).attr('id'),'-');
		
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
			let totalAddedOrRemovedFromAmount = parseFloat(enteredText - previousText).toFixed(2);
			$.ajax({
		          type: "POST",
		          url: transactionAPIUrl + currentUser.financialPortfolioId + transactionsUpdateUrl + 'transaction',
		          dataType: "json",
		          data : values,
		          success: function(userTransaction){
		        	  updateCategoryAmount(userTransaction.categoryId, totalAddedOrRemovedFromAmount, true);
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
		
		// Handles the addition of buttons in the budget column for the row
		appendButtonForAmountEdition(enteredText, selectTransactionId);
		
		// Set the amount to empty as the data need not be stored.
  	  	amountEditedTransaction = '';
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
		  replaceHTML(budgetTableCell, '');
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
	  	  previousCategoryTotal = Math.abs(previousCategoryTotal);
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
		
		if(categoryForCalculation.contains('spendingCategory')) {
			let currentValueExpense = round(parseFloat(trimElement(lastElement(splitElement($("#totalExpensesTransactions")[0].innerText,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
			let totalAmountLeftForExpenses = currentValueExpense+ round(parseFloat(totalAddedOrRemovedFromAmount),2);
			replaceHTML('totalExpensesTransactions' , '-' + currentCurrencyPreference + formatNumber(Number(totalAmountLeftForExpenses), currentUser.locale));
			
		} else if(categoryForCalculation.contains('incomeCategory')) {
			let currentValueIncome = round(parseFloat(trimElement(lastElement(splitElement($("#totalIncomeTransactions")[0].innerText,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
			let totalAmountLeftForIncome = currentValueIncome + round(parseFloat(totalAddedOrRemovedFromAmount),2);
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
		
		replaceHTML('totalAvailableTransactions' , minusSign + currentCurrencyPreference + formatNumber(Number(availableCash), currentUser.locale));
		
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
	
	
	// Dynamically generated button click
	$( "tbody" ).on( "click", ".removeRowTransaction" ,function() {
		var id = lastElement(splitElement($(this).closest('td').attr('id'),'-'));
		// Remove the button and append the loader with fade out
		let budgetTableCell = document.getElementById('budgetTransactionsRow-' + id);
		budgetTableCell.innerHTML = '';
		budgetTableCell.appendChild(loaderBudgetSection());
		budgetTableCell.classList.add('fadeInAnimation');
		
		
		// Handle delete for individual row
		jQuery.ajax({
            url: transactionAPIUrl + currentUser.financialPortfolioId + '/' + id,
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
	        				$('.amountCategoryId-' + previousCategoryId).closest('tr').fadeOut('slow', function(){ $(this).remove(); });
	        			}
	        			
            		}
            	}
            	
            	// Remove the table row (No need to update category amount or total values as the value of the TR is already 0 )
            	let closestTr = $('#budgetTransactionsRow-' + id).closest('tr');
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
	
	// convert from currency format to number
	function convertToNumberFromCurrency(amount){
		return round(parseFloat(trimElement(lastElement(splitElement(amount,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
	}
	
	// Build empty table message as document
	function fetchEmptyTableMessage() {
		let emptyTableRow = document.createElement("tr");
		
		// Row 1
		let indexTableCell = document.createElement('td');
		emptyTableRow.appendChild(indexTableCell);
		
		// Row 2
		let selectAllTableCell = document.createElement('td');
		emptyTableRow.appendChild(selectAllTableCell);
		
		// Row 3
		let categoryTableCell = document.createElement('td');
		
		let imgElement =  document.createElement('img');
		imgElement.src = '../img/dashboard/icons8-document-128.png';
		categoryTableCell.appendChild(imgElement);
		emptyTableRow.appendChild(categoryTableCell);
		
		// Row 4
		let descriptionTableCell = document.createElement('td');
		
		let paragraphElement = document.createElement('p');
		paragraphElement.className = 'text-secondary';
		paragraphElement.innerHTML = 'There are no transactions yet. Start adding some to track your spending.';
		
		descriptionTableCell.appendChild(paragraphElement);
		emptyTableRow.appendChild(descriptionTableCell);
		
		// Row 5
		let amountTableCell = document.createElement('td');
		emptyTableRow.appendChild(amountTableCell);
		
		// Row 6
		let budgetTableCell = document.createElement('td');
		emptyTableRow.appendChild(budgetTableCell);
		
		return emptyTableRow;
	}
	
	// Introduce Chartist pie chart
	function buildPieChart(dataPreferences, id) {
		 /*  **************** Public Preferences - Pie Chart ******************** */

        var optionsPreferences = {
            height: '230px'
        };
        replaceHTML(id, '');
        
        if(isNotEmpty(dataPreferences)) {
        	transactionsChart = Chartist.Pie('#' + id, dataPreferences, optionsPreferences);
        }
        
	}
	
	// Perform update of budget to the API
	window.onbeforeunload = function(event) {
        // Call API of budget to automatically add budget
    };
    
    // Build the loader
    function loaderBudgetSection() {
    	let loader = document.createElement('div');
    	loader.id = 'material-spinner';
    	
    	return loader;
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
	$( "tbody" ).on( "click", ".addTableRowListener" ,function(event) {
		 event.preventDefault();
		 // stop the event from bubbling.
		 event.stopPropagation();
		 event.stopImmediatePropagation();
		 let id = lastElement(splitElement($(this).attr('id'),'-'));
		 let values = {};
		 values['amount'] = 0.00;
		 values['description'] = '';
		 values['categoryOptions'] = id;
		 debugger;
		 $.ajax({
	          type: "POST",
	          url: saveTransactionsUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          data : values,
	          success: function(userTransaction){
	        	  let tableRow = createTableRows(userTransaction, 1, userTransaction.categoryId);
	        	  let categoryParent = document.getElementById('categoryTableRow-' + userTransaction.categoryId);
	        	  let closestSibling = categoryParent.nextSibling;
	        	  // TODO Check the closest sibling has a display none and then hdie or unhide the row
	        	  categoryParent.parentNode.insertBefore(tableRow, closestSibling); 
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
     
});

//# sourceURL=transaction.js

