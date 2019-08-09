"use strict";
$(document).ready(function(){
	// User Budget Map Cache
	let userBudgetCache = {};
	// User transaction category ID and total
	let categoryTotalMapCache = {};
	// OVERVIEW CONSTANTS
	const OVERVIEW_CONSTANTS = {};
	// Lifetime Income Transactions cache
	let liftimeIncomeTransactionsCache = {};
	
	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(OVERVIEW_CONSTANTS, {
		'overviewUrl': { value: '/api/overview/', writable: false, configurable: false },
		'recentTransactionUrl': { value: 'recentTransactions/', writable: false, configurable: false },
		'lifetimeUrl': { value:'lifetime/', writable: false, configurable: false },
		'incomeAverageParam': { value:'?type=INCOME&average=true', writable: false, configurable: false },
		'expenseAverageParam': { value:'?type=EXPENSE&average=true', writable: false, configurable: false },
		'incomeTotalParam': { value:'?type=INCOME&average=false', writable: false, configurable: false }
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
	        		
	        		recentTransactionsFragment.appendChild(buildEmptyTransactionsSvg());
	        		
	        		
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
		// Convert date from UTC to user specific dates
		let creationDateUserRelevant = new Date(userTransaction.createDate);
		// Category Map 
		let categoryMapForUT = categoryMap[userTransaction.categoryId];
		
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
		elementWithDescription.innerText = isEmpty(userTransaction.description) ? 'No Description' : userTransaction.description.length < 25 ? userTransaction.description : userTransaction.description.slice(0,26) + '...';
		tableCellTransactionDescription.appendChild(elementWithDescription);
		
		let elementWithCategoryName = document.createElement('div');
		elementWithCategoryName.classList = 'small categoryNameRT w-100';
		elementWithCategoryName.innerText = (categoryMapForUT.categoryName.length < 25 ? categoryMapForUT.categoryName : (categoryMapForUT.categoryName.slice(0,26) + '...')) + ' • ' + ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0,3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ("0" + creationDateUserRelevant.getHours()).slice(-2) + ':' + ("0" + creationDateUserRelevant.getMinutes()).slice(-2);
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
		svgElement.setAttribute('class','align-middle plusRawSvg');
    	svgElement.setAttribute('x','0px');
    	svgElement.setAttribute('y','0px');
    	svgElement.setAttribute('width','30');
    	svgElement.setAttribute('height','30');
    	svgElement.setAttribute('viewBox','0 0 30 30');
    	svgElement.setAttribute('fill','#000000');
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('class','plusRawPath');
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
		svgElement.setAttribute('class','align-middle creditCardSvg');
    	svgElement.setAttribute('x','0px');
    	svgElement.setAttribute('y','0px');
    	svgElement.setAttribute('width','30');
    	svgElement.setAttribute('height','30');
    	svgElement.setAttribute('viewBox','0 0 80 80');
    	svgElement.setAttribute('fill','#000000');
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('class','creditCardPath');
    	pathElement.setAttribute('d','M 11 16 C 8.2504839 16 6 18.250484 6 21 L 6 59 C 6 61.749516 8.2504839 64 11 64 L 69 64 C 71.749516 64 74 61.749516 74 59 L 74 21 C 74 18.250484 71.749516 16 69 16 L 11 16 z M 11 18 L 69 18 C 70.668484 18 72 19.331516 72 21 L 72 26 L 8 26 L 8 21 C 8 19.331516 9.3315161 18 11 18 z M 8 30 L 72 30 L 72 59 C 72 60.668484 70.668484 62 69 62 L 11 62 C 9.3315161 62 8 60.668484 8 59 L 8 30 z M 12 35 A 1 1 0 0 0 11 36 A 1 1 0 0 0 12 37 A 1 1 0 0 0 13 36 A 1 1 0 0 0 12 35 z M 16 35 A 1 1 0 0 0 15 36 A 1 1 0 0 0 16 37 A 1 1 0 0 0 17 36 A 1 1 0 0 0 16 35 z M 20 35 A 1 1 0 0 0 19 36 A 1 1 0 0 0 20 37 A 1 1 0 0 0 21 36 A 1 1 0 0 0 20 35 z M 24 35 A 1 1 0 0 0 23 36 A 1 1 0 0 0 24 37 A 1 1 0 0 0 25 36 A 1 1 0 0 0 24 35 z M 28 35 A 1 1 0 0 0 27 36 A 1 1 0 0 0 28 37 A 1 1 0 0 0 29 36 A 1 1 0 0 0 28 35 z M 32 35 A 1 1 0 0 0 31 36 A 1 1 0 0 0 32 37 A 1 1 0 0 0 33 36 A 1 1 0 0 0 32 35 z M 36 35 A 1 1 0 0 0 35 36 A 1 1 0 0 0 36 37 A 1 1 0 0 0 37 36 A 1 1 0 0 0 36 35 z M 52 43 C 48.145666 43 45 46.145666 45 50 C 45 53.854334 48.145666 57 52 57 C 53.485878 57 54.862958 56.523344 55.996094 55.730469 A 7 7 0 0 0 60 57 A 7 7 0 0 0 67 50 A 7 7 0 0 0 60 43 A 7 7 0 0 0 55.990234 44.265625 C 54.858181 43.47519 53.483355 43 52 43 z M 52 45 C 52.915102 45 53.75982 45.253037 54.494141 45.681641 A 7 7 0 0 0 53 50 A 7 7 0 0 0 54.498047 54.314453 C 53.762696 54.74469 52.916979 55 52 55 C 49.226334 55 47 52.773666 47 50 C 47 47.226334 49.226334 45 52 45 z');
    	
    	svgElement.appendChild(pathElement);
    	
    	return svgElement;
		
	}
	
	// Empty Transactions SVG
	function buildEmptyTransactionsSvg() {
		
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('width','64');
		svgElement.setAttribute('height','64');
    	svgElement.setAttribute('viewBox','0 0 64 64');
    	svgElement.setAttribute('class','transactions-empty-svg svg-absolute-center');
    	
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
	
	/**
	 * Optimizations Functionality
	 */
	// Fetch transaction total 
	fetchCategoryTotalForTransactions();
	
	function fetchCategoryTotalForTransactions() {
		jQuery.ajax({
			url: CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.transactionFetchCategoryTotal + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate + CUSTOM_DASHBOARD_CONSTANTS.updateBudgetFalseParam,
            type: 'GET',
            success: function(categoryTotalMap) {
            	// Store the result in a cache
            	categoryTotalMapCache = categoryTotalMap;
            	
            	// Populate Optimization of budgets
            	populateOptimizationOfBudget();
            	
            }
		});
	}
	
	// Populate optimization of budgets
	function populateOptimizationOfBudget() {
		jQuery.ajax({
			url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate,
            type: 'GET',
            success: function(userBudgetList) {
            	let populateOptimizationBudgetDiv = document.getElementById('optimizations');
	        	let populateOptimizationFragment = document.createDocumentFragment();
            	let dataKeySet = Object.keys(userBudgetList);
            	for(let count = 0, length = dataKeySet.length; count < length; count++){
	            	let key = dataKeySet[count];
	          	  	let userBudgetValue = userBudgetList[key];
	          	  
	          	  	if(isEmpty(userBudgetValue)) {
	          	  		continue;
	          	  	}
	          	  	
	          	  	// Store the values in a cache
	          	  	userBudgetCache[userBudgetValue.categoryId] = value;
	          	  	
	          	    let categoryTotal = categoryTotalMapCache[userBudgetValue.categoryId];
	          	    // Check for Overspent budget
	          	    if(isNotEmpty(categoryTotal) && categoryTotal > userBudgetValue.planned) {
	          	    	populateOptimizationFragment.appendChild(buildBudgetOptimizations(userBudgetValue, categoryTotal));
	          	    }
            	}
            	
            	// Empty the div optimizations
            	populateOptimizationBudgetDiv.innerHTML = '';
            	if(populateOptimizationFragment.childElementCount === 0) {
            		populateOptimizationFragment.appendChild(buildSvgFullyOptimized());
            		
            		let headingFullyOptimized = document.createElement('h4');
            		headingFullyOptimized.classList = 'text-center font-weight-bold mt-1 optimizationHeadingColor';
            		headingFullyOptimized.innerHTML = "Budget's are fully optimized";
            		populateOptimizationFragment.appendChild(headingFullyOptimized);
            		
            		let paragraphOptimized = document.createElement('p');
            		paragraphOptimized.classList = 'text-center tripleNineColor'
            		paragraphOptimized.innerText = 'Awesomesauce!';
            		populateOptimizationFragment.appendChild(paragraphOptimized);
            	} else {
            		let checkAllInput = document.getElementById('checkAll');
            		checkAllInput.removeAttribute('disabled');
            	}
            		
            	populateOptimizationBudgetDiv.appendChild(populateOptimizationFragment);
            	
	        }
		});
	}
	
	// Budget optimizations over budgeted
	function buildBudgetOptimizations(userBudget, categoryTotal) {
			
		let overSpentBudget = Math.abs(categoryTotal - userBudget.planned);
		
		// Budget Optimization Row
		let tableBudgetOptimization = document.createElement('div');
		tableBudgetOptimization.id = 'budgetOptimization-' + userBudget.categoryId;
		tableBudgetOptimization.classList = 'd-lg-table-row';
		
		// Table Cell 1
		let checkboxCell = document.createElement('div');
		checkboxCell.tabIndex = -1;
		checkboxCell.className = 'd-lg-table-cell text-center checkListBO';
		
		let formCheckDiv = document.createElement('div');
		formCheckDiv.className = 'form-check';
		formCheckDiv.tabIndex = -1;
		
		let fromCheckLabel = document.createElement('label');
		fromCheckLabel.className = 'form-check-label';
		fromCheckLabel.tabIndex = -1;
		
		let inputFormCheckInput = document.createElement('input');
		inputFormCheckInput.className = 'number form-check-input';
		inputFormCheckInput.type = 'checkbox';
		inputFormCheckInput.innerHTML = userBudget.categoryId;
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
		checkboxCell.appendChild(formCheckDiv);
		tableBudgetOptimization.appendChild(checkboxCell);
		
		// Table Cell 2 
		let userBudgetNameDiv = document.createElement('div');
		userBudgetNameDiv.classList = 'font-weight-bold categoryNameBO d-lg-table-cell';
		userBudgetNameDiv.innerText = categoryMap[userBudget.categoryId].categoryName;
		tableBudgetOptimization.appendChild(userBudgetNameDiv);
		
		// Table Cell 3 
		let overspentAmountDiv = document.createElement('div');
		overspentAmountDiv.classList = 'budgetAmountBO expenseCategory font-weight-bold d-lg-table-cell text-right align-middle';
		overspentAmountDiv.innerHTML = '-' + currentCurrencyPreference + formatNumber(overSpentBudget, currentUser.locale);
		tableBudgetOptimization.appendChild(overspentAmountDiv);
		
		return tableBudgetOptimization;
	}
	
	// Builds an all optimized SVG meter
	function buildSvgFullyOptimized() {
		
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    	svgElement.setAttribute('viewBox','0 0 103.1 103.1');
    	svgElement.setAttribute('class','optimization-empty-svg mt-5 svg-absolute-center');
    	
    	let gElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    	
    	let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement1.setAttribute('class','optimization-empty-path-0');
    	pathElement1.setAttribute('d','M51.5,0C23.1,0,0,23.1,0,51.5c0,28.5,23.1,51.5,51.5,51.5c3.7,0,7.3-0.4,10.7-1.1c22.8-4.8,40-24.8,40.8-48.8 c0-0.5,0-1.1,0-1.6C103.1,23.1,80,0,51.5,0z M67,90.2c-0.1,0.2-0.2,0.3-0.4,0.4c-4.9,1.6-11.6,2.4-15.8,2.4 c-3.6,0-10.2-0.8-15.3-2.3c-0.2-0.1-0.3-0.2-0.4-0.4c-0.1-0.2,0-0.4,0.1-0.5l4.2-5.8c0.1-0.2,0.3-0.2,0.5-0.2h23 c0.2,0,0.4,0.1,0.5,0.3l3.5,5.7C67.1,89.8,67.1,90,67,90.2z M97,51.8c-0.1,17-9.5,31.7-23.3,39.5l-6.5-10.4 c-0.8-1.3-2.2-2.1-3.7-2.1H39.4c-1.4,0-2.7,0.7-3.6,1.8l-7.4,10.1C15.1,82.9,6,68.3,6,51.5C6,26.4,26.4,6,51.5,6h0.3 C76.8,6.2,97,26.5,97,51.5V51.8z');
    	gElement.appendChild(pathElement1);
    	
    	let pathElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement2.setAttribute('class','optimization-empty-path-1');
    	pathElement2.setAttribute('d','M63.4,84c-0.1-0.2-0.3-0.3-0.5-0.3h-23c-0.2,0-0.4,0.1-0.5,0.2l-4.2,5.8c-0.1,0.2-0.1,0.4-0.1,0.5 c0.1,0.2,0.2,0.3,0.4,0.4c5.1,1.5,11.7,2.3,15.3,2.3c4.2,0,10.9-0.7,15.8-2.4c0.2-0.1,0.3-0.2,0.4-0.4c0.1-0.2,0-0.4-0.1-0.5 L63.4,84z');
    	gElement.appendChild(pathElement2);
    	
    	let pathElement3 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement3.setAttribute('class','optimization-empty-path-1');
    	pathElement3.setAttribute('d','M51.8,6h-0.3C26.4,6,6,26.4,6,51.5c0,16.7,9,31.3,22.4,39.2l7.4-10.1c0.8-1.1,2.2-1.8,3.6-1.8h24.1 c1.5,0,2.9,0.8,3.7,2.1l6.5,10.4C87.6,83.5,96.9,68.8,97,51.8v-0.3C97,26.5,76.8,6.2,51.8,6z M20.2,52.8c0,0.3-0.1,0.6-0.3,0.8 c-0.2,0.2-0.5,0.3-0.8,0.3h-8.3c-0.6,0-1.1-0.5-1.1-1.1l0-2.4c0-0.3,0.1-0.6,0.3-0.8c0.2-0.2,0.5-0.3,0.8-0.3H19 c0.6,0,1.1,0.5,1.1,1.1V52.8z M30.2,76.2l-5.9,5.9c-0.2,0.2-0.5,0.3-0.8,0.3c-0.3,0-0.6-0.1-0.8-0.3L21,80.3 c-0.2-0.2-0.3-0.5-0.3-0.8s0.1-0.6,0.3-0.8l5.9-5.9c0.2-0.2,0.5-0.3,0.8-0.3s0.6,0.1,0.8,0.3l1.7,1.7c0.2,0.2,0.3,0.5,0.3,0.8 C30.5,75.7,30.4,76,30.2,76.2z M30.2,28.5l-1.7,1.7c-0.2,0.2-0.5,0.3-0.8,0.3c-0.3,0-0.6-0.1-0.8-0.3L21,24.3 c-0.4-0.4-0.4-1.1,0-1.6l1.7-1.7c0.2-0.2,0.5-0.3,0.8-0.3c0.3,0,0.6,0.1,0.8,0.3l5.9,5.9C30.6,27.4,30.6,28.1,30.2,28.5z M49.2,10.7c0-0.6,0.5-1.1,1.1-1.1h2.4c0.6,0,1.1,0.5,1.1,1.1V19c0,0.6-0.5,1.1-1.1,1.1h-2.4c-0.6,0-1.1-0.5-1.1-1.1V10.7z M57,49.6c0.3,0.5,0.5,1.1,0.7,1.8c0.8,3.8-1.5,7.5-5.3,8.4c-3.8,0.8-7.5-1.5-8.4-5.3c-0.8-3.8,1.5-7.5,5.3-8.3 c0.5-0.1,0.9-0.2,1.3-0.2l19.6-26.7L57,49.6z M93.4,53.3C93,64.4,87.9,75.4,80.3,82.1c-0.2,0.2-0.5,0.3-0.7,0.3l0,0 c-0.3,0-0.6-0.1-0.8-0.3l-5.9-5.9c-0.2-0.2-0.3-0.5-0.3-0.8c0-0.3,0.1-0.6,0.3-0.8l1.7-1.7c0.2-0.2,0.5-0.3,0.8-0.3 s0.6,0.1,0.8,0.3l3.6,3.6c5.6-6.4,8.7-14.2,9.3-22.6l-5,0c-0.3,0-0.6-0.1-0.8-0.3c-0.2-0.2-0.3-0.5-0.3-0.8v-2.4 c0-0.3,0.1-0.6,0.3-0.8c0.2-0.2,0.5-0.3,0.8-0.3h5c-0.5-8.4-3.7-16.3-9.3-22.6l-3.6,3.6c-0.2,0.2-0.5,0.3-0.8,0.3s-0.6-0.1-0.8-0.3 l-1.7-1.7c-0.2-0.2-0.3-0.5-0.3-0.8c0-0.3,0.1-0.6,0.3-0.8l5.9-5.9c0.2-0.2,0.5-0.3,0.8-0.3c0.3,0,0.5,0.1,0.7,0.3 c7.6,6.7,12.7,17.8,13.1,28.9C93.5,51.4,93.5,51.5,93.4,53.3z');
    	gElement.appendChild(pathElement3);
    	
    	let pathElement4 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement4.setAttribute('class','optimization-meter all-optimized');
    	pathElement4.setAttribute('d','M80.3,21c-0.2-0.2-0.5-0.3-0.7-0.3c-0.3,0-0.6,0.1-0.8,0.3l-5.9,5.9c-0.2,0.2-0.3,0.5-0.3,0.8 c0,0.3,0.1,0.6,0.3,0.8l1.7,1.7c0.2,0.2,0.5,0.3,0.8,0.3s0.6-0.1,0.8-0.3l3.6-3.6c5.6,6.4,8.7,14.2,9.3,22.6h-5 c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,0.8v2.4c0,0.3,0.1,0.6,0.3,0.8c0.2,0.2,0.5,0.3,0.8,0.3l5,0 c-0.5,8.4-3.7,16.3-9.3,22.6l-3.6-3.6c-0.2-0.2-0.5-0.3-0.8-0.3s-0.6,0.1-0.8,0.3l-1.7,1.7c-0.2,0.2-0.3,0.5-0.3,0.8 c0,0.3,0.1,0.6,0.3,0.8l5.9,5.9c0.2,0.2,0.5,0.3,0.8,0.3l0,0c0.3,0,0.5-0.1,0.7-0.3c7.6-6.7,12.7-17.8,13.1-28.9 c0.1-1.8,0.1-1.8,0-3.4C93,38.7,87.9,27.7,80.3,21z');
    	gElement.appendChild(pathElement4);
    	
    	let pathElement5 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement5.setAttribute('class','optimization-meter all-optimized');
    	pathElement5.setAttribute('d','M49.3,46.1c-3.8,0.8-6.1,4.6-5.3,8.3c0.8,3.8,4.6,6.1,8.4,5.3c3.8-0.8,6.1-4.6,5.3-8.4 c-0.2-0.6-0.4-1.2-0.7-1.8l13.2-30.4L50.6,46C50.2,46,49.8,46,49.3,46.1z');
    	gElement.appendChild(pathElement5);
    	
    	let pathElement6 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement6.setAttribute('class','optimization-empty-path-2');
    	pathElement6.setAttribute('d','M50.3,20.2h2.4c0.6,0,1.1-0.5,1.1-1.1v-8.3c0-0.6-0.5-1.1-1.1-1.1h-2.4c-0.6,0-1.1,0.5-1.1,1.1V19 C49.2,19.7,49.7,20.2,50.3,20.2z');
    	gElement.appendChild(pathElement6);
    	
    	let pathElement7 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement7.setAttribute('class','optimization-empty-path-2');
    	pathElement7.setAttribute('d','M24.3,21c-0.2-0.2-0.5-0.3-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3L21,22.8c-0.4,0.4-0.4,1.1,0,1.6l5.9,5.9 c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3l1.7-1.7c0.4-0.4,0.4-1.1,0-1.6L24.3,21z');
    	gElement.appendChild(pathElement7);
    	
    	let pathElement8 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement8.setAttribute('class','optimization-empty-path-2');
    	pathElement8.setAttribute('d','M19,49.2h-8.3c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,0.8l0,2.4c0,0.6,0.5,1.1,1.1,1.1H19 c0.3,0,0.6-0.1,0.8-0.3c0.2-0.2,0.3-0.5,0.3-0.8v-2.4C20.2,49.7,19.7,49.2,19,49.2z');
    	gElement.appendChild(pathElement8);
    	
    	let pathElement9 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement9.setAttribute('class','optimization-empty-path-2');
    	pathElement9.setAttribute('d','M28.5,72.9c-0.2-0.2-0.5-0.3-0.8-0.3s-0.6,0.1-0.8,0.3L21,78.8c-0.2,0.2-0.3,0.5-0.3,0.8s0.1,0.6,0.3,0.8 l1.7,1.7c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3l5.9-5.9c0.2-0.2,0.3-0.5,0.3-0.8c0-0.3-0.1-0.6-0.3-0.8L28.5,72.9z');
    	gElement.appendChild(pathElement9);
    	
    	svgElement.appendChild(gElement);
    	
    	return svgElement;
	}
	
	// Click optimization Button functionality
	document.getElementById("optimizeButton").addEventListener("click",function(){
		//TODO optimize button functionality
	},false);
	
	/**
	 * Select All  - Functionality
	 */
	
	// Disable Button if no check box is clicked and vice versa
	$( ".optimizationBudgetAndGoal" ).on( "click", ".number" ,function() {
		let checkAllElementChecked = $("#checkAll:checked");
		if(checkAllElementChecked.length > 0) {
			// uncheck the check all if a check is clicked and if the check all is already clicked
			checkAllElementChecked.prop('checked', false);
		}
		
		// Click the checkAll is all the checkboxes are clicked
		let allCheckedOptimizations = $(".number:checked");
		let allTransactions = $(".number");
		if(allCheckedOptimizations.length == allTransactions.length) {
			$("#checkAll").prop('checked', true);
		}
		
		// Choose all selected optimizations
		let numberSelected = allCheckedOptimizations.length > 0 ? allCheckedOptimizations.length + ' Selected' : 'None Selected';
		document.getElementById('selectedOptimizations').innerText = numberSelected;
		
		// Enable or disable optimizations buttons
		manageOptimizationButton(allCheckedOptimizations.length);
	});
	
	// Select all check boxes for Transactions
	document.getElementById("checkAll").addEventListener("click",function(){
		$('input[type="checkbox"]').prop('checked', $(this).prop('checked'));
		let allCheckedOptimizations = $(".number:checked");
		
		// Choose all selected optimizations
		let numberSelected = allCheckedOptimizations.length > 0 ? allCheckedOptimizations.length + ' Selected' : 'None Selected';
		document.getElementById('selectedOptimizations').innerText = numberSelected;
		// Enable or disable optimizations buttons
		manageOptimizationButton(allCheckedOptimizations.length);
	});
	
	// Function to enable of disable the delete transactions button
	function manageOptimizationButton(allCheckedLength){
		let manageOptimizationsButton = document.getElementById('optimizeButton');
		if(allCheckedLength > 0) {
			manageOptimizationsButton.removeAttribute('disabled');
		} else {
			manageOptimizationsButton.setAttribute('disabled','disabled');
		}  
	}
	
	/**
	 * Populate Income Average
	 */
	
	populateIncomeAverage();
	
	// Populate Income Average
	function populateIncomeAverage() {
		jQuery.ajax({
			url: OVERVIEW_CONSTANTS.overviewUrl + OVERVIEW_CONSTANTS.lifetimeUrl + OVERVIEW_CONSTANTS.incomeAverageParam,
	        type: 'GET',
	        success: function(averageIncome) {
	        	document.getElementById('averageIncomeAmount').innerText = currentCurrencyPreference + formatNumber(averageIncome, currentUser.locale);
	        }
		});
	}
	
	/**
	 *  Populate Expense Average
	 */
	populateExpenseAverage();
	
	// Populate Expense Average
	function  populateExpenseAverage() {
		jQuery.ajax({
			url: OVERVIEW_CONSTANTS.overviewUrl + OVERVIEW_CONSTANTS.lifetimeUrl + OVERVIEW_CONSTANTS.expenseAverageParam,
	        type: 'GET',
	        success: function(averageIncome) {
	        	document.getElementById('averageExpenseAmount').innerText = currentCurrencyPreference + formatNumber(averageIncome, currentUser.locale);
	        }
		});
	}
	
	/**
	 * Chart Functionality
	 * 
	 */ 
	
	// Upon refresh call the income overview chart
	incomeOverviewChart();
	
	function incomeOverviewChart() {
		let labelsArray = [];
		let seriesArray = [];
		jQuery.ajax({
			url: OVERVIEW_CONSTANTS.overviewUrl + OVERVIEW_CONSTANTS.lifetimeUrl + OVERVIEW_CONSTANTS.incomeTotalParam,
	        type: 'GET',
	        success: function(dateAndAmountAsList) {
	        	// Store it in a cache
	        	liftimeIncomeTransactionsCache = dateAndAmountAsList;
	        	// Make it reasonably immutable
	        	Object.freeze(liftimeIncomeTransactionsCache);
	        	Object.seal(liftimeIncomeTransactionsCache);
	        	
	        	let resultKeySet = Object.keys(dateAndAmountAsList);
	        	// One year of data at a time;
	        	let length = resultKeySet.length > 12 ? 12 : resultKeySet.length;
	        	for(let countGrouped = 0; countGrouped < length; countGrouped++) {
	        		let dateKey = resultKeySet[countGrouped];
	             	let userAmountAsListValue = dateAndAmountAsList[dateKey];
	             	
	             	// Convert the date key as date
	             	let dateAsDate = new Date(dateKey);
	             	labelsArray.push(months[dateAsDate.getMonth()] + ' ' + dateAsDate.getFullYear());
	             	
	             	// Build the series array with total amount for date
	             	seriesArray.push(userAmountAsListValue);
	             	
	        	}
	        	
	        	// Build the data for the line chart
	        	dataColouredRoundedLineChart = {
	   		         labels: labelsArray,
	   		         series: [
	   		        	seriesArray
	   		         ]
	   		     };
	        	// Display the line chart
	   		 	coloredRounedLineChart(dataColouredRoundedLineChart);
	        }
		});
	}
	 
	/*  **************** Coloured Rounded Line Chart - Line Chart ******************** */

	function coloredRounedLineChart(dataColouredRoundedLineChart) {
		 optionsColouredRoundedLineChart = {
	             lineSmooth: Chartist.Interpolation.cardinal({
	                 tension: 10
	             }),
	             axisY: {
	                 showGrid: true,
	                 offset: 40
	             },
	             axisX: {
	                 showGrid: false,
	             },
	             low: 0,
	             high: 1000,
	             showPoint: true,
	             height: '300px'
	         };
	     
	     var colouredRoundedLineChart = new Chartist.Line('#colouredRoundedLineChart', dataColouredRoundedLineChart, optionsColouredRoundedLineChart);

	     md.startAnimationForLineChart(colouredRoundedLineChart);
	 }

});