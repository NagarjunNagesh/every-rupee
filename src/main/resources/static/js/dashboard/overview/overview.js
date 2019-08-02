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
	        		let imageTransactionEmptyWrapper = document.createElement('div');
	        		imageTransactionEmptyWrapper.classList = 'text-center d-lg-table-row';
	        		
	        		let imageTransactionEmpty = document.createElement('img');
	        		imageTransactionEmpty.src = '../img/dashboard/overview/icons8-ledger-100.png';
	        		imageTransactionEmpty.classList = 'imagesTransactionEmpty';
	        		imageTransactionEmptyWrapper.appendChild(imageTransactionEmpty);
	        		recentTransactionsFragment.appendChild(imageTransactionEmptyWrapper);
	        		
	        		
	        		let emptyMessageRow = document.createElement('div');
	        		emptyMessageRow.classList = 'text-center d-lg-table-row tripleNineColor font-weight-bold';
	        		emptyMessageRow.innerText = "Oh! Snap! You don't have any transactions yet.";
	        		recentTransactionsFragment.appendChild(emptyMessageRow);
	        	} else {
	        		let resultKeySet = Object.keys(userTransactionsList);
		        	// Print only the first 20 records
		        	let userBudgetLength = resultKeySet.length > 20 ? 20 : resultKeySet.length;
	             	for(let countGrouped = 0; countGrouped < userBudgetLength; countGrouped++) {
	             	   let key = resultKeySet[countGrouped];
	             	   let userTransaction = userTransactionsList[key];
	             	   
	             	   recentTransactionsFragment.appendChild(buildTransactionRow(userTransaction));
	             	}
	        	}
	        	
	        	recentTransactionsDiv.innerHTML = '';
	        	recentTransactionsDiv.appendChild(recentTransactionsFragment);
             	   
	        }
		});
	}
	
	// Builds the rows for recent transactions
	function buildTransactionRow(userTransaction) {
		
		let creationDateAndTime = splitElement(userTransaction.createDate,'T');
		let creationDate = splitElement(fetchFirstElement(creationDateAndTime),'-');
		
		let tableRowTransaction = document.createElement('div');
		tableRowTransaction.id = 'recentTransaction-' + userTransaction.transactionId;
		tableRowTransaction.classList = 'd-lg-table-row recentTransactionEntry';
		
		let tableCellImagesWrapper = document.createElement('div');
		tableCellImagesWrapper.classList = 'w-15 d-lg-table-cell align-middle imageWrapperCell text-center';
		
		let circleWrapperDiv = document.createElement('div');
		circleWrapperDiv.classList = 'rounded-circle align-middle circleWrapperImageRT';
		
		let cardImageDisplay = document.createElement('img');
		
		// Append a - sign if it is an expense
		if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			cardImageDisplay.src = '../img/dashboard/overview/icons8-credit-card.svg';
		} else {
			cardImageDisplay.src = '../img/dashboard/overview/icons8-plus-math-20.png';
		}
		
		
		circleWrapperDiv.appendChild(cardImageDisplay);
		tableCellImagesWrapper.appendChild(circleWrapperDiv);
		tableRowTransaction.appendChild(tableCellImagesWrapper);
		
		let tableCellTransactionDescription = document.createElement('div');
		tableCellTransactionDescription.classList = 'descriptionCellRT d-lg-table-cell';
		
		let elementWithDescription = document.createElement('div');
		elementWithDescription.classList = 'font-weight-bold recentTransactionDescription';
		elementWithDescription.innerText = isEmpty(userTransaction.description) ? 'No Description' : userTransaction.description;
		tableCellTransactionDescription.appendChild(elementWithDescription);
		
		let elementWithCategoryName = document.createElement('div');
		elementWithCategoryName.classList = 'small categoryNameRT w-100'
		elementWithCategoryName.innerText = categoryMap[userTransaction.categoryId].categoryName + ' • ' + lastElement(creationDate) + ' ' +  months[creationDate[1]-1].slice(0,3) + ' ' + fetchFirstElement(creationDate);
		tableCellTransactionDescription.appendChild(elementWithCategoryName);
		tableRowTransaction.appendChild(tableCellTransactionDescription);
		
		let transactionAmount = document.createElement('div');
		
		// Append a - sign if it is an expense
		if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			transactionAmount.classList = 'transactionAmountRT expenseCategory font-weight-bold d-lg-table-cell text-right align-middle';
			transactionAmount.innerHTML = '-' + currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
		} else {
			transactionAmount.classList = 'transactionAmountRT incomeCategory font-weight-bold d-lg-table-cell text-right align-middle';
			transactionAmount.innerHTML = currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
		}
		   
		   
		tableRowTransaction.appendChild(transactionAmount);
		
		return tableRowTransaction;
		
	}
	
});