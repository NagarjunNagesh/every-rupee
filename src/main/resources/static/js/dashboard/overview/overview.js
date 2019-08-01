"use strict";
$(document).ready(function(){
	
	const OVERVIEW_CONSTANTS = {};
	
	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(OVERVIEW_CONSTANTS, {
		'overviewUrl': { value: '/api/overview/', writable: false, configurable: false },
		'recentTransactionUrl': { value: 'recentTransactions/', writable: false, configurable: false },
	});

	// Populate Recent transactions
	populateRecentTransactions();
	
	// Populate Recent Transactions
	function populateRecentTransactions() {
		jQuery.ajax({
			url: OVERVIEW_CONSTANTS.overviewUrl + OVERVIEW_CONSTANTS.recentTransactionUrl + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate,
	        type: 'GET',
	        success: function(userTransactionsList) {
	        	let recentTransactionsDiv = document.getElementById('recentTransactions');
	        	let recentTransactionsFragment = document.createDocumentFragment();
	        	
	        	if(isEmpty(userTransactionsList)) {
	        		// TODO show custom message
	        	}
	        	
	        	let resultKeySet = Object.keys(userTransactionsList)
             	for(let countGrouped = 0, lengthArray = resultKeySet.length; countGrouped < lengthArray; countGrouped++) {
             	   let key = resultKeySet[countGrouped];
             	   let userTransaction = userTransactionsList[key];
             	   
             	   recentTransactionsFragment.appendChild(buildTransactionRow(userTransaction));
             	}
	        	
	        	recentTransactionsDiv.innerHTML = '';
	        	recentTransactionsDiv.appendChild(recentTransactionsFragment);
             	   
	        }
		});
	}
	
	// Builds the rows for recent transactions
	function buildTransactionRow(userTransaction) {
		
		let tableRowTransaction = document.createElement('div');
		tableRowTransaction.id = 'recentTransaction-' + userTransaction.transactionId;
		tableRowTransaction.classList = 'd-lg-table-row recentTransactionEntry';
		
		let tableCellTransactionDescription = document.createElement('div');
		tableCellTransactionDescription.classList = 'descriptionCellRT d-lg-table-cell';
		
		let elementWithDescription = document.createElement('div');
		elementWithDescription.classList = 'font-weight-bold recentTransactionDescription';
		elementWithDescription.innerText = isEmpty(userTransaction.description) ? 'No Description' : userTransaction.description;
		tableCellTransactionDescription.appendChild(elementWithDescription);
		
		let elementWithCategoryName = document.createElement('div');
		elementWithCategoryName.classList = 'small categoryNameRT w-100'
		elementWithCategoryName.innerText = categoryMap[userTransaction.categoryId].categoryName + '•' + userTransaction.createDate;
		tableCellTransactionDescription.appendChild(elementWithCategoryName);
		tableRowTransaction.appendChild(tableCellTransactionDescription);
		
		let transactionAmount = document.createElement('div');
		
		// Append a - sign if it is an expense
		if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			transactionAmount.classList = 'transactionAmountRT expenseCategory font-weight-bold d-lg-table-cell text-right';
			transactionAmount.innerHTML = '-' + currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
		} else {
			transactionAmount.classList = 'transactionAmountRT incomeCategory font-weight-bold d-lg-table-cell text-right';
			transactionAmount.innerHTML = currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
		}
		   
		   
		tableRowTransaction.appendChild(transactionAmount);
		
		return tableRowTransaction;
		
	}
	
});