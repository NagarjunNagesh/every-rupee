
$(document).ready(function(){
	
	// Currency Preference
	const currentCurrencyPreference = document.getElementById('currentCurrencySymbol').innerText;
	// User Budget Map Cache
	let userBudgetCache = {};
	// User transaction category ID and total
	let categoryTotalMapCache = {};
	
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
		cardTitle.classList = 'col-lg-6 text-right';
		cardTitle.innerText = categoryObject.categoryName;
		cardRowRemaining.appendChild(cardTitle);
		
		
		// <div id="budgetInfoLabelInModal" class="col-lg-12 text-right headingDiv justify-content-center align-self-center">Remaining (%)</div> 
		let cardRemainingText = document.createElement('div');
		cardRemainingText.classList = 'col-lg-6 text-right headingDiv justify-content-center align-self-center';
		cardRemainingText.id = 'budgetInfoLabelInModal-' + categoryObject.categoryId;
		cardRemainingText.innerText = 'Remaining (%)';
		cardRowRemaining.appendChild(cardRemainingText);
		cardBody.appendChild(cardRowRemaining);
		
		// Card Row Percentage Available
		let cardRowPercentage = document.createElement('div');
		
		// <span id="percentageAvailable" class="col-lg-12 text-right">NA</span> 
		let cardRemainingPercentage = document.createElement('div');
		cardRemainingPercentage.classList = 'col-lg-12 text-right';
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
        			let categoryTotalAmount = categoryTotalMap[categoryIdKey];
        			
        			let userBudgetValue = userBudgetCache[categoryIdKey];

        			let remainingAmountDiv = document.getElementById('remainingAmount-' + categoryIdKey);
        			let remainingAmountPercentageDiv = document.getElementById('percentageAvailable-' + categoryIdKey);
        			let budgetLabelDiv = document.getElementById('budgetInfoLabelInModal-' + categoryIdKey);
        			let progressBarCategoryModal = document.getElementById('progress-budget-' + categoryIdKey);
        			
        			// If the budget is not created for the particular category
        			if(isNotEmpty(userBudgetValue)) {
	        			// Calculate remaining budget
	        			let budgetAvailableToSpendOrSave = userBudgetValue.planned - categoryTotalAmount;
	        			let minusSign = '';
	        			
	        			// Calculate the minus sign and appropriate class for the remaining amount 
	        			if(budgetAvailableToSpendOrSave < 0) {
	        				// if the transaction category is expense category then show overspent else show To be budgeted
	        				if(categoryMap[categoryIdKey].parentCategory == expenseCategory) {
	        					budgetLabelDiv.innerText = 'Overspent (%)';
	        				} else if(categoryMap[key].parentCategory == incomeCategory) {
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
	    				remainingAmountPercentageDiv.innerText = remainingAmountPercentage + '%';
	    				
	    				// Assign progress bar value. If the category amount is higher then the progress is 100%
	    				let progressBarPercentage = isNaN(remainingAmountPercentage) ? 0 : (categoryTotalAmount > userBudgetValue.planned) ? 100 : (100 - remainingAmountPercentage);
	    				// Set the value and percentage of the progress bar
	    				progressBarCategoryModal.setAttribute('aria-valuenow', progressBarPercentage);
	    				progressBarCategoryModal.style.width = progressBarPercentage + '%'; 
        			} else if(isNotEmpty(progressBarCategoryModal)){
        				// Set the value and percentage of the progress bar
	    				progressBarCategoryModal.setAttribute('aria-valuenow', 0);
	    				progressBarCategoryModal.style.width = 0 + '%';
        			}
        			
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
		
		if(isNotEmpty(userBudgetCacheKeys)) {
			let totalBudgetedCategoriesDiv = document.getElementById('totalBudgetedCategories');
			totalBudgetedCategoriesDiv.innerText = userBudgetCacheKeys.length;
			
			if(isNotEmpty(categoryTotalKeys)) {
				let toBeBudgetedDiv = document.getElementById('toBeBudgeted');
				let toBeBudgetedAvailable = categoryTotalKeys.length - userBudgetCacheKeys.length;
				toBeBudgetedDiv.innerText = toBeBudgetedAvailable;
				
				let userBudgetPercentage = round(((userBudgetCacheKeys.length / categoryTotalKeys.length) * 100),1);
				let toBeBudgetedPercentage = round(((toBeBudgetedAvailable / categoryTotalKeys.length) * 100),1);
				// labels: [Total Budgeted Category, To Be Budgeted]
				let dataPreferences = {
	                labels: [userBudgetPercentage + '%',toBeBudgetedPercentage + '%'],
	                series: [userBudgetPercentage,toBeBudgetedPercentage]
	            };
				
				buildPieChart(dataPreferences , 'chartBudgetVisualization');
			}
		}
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
	
});