
$(document).ready(function(){
	
	// Currency Preference
	const currentCurrencyPreference = document.getElementById('currentCurrencySymbol').innerText;
	// User Budget Map Cache
	let userBudgetCache = {};
	// User transaction category ID and total
	let categoryTotalMapCache = {};
	// Store the budget amount edited previously to compare
	let budgetAmountEditedPreviously = '';
	
	// Fetch user budget and build the div
	fetchAllUserBudget();
	
	// Fetches all the user budget and displays them in the user budget
	function fetchAllUserBudget() {
		let budgetDivFragment = document.createDocumentFragment();
		jQuery.ajax({
			url: budgetAPIUrl + currentUser.financialPortfolioId + dateMeantFor + chosenDate,
            type: 'GET',
            success: function(data) {
            	let dataKeySet = Object.keys(data)
            	for(let count = 0, length = dataKeySet.length; count < length; count++){
	            	let key = dataKeySet[count];
	          	  	let value = data[key];
	          	  	// Store the values in a cache
	          	  	userBudgetCache[value.categoryId] = value;
	          	  
	          	  	if(isEmpty(value)) {
	          	  		continue;
	          	  	}

	          	  	// Appends to a document fragment
	          	  	budgetDivFragment.appendChild(buildUserBudget(value));
            	}
            	
            	// paints them to the budget dashboard
          	  	document.getElementById('budgetAmount').appendChild(budgetDivFragment);
          	  	
          	  	// Fetch user transactions
          		fetchTransactions();
          		
            }
		});
		
	}
	
	// Build the user budget div
	function buildUserBudget(userBudget) {
		let categoryObject = categoryMap[userBudget.categoryId];
		
		if(isEmpty(categoryObject)) {
			return;
		}
		
		let card = document.createElement("div");
		card.classList = 'card';
		
		let cardBody = document.createElement("div");
		cardBody.classList = 'card-body';
		
		// Card Row Remaining
		let cardRowRemaining = document.createElement('div');
		cardRowRemaining.classList = 'row';
		
		// Card title with category name
		let cardTitle = document.createElement('div');
		cardTitle.classList = 'col-lg-6 text-left font-weight-bold';
		cardTitle.innerText = categoryObject.categoryName;
		cardRowRemaining.appendChild(cardTitle);
		
		
		// <div id="budgetInfoLabelInModal" class="col-lg-12 text-right headingDiv justify-content-center align-self-center">Remaining (%)</div> 
		let cardRemainingText = document.createElement('div');
		cardRemainingText.classList = 'col-lg-6 text-right headingDiv justify-content-center align-self-center mild-text';
		cardRemainingText.id = 'budgetInfoLabelInModal-' + categoryObject.categoryId;
		cardRemainingText.innerText = 'Remaining (%)';
		cardRowRemaining.appendChild(cardRemainingText);
		cardBody.appendChild(cardRowRemaining);
		
		// Card Row Percentage Available
		let cardRowPercentage = document.createElement('div');
		cardRowPercentage.classList = 'row';
		
		let cardBudgetAmountDiv = document.createElement('div');
		cardBudgetAmountDiv.id = 'budgetAmountEntered-' + categoryObject.categoryId;
		cardBudgetAmountDiv.classList = 'col-lg-6 text-left budgetAmountEntered font-weight-bold';
		cardBudgetAmountDiv.setAttribute('contenteditable', true);
		cardBudgetAmountDiv.innerText = currentCurrencyPreference + formatNumber(userBudget.planned, currentUser.locale);
		cardRowPercentage.appendChild(cardBudgetAmountDiv);
		
		// <span id="percentageAvailable" class="col-lg-12 text-right">NA</span> 
		let cardRemainingPercentage = document.createElement('div');
		cardRemainingPercentage.classList = 'col-lg-6 text-right percentageAvailable';
		cardRemainingPercentage.id = 'percentageAvailable-' + categoryObject.categoryId;
		cardRemainingPercentage.innerText = 'NA';
		cardRowPercentage.appendChild(cardRemainingPercentage);
		cardBody.appendChild(cardRowPercentage);
		
		// Parent div for Progress Bar
		let cardProgressAndRemainingAmount = document.createElement('div');
		
		// Div progress bar header
		let cardProgressClass = document.createElement('div');
		cardProgressClass.classList = 'progress';
		
		// progress bar
		let progressBar = document.createElement('div');
		progressBar.id='progress-budget-' + categoryObject.categoryId;
		progressBar.classList = 'progress-bar progress-bar-budget-striped';
		progressBar.setAttribute('role', 'progressbar');
		progressBar.setAttribute('aria-valuenow', '0');
		progressBar.setAttribute('aria-valuemin', '0');
		progressBar.setAttribute('aria-valuemax', '100');
		cardProgressClass.appendChild(progressBar);
		cardProgressAndRemainingAmount.appendChild(cardProgressClass);
		
		
		// Remaining Amount Div
		let remainingAmountDiv = document.createElement('span');
		remainingAmountDiv.id = 'remainingAmount-' + categoryObject.categoryId;
		remainingAmountDiv.classList = 'mild-text-budget';
		
		let currencyRemainingAmount = document.createElement('span');
		currencyRemainingAmount.innerText = currentCurrencyPreference + '0.00';
		remainingAmountDiv.appendChild(currencyRemainingAmount);
		cardProgressAndRemainingAmount.appendChild(remainingAmountDiv);
		
		let currencyRemainingText = document.createElement('span');
		currencyRemainingText.classList = 'mild-text'
		currencyRemainingText.innerText = ' Remaining';
		cardProgressAndRemainingAmount.appendChild(currencyRemainingText);
		cardBody.appendChild(cardProgressAndRemainingAmount);
		
		card.appendChild(cardBody);
		return card;
		
	}
	
	function fetchTransactions() {
		
		jQuery.ajax({
			url: transactionAPIUrl + transactionFetchCategoryTotal + currentUser.financialPortfolioId + dateMeantFor + chosenDate + updateBudgetFalseParam,
            type: 'GET',
            success: function(categoryTotalMap) {
            	// Store the result in a cache
            	categoryTotalMapCache = categoryTotalMap;
            	// Get all the category id's
        		let categoryTotalKeys = Object.keys(categoryTotalMap);
        		for(let count = 0, length = categoryTotalKeys.length; count < length; count++){
        			let categoryIdKey = categoryTotalKeys[count];
        			
        			// Handle the update of the progress bar modal
        			updateProgressBarAndRemaining(categoryIdKey);
        		}
        		
        		// Update the Budget Visualization module
        		updateBudgetVisualization();
        		
            }
		});
	}
	
	// Update the budget visualization module
	function updateBudgetVisualization() {
		let categoryTotalKeys = Object.keys(categoryTotalMapCache);
		
		let userBudgetCacheKeys = Object.keys(userBudgetCache);
		
		// Append an empty chart when there is no budget
		let dataPreferences = {};
		
		if(isNotEmpty(userBudgetCacheKeys)) {
			let totalBudgetedCategoriesDiv = document.getElementById('totalBudgetedCategories');
			totalBudgetedCategoriesDiv.innerText = userBudgetCacheKeys.length;
			
			if(isNotEmpty(categoryTotalKeys)) {
				let toBeBudgetedDiv = document.getElementById('toBeBudgeted');
				let toBeBudgetedAvailable = 0;
				
				// Calculate the to be budgeted section
				for(let count = 0, length = categoryTotalKeys.length; count < length; count++){
					let categoryIdKey = categoryTotalKeys[count];
					if(!includesStr(userBudgetCacheKeys, categoryIdKey)) {
						// Add +1 for every category id which is not present in the update budget keys
						toBeBudgetedAvailable++;
					}
				}
				// assign the to be budgeted
				toBeBudgetedDiv.innerText = toBeBudgetedAvailable;
				
				let totalCategoriesAvailable = toBeBudgetedAvailable + userBudgetCacheKeys.length;
				let userBudgetPercentage = round(((userBudgetCacheKeys.length / totalCategoriesAvailable) * 100),1);
				let toBeBudgetedPercentage = round(((toBeBudgetedAvailable / totalCategoriesAvailable) * 100),1);
				// labels: [Total Budgeted Category, To Be Budgeted]
				dataPreferences = {
	                labels: [userBudgetPercentage + '%',toBeBudgetedPercentage + '%'],
	                series: [userBudgetPercentage,toBeBudgetedPercentage]
	            };
				
			}
		} 
		
		buildPieChart(dataPreferences , 'chartBudgetVisualization');
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
        	let transactionsChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences);
        }
        
	}
	
	// Catch the amount when the user focuses on the budget
	$( "#budgetAmount" ).on( "focusin", ".budgetAmountEntered" ,function() {
		budgetAmountEditedPreviously = trimElement(this.innerText);
	});
	
	// Catch the amount when the user focuses on the budget
	$( "#budgetAmount" ).on( "focusout", ".budgetAmountEntered" ,function() {
		postNewBudgetAmount(this);
	});
	

	// Amount - disable enter key and submit request
	$('#budgetAmount').on('keyup', '.budgetAmountEntered' , function(e) {
		  var keyCode = e.keyCode || e.which;
		  if (keyCode === 13) { 
		    e.preventDefault();

		    $(this).blur(); 
		    return false;
		  }
	});
	
	// Post the newly entered budget amount and convert the auto generation to false
	function postNewBudgetAmount(element) {
		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = er.convertToNumberFromCurrency(element.innerText, currentCurrencyPreference);
		let previousText = er.convertToNumberFromCurrency(budgetAmountEditedPreviously, currentCurrencyPreference);
		
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
		
		if(previousText != enteredText){
			// Fetch the id
			let categoryIdForBudget = lastElement(splitElement($(element).attr('id'),'-'));
			// Security check to ensure that the category is present in the map
			if(er.checkIfInvalidCategory(categoryIdForBudget)) {
				return;
			}
			
			// Post a new budget to the user budget module and change to auto generated as false. 
			var values = {};
			values['planned'] = enteredText;
			values['category_id'] = categoryIdForBudget;
			values['autoGenerated'] = 'false';
			values['dateMeantFor'] = chosenDate;
			$.ajax({
		          type: "POST",
		          url: budgetAPIUrl + budgetSaveUrl + currentUser.financialPortfolioId,
		          dataType: "json",
		          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		          data : values,
		          success: function(userBudget){
		        	  // on success then replace the entered text 
		        	  element.innerText = currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
		        	  // Update the budget cache
		        	  userBudgetCache[userBudget.categoryId] = userBudget;
		        	  // Update the modal
		        	  updateProgressBarAndRemaining(userBudget.categoryId);
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
		} else {
			// previous text and entered text is the same then simy replace the text
			element.innerText = currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
		}
	}
	
	// Use user budget to update information in the modal
	function updateProgressBarAndRemaining(categoryIdKey) {
		debugger;
		let categoryTotalAmount = categoryTotalMapCache[categoryIdKey];
		
		let userBudgetValue = userBudgetCache[categoryIdKey];

		let remainingAmountDiv = document.getElementById('remainingAmount-' + categoryIdKey);
		let remainingAmountPercentageDiv = document.getElementById('percentageAvailable-' + categoryIdKey);
		let budgetLabelDiv = document.getElementById('budgetInfoLabelInModal-' + categoryIdKey);
		let progressBarCategoryModal = document.getElementById('progress-budget-' + categoryIdKey);
		
		// If the budget is not created for the particular category, make sure the budget is not equal to zero
		if(isNotEmpty(userBudgetValue) && isNotEmpty(categoryTotalAmount)) {
			// Calculate remaining budget
			let budgetAvailableToSpendOrSave = userBudgetValue.planned - categoryTotalAmount;
			let minusSign = '';
			
			// Calculate the minus sign and appropriate class for the remaining amount 
			if(budgetAvailableToSpendOrSave < 0) {
				// if the transaction category is expense category then show overspent else show To be budgeted
				if(categoryMap[categoryIdKey].parentCategory == expenseCategory) {
					budgetLabelDiv.innerText = 'Overspent (%)';
				} else if(categoryMap[categoryIdKey].parentCategory == incomeCategory) {
					budgetLabelDiv.innerText = 'To Be Budgeted (%)';
				}
				
				minusSign = '-';
				budgetAvailableToSpendOrSave = Math.abs(budgetAvailableToSpendOrSave);
			} else {
				budgetLabelDiv.innerText = 'Remaining (%)';
			}
			
			// Change the remaining text appropriately
			remainingAmountDiv.innerText = minusSign + currentCurrencyPreference + formatNumber(budgetAvailableToSpendOrSave, currentUser.locale);
			
			// Calculate percentage available to spend or save
			let remainingAmountPercentage = round(((budgetAvailableToSpendOrSave / userBudgetValue.planned) * 100),0);
			// If the user budget is 0 then the percentage calculation is not applicable
			if(userBudgetValue.planned == 0 || isNaN(remainingAmountPercentage)) {
				remainingAmountPercentageDiv.innerText = 'NA';
			} else {
				remainingAmountPercentageDiv.innerText = remainingAmountPercentage + '%';
			}
			
			// Assign progress bar value. If the category amount is higher then the progress is 100%
			let progressBarPercentage = isNaN(remainingAmountPercentage) ? 0 : (categoryTotalAmount > userBudgetValue.planned) ? 100 : (100 - remainingAmountPercentage);
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', progressBarPercentage);
			progressBarCategoryModal.style.width = progressBarPercentage + '%'; 
		} else if(isNotEmpty(progressBarCategoryModal)){
			remainingAmountPercentageDiv.innerText = 'NA';
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', 0);
			progressBarCategoryModal.style.width = 0 + '%';
		}
	}
	
});