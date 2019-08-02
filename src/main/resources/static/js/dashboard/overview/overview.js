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
		tableCellImagesWrapper.classList = 'd-lg-table-cell align-middle imageWrapperCell text-center';
		
		let circleWrapperDiv = document.createElement('div');
		circleWrapperDiv.classList = 'rounded-circle align-middle circleWrapperImageRT';
		
		
		// Append a - sign if it is an expense
		if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			circleWrapperDiv.appendChild(creditCardSvg());
		} else {
			circleWrapperDiv.appendChild(plusRawSvg());
		}
		
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
	
	// Raw Plus Svg
	function plusRawSvg() {
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('class','align-middle');
    	svgElement.setAttribute('x','0px');
    	svgElement.setAttribute('y','0px');
    	svgElement.setAttribute('width','30');
    	svgElement.setAttribute('height','30');
    	svgElement.setAttribute('viewBox','0 0 80 80');
    	svgElement.setAttribute('fill','#000000');
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('class','creditCardSvg');
    	pathElement.setAttribute('overflow','visible');
    	pathElement.setAttribute('white-space','normal');
    	pathElement.setAttribute('font-family','sans-serif');
    	pathElement.setAttribute('font-weight','400');
    	pathElement.setAttribute('d','M 14.970703 2.9726562 A 2.0002 2.0002 0 0 0 13 5 L 13 13 L 5 13 A 2.0002 2.0002 0 1 0 5 17 L 13 17 L 13 25 A 2.0002 2.0002 0 1 0 17 25 L 17 17 L 25 17 A 2.0002 2.0002 0 1 0 25 13 L 17 13 L 17 5 A 2.0002 2.0002 0 0 0 14.970703 2.9726562 z');
    	
    	svgElement.appendChild(pathElement);
    	
    	return svgElement;
		
	}
	
	// Credit card SVG Image
	function creditCardSvg() {
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('class','align-middle');
    	svgElement.setAttribute('x','0px');
    	svgElement.setAttribute('y','0px');
    	svgElement.setAttribute('width','30');
    	svgElement.setAttribute('height','30');
    	svgElement.setAttribute('viewBox','0 0 30 30');
    	svgElement.setAttribute('fill','#000000');
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('class','plusRawSvg');
    	pathElement.setAttribute('d','M 11 16 C 8.2504839 16 6 18.250484 6 21 L 6 59 C 6 61.749516 8.2504839 64 11 64 L 69 64 C 71.749516 64 74 61.749516 74 59 L 74 21 C 74 18.250484 71.749516 16 69 16 L 11 16 z M 11 18 L 69 18 C 70.668484 18 72 19.331516 72 21 L 72 26 L 8 26 L 8 21 C 8 19.331516 9.3315161 18 11 18 z M 8 30 L 72 30 L 72 59 C 72 60.668484 70.668484 62 69 62 L 11 62 C 9.3315161 62 8 60.668484 8 59 L 8 30 z M 12 35 A 1 1 0 0 0 11 36 A 1 1 0 0 0 12 37 A 1 1 0 0 0 13 36 A 1 1 0 0 0 12 35 z M 16 35 A 1 1 0 0 0 15 36 A 1 1 0 0 0 16 37 A 1 1 0 0 0 17 36 A 1 1 0 0 0 16 35 z M 20 35 A 1 1 0 0 0 19 36 A 1 1 0 0 0 20 37 A 1 1 0 0 0 21 36 A 1 1 0 0 0 20 35 z M 24 35 A 1 1 0 0 0 23 36 A 1 1 0 0 0 24 37 A 1 1 0 0 0 25 36 A 1 1 0 0 0 24 35 z M 28 35 A 1 1 0 0 0 27 36 A 1 1 0 0 0 28 37 A 1 1 0 0 0 29 36 A 1 1 0 0 0 28 35 z M 32 35 A 1 1 0 0 0 31 36 A 1 1 0 0 0 32 37 A 1 1 0 0 0 33 36 A 1 1 0 0 0 32 35 z M 36 35 A 1 1 0 0 0 35 36 A 1 1 0 0 0 36 37 A 1 1 0 0 0 37 36 A 1 1 0 0 0 36 35 z M 52 43 C 48.145666 43 45 46.145666 45 50 C 45 53.854334 48.145666 57 52 57 C 53.485878 57 54.862958 56.523344 55.996094 55.730469 A 7 7 0 0 0 60 57 A 7 7 0 0 0 67 50 A 7 7 0 0 0 60 43 A 7 7 0 0 0 55.990234 44.265625 C 54.858181 43.47519 53.483355 43 52 43 z M 52 45 C 52.915102 45 53.75982 45.253037 54.494141 45.681641 A 7 7 0 0 0 53 50 A 7 7 0 0 0 54.498047 54.314453 C 53.762696 54.74469 52.916979 55 52 55 C 49.226334 55 47 52.773666 47 50 C 47 47.226334 49.226334 45 52 45 z');
    	
    	svgElement.appendChild(pathElement);
    	
    	return svgElement;
		
	}
	
});