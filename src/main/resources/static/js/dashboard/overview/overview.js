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
	// Lifetime Expense Transactions Cache
	let liftimeExpenseTransactionsCache = {};
	// Available Transactions with fund
	let userBudgetWithFund = {};
	// populate category breakdown for income or expense
	let fetchIncomeBreakDownCache = true;
	// Doughnut breakdown open
	let doughnutBreakdownOpen = false;
	// Cache the previous year picker date
	let currentYearSelect = new Date().getFullYear();
	let previousDateYearPicker = currentYearSelect - 2;
	// Cache the next year Picker data
	let nextDateYearPicker = currentYearSelect+2;
	// populate category breakdown for income or expense
	let fetchIncomeLineChartCache = true;
	// selected year in year picker
	let selectedYearIYPCache = 0;
	
	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(OVERVIEW_CONSTANTS, {
		'overviewUrl': { value: '/api/overview/', writable: false, configurable: false },
		'recentTransactionUrl': { value: 'recentTransactions/', writable: false, configurable: false },
		'lifetimeUrl': { value:'lifetime/', writable: false, configurable: false },
		'incomeAverageParam': { value:'?type=INCOME&average=true', writable: false, configurable: false },
		'expenseAverageParam': { value:'?type=EXPENSE&average=true', writable: false, configurable: false },
		'incomeTotalParam': { value:'?type=INCOME&average=false', writable: false, configurable: false },
		'expenseTotalParam': { value:'?type=EXPENSE&average=false', writable: false, configurable: false },
		'yearlyOverview': { value : 'One Year Overview', writable: false, configurable: false}
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
	        	
	        	// Empty HTML
	        	while (recentTransactionsDiv.firstChild) {
	        		recentTransactionsDiv.removeChild(recentTransactionsDiv.firstChild);
	    		}
	        	recentTransactionsDiv.appendChild(recentTransactionsFragment);
             	   
	        },
	        error:  function (thrownError) {
           	 var responseError = JSON.parse(thrownError.responseText);
            	if(responseError.error.includes("Unauthorized")){
            		er.sessionExpiredSwal(thrownError);
            	} else{
            		showNotification('Unable to populate recent transactions. Please refresh the page & try again!','top','center','danger');
            	}
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
            	
            	// Populate Category Break down Chart if present
            	if(doughnutBreakdownOpen) {
            		populateCategoryBreakdown(fetchIncomeBreakDownCache);
            	}
            	
            	// Populate Optimization of budgets
            	populateOptimizationOfBudget();
            	
            },
            error:  function (thrownError) {
           	 var responseError = JSON.parse(thrownError.responseText);
            	if(responseError.error.includes("Unauthorized")){
            		er.sessionExpiredSwal(thrownError);
            	} else{
            		showNotification('Unable to calculate the budget optimization. Please refresh the page & try again!','top','center','danger');
            	}
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
	          	  	userBudgetCache[userBudgetValue.categoryId] = userBudgetValue;
	          	  	
	          	    let categoryTotal = categoryTotalMapCache[userBudgetValue.categoryId];
	          	    // Check for Overspent budget
	          	    if(isNotEmpty(categoryTotal) && categoryTotal > userBudgetValue.planned) {
	          	    	populateOptimizationFragment.appendChild(buildBudgetOptimizations(userBudgetValue, categoryTotal));
	          	    } else if (categoryTotal < userBudgetValue.planned) {
	          	    	userBudgetWithFund[userBudgetValue.categoryId] = { 'amount' : userBudgetValue.planned - categoryTotal , 'parentCategory' : categoryMap[userBudgetValue.categoryId].parentCategory };
	          	    } else if (isEmpty(categoryTotal)) {
	          	    	userBudgetWithFund[userBudgetValue.categoryId] = { 'amount' : userBudgetValue.planned , 'parentCategory' : categoryMap[userBudgetValue.categoryId].parentCategory };
	          	    }
             	}
            	
            	// Empty the div optimizations
            	while (populateOptimizationBudgetDiv.firstChild) {
            		populateOptimizationBudgetDiv.removeChild(populateOptimizationBudgetDiv.firstChild);
        		}
            	if(populateOptimizationFragment.childElementCount === 0) {
            		populateOptimizationFragment.appendChild(buildSvgFullyOptimized());
            		
            		populateFullyOptimizedDesc(populateOptimizationFragment);
            		
            	} else {
            		let checkAllInput = document.getElementById('checkAll');
            		checkAllInput.removeAttribute('disabled');
            	}
            		
            	populateOptimizationBudgetDiv.appendChild(populateOptimizationFragment);
            	
	        },
	        error:  function (thrownError) {
           	 var responseError = JSON.parse(thrownError.responseText);
            	if(responseError.error.includes("Unauthorized")){
            		er.sessionExpiredSwal(thrownError);
            	} else{
            		showNotification('Unable to calculate the budget optimization. Please refresh the page & try again!','top','center','danger');
            	}
            }
		});
	}
	
	// Populate the fully optimized description 
	function populateFullyOptimizedDesc(populateOptimizationFragment) {
		let headingFullyOptimized = document.createElement('h4');
		headingFullyOptimized.classList = 'text-center font-weight-bold mt-1 optimizationHeadingColor';
		headingFullyOptimized.innerHTML = "Budget's are fully optimized";
		populateOptimizationFragment.appendChild(headingFullyOptimized);
		
		let paragraphOptimized = document.createElement('p');
		paragraphOptimized.classList = 'text-center tripleNineColor'
		paragraphOptimized.innerText = 'Awesomesauce!';
		populateOptimizationFragment.appendChild(paragraphOptimized);
		
	}
	
	// Budget optimizations over budgeted
	function buildBudgetOptimizations(userBudget, categoryTotal) {
			
		let overSpentBudget = Math.abs(categoryTotal - userBudget.planned);
		
		// Budget Optimization Row
		let tableBudgetOptimization = document.createElement('div');
		tableBudgetOptimization.id = 'budgetOptimization-' + userBudget.categoryId;
		tableBudgetOptimization.classList = 'budgetOptimization d-lg-table-row';
		
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
		// disable the button
		this.setAttribute('disabled','disabled');
		this.classList.toggle('d-none');
		// Enable the spinner
		document.getElementById('optimizationSpinner').classList.toggle('d-none');
		
		// Post a budget amount change to the user budget module and change to auto generated as false. 
		var values = {};
		values['autoGenerated'] = 'false';
		values['dateMeantFor'] = chosenDate;
		
		// Check if some of the optimizations are performed
		let optimizedSome = false;
		
		let checkedbudgetOptimizations = $('.number:checked');
		// Show choose atleast one budget to optimize message
		if(checkedbudgetOptimizations == 0) {
			showNotification('Please choose atleast one budget to optimize','top','center','danger');
			return;
		}
		
		// Iterate the budgets that require optimizations
		for(let i = 0, lengthParent = checkedbudgetOptimizations.length; i < lengthParent; i++) {
          // To remove the select all check box values
          let categoryId = checkedbudgetOptimizations[i].innerHTML;
          
          // Google Chrome Compatibility 
          if(isEmpty(categoryId) || isEmpty(categoryMap[categoryId])) {
        	  categoryId = checkedbudgetOptimizations[i].childNodes[0].nodeValue; 
          }
          
          let userBudget = userBudgetCache[categoryId];
		  let categoryTotal = categoryTotalMapCache[categoryId];
		  let totalOptimization = categoryTotal - userBudget.planned;
		  let amountToUpdateForBudget = userBudgetCache[categoryId].planned;
		  let fullyOptimized = false;
		  
          if(categoryId != "on" && isNotBlank(categoryId)){
        	  let categoryObject = categoryMap[categoryId];
        	  let dataKeys = Object.keys(userBudgetWithFund);
        	  
        	  // Iterate the budgets with fund 
        	  for(let count = 0, length = dataKeys.length; count < length; count++) {
        		  let categoryIdKey = dataKeys[count];
        		  let budgetWithFund = userBudgetWithFund[categoryIdKey];
        		  if(isNotEmpty(budgetWithFund) && categoryObject.parentCategory == budgetWithFund.parentCategory) {
        			  let totalOptimizationValue = 0;
        			  
        			  if(budgetWithFund.amount == 0 || totalOptimization == 0) {
        				  continue;
        			  }
        			  
        			  if(totalOptimization >= budgetWithFund.amount && (userBudgetCache[categoryIdKey].planned - budgetWithFund.amount) >= 0) {
        				 
        				  // Calculate remaining optimization necesary
        				  totalOptimizationValue = budgetWithFund.amount;
        				  
        				  // Update the budget that needs optimization
        				  amountToUpdateForBudget += budgetWithFund.amount;
        				  
        				  // Set the total optimization value
        				  totalOptimization -= budgetWithFund.amount;
        			  } else if(totalOptimization < budgetWithFund.amount && (userBudgetCache[categoryIdKey].planned - totalOptimization) >= 0) {
        				  
        				  fullyOptimized = true;
        				  // Update the budget that needs optimization
        				  amountToUpdateForBudget += totalOptimization;
        				  
        				  // Set the value to be optimized
        				  totalOptimizationValue = totalOptimization;
        				  
        				  totalOptimization = 0;
        			  }
        			  
        			  // Call budget amount (param2 and param3 has to be false and 0 respectively) for entries not present in optimization 
        			  if(totalOptimizationValue != 0) {
        				  values['planned'] = userBudgetCache[categoryIdKey].planned - totalOptimizationValue;
        				  values['category_id'] =  categoryIdKey;
        				  callBudgetAmountChange(values, false, 0);
        			  }
    				 
        			  // Set optimized some to true;
        			  optimizedSome = true;
        		  }

        		  // Break out of the for loop for budget with fund
        		  if(fullyOptimized) {
        			  break;
        		  }
        	  }
        	  
        	  // Check the optimized vs optimization required 
        	  let optimizedAmountForBudget = (categoryTotal - userBudget.planned) - (amountToUpdateForBudget - userBudgetCache[categoryId].planned);
        	  
        	  // Call the update user budget only when the value has changed
        	  if(amountToUpdateForBudget != userBudgetCache[categoryId].planned) {
        		  // Update the amount of budget that needs optimization at the end
            	  values['planned'] = amountToUpdateForBudget;
    			  values['category_id'] =  categoryId;
    			  callBudgetAmountChange(values, fullyOptimized, optimizedAmountForBudget);
        	  }
        	  
          }
          
       }
		
	   // Show notification to users
	   if(optimizedSome) {
		   showNotification('Successfully optimized the budgets with the funds available from other budgets!','top','center','success');
	   } else {
		   showNotification('Unable to optimize any budgets as there are no other budgets with available funds','top','center','danger');
	   }
	   
	   // Uncheck all the checked values
	   let checkedValues = $('.number:checked');
	   checkedValues.prop('checked', false);
	   checkedValues.prop('disabled', true);
	   
	   // Uncheck if select all is chosen
	   let checkAllValues = $('#checkAll:checked');
	   checkAllValues.prop('checked', false);
	   checkAllValues.prop('disabled', true);
	   
	   // Revert the spinner
	   document.getElementById('optimizationSpinner').classList.toggle('d-none');
	   // Hide the ** Selected message
	   document.getElementById('selectedOptimizations').innerText = 'None Selected';
	   // Show the Optimization Button as disabled
	   this.classList.toggle('d-none');
	   
	   // If the optimization body is null then show the fully optimized image
	   let optimizationBody = document.getElementById('optimizations');
	   if(optimizationBody.childElementCount == 0) {
		   let populateOptimizationFragment = document.createDocumentFragment();
		   populateOptimizationFragment.appendChild(buildSvgFullyOptimized());
   		   populateFullyOptimizedDesc(populateOptimizationFragment);
   		   optimizationBody.appendChild(populateOptimizationFragment);
	   }
	   
	},false);
	
	// Call budget amount change (Synchronous Ajax Call)
	function callBudgetAmountChange(values, fullyOptimized, totalOptimizationPending) {
		$.ajax({
	          type: "POST",
	          url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + CUSTOM_DASHBOARD_CONSTANTS.budgetSaveUrl + currentUser.financialPortfolioId,
	          dataType: "json",
	          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	          data : values,
	          async: false,
	          success: function(userBudget){
	        	  
	        	  // Update the cache
	        	  userBudgetCache[userBudget.categoryId] = userBudget;
	        	  
	        	  // Update the total funds available
	        	  if(isNotEmpty(userBudgetWithFund[userBudget.categoryId])) {
	        		  // Ensure that the transaction total is not null
	        		  if(isNotEmpty(categoryTotalMapCache[userBudget.categoryId])) {
	        			  userBudgetWithFund[userBudget.categoryId].amount =  categoryTotalMapCache[userBudget.categoryId] - userBudget.planned;
	        		  } else {
	        			  userBudgetWithFund[userBudget.categoryId].amount = userBudget.planned;
	        		  }
	        		  
	        	  }
	        	  
	        	  let budgetOptimizationDiv = document.getElementById('budgetOptimization-' + userBudget.categoryId);
	        	  
	        	  // If the document is null then return
	        	  if(budgetOptimizationDiv == null) {
	        		  return;
	        	  }
	        	  
	        	  // If fully optimized or pending is 0 then remove
	        	  if(fullyOptimized || totalOptimizationPending == 0) {
	        		  budgetOptimizationDiv.remove();
	        	  } else if(totalOptimizationPending > 0) {
	        		  // Replace the text with the pending values
	        		  budgetOptimizationDiv.lastChild.innerText = '-' + currentCurrencyPreference + formatNumber(Math.abs(totalOptimizationPending), currentUser.locale);
	        	  }
	          },
	          error: function(thrownError) {
	        	  var responseError = JSON.parse(thrownError.responseText);
	        	  if(responseError.error.includes("Unauthorized")){
	        		  er.sessionExpiredSwal(thrownError);
	        	  } else{
	        		  showNotification('Unable to change the budget category amount at this moment. Please try again!','top','center','danger');
	        	  }
	        	  
	          }
		});
	}	
	
	/**
	 * Select All  - Functionality
	 */
	
	// Disable Button if no check box is clicked and vice versa
	$( ".optimizationBudgetAndGoal" ).on( "click", ".number" ,function() {
		checkOrUncheckOptimization();
	});
	
	// Check or Uncheck Optimization
	function checkOrUncheckOptimization() {
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
	}
	
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
	
	// Click budget row
	$('.optimizationBudgetAndGoal').on('click', '.budgetOptimization', function() {
		// Check the row as selected / unselected
		let checkboxInElem = this.getElementsByClassName('number');
		checkboxInElem = $(checkboxInElem);
		checkboxInElem.prop('checked', !checkboxInElem.prop('checked'));
		// Common action for toggling checkbox
		checkOrUncheckOptimization();
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
	        },
	        error:  function (thrownError) {
           	 var responseError = JSON.parse(thrownError.responseText);
            	if(responseError.error.includes("Unauthorized")){
            		er.sessionExpiredSwal(thrownError);
            	} else{
            		showNotification('Unable to populate income average. Please refresh the page and try again!','top','center','danger');
            	}
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
	        },
	        error:  function (thrownError) {
           	 var responseError = JSON.parse(thrownError.responseText);
            	if(responseError.error.includes("Unauthorized")){
            		er.sessionExpiredSwal(thrownError);
            	} else{
            		showNotification('Unable to populate expense average. Please refresh the page and try again!','top','center','danger');
            	}
            }
		});
	}
	
	/**
	 * Chart Functionality
	 * 
	 */ 
	
	// Upon refresh call the income overview chart
	incomeOrExpenseOverviewChart(OVERVIEW_CONSTANTS.incomeTotalParam);
	// Add highlighted element to the income
	document.getElementsByClassName('incomeImage')[0].parentNode.classList.add('highlightOverviewSelected');
	
	function incomeOrExpenseOverviewChart(incomeTotalParameter) {
		jQuery.ajax({
			url: OVERVIEW_CONSTANTS.overviewUrl + OVERVIEW_CONSTANTS.lifetimeUrl + incomeTotalParameter,
	        type: 'GET',
	        success: function(dateAndAmountAsList) {
	        	
	        	calcAndBuildLineChart(dateAndAmountAsList);
	   		 	
	   		 	// Income or Expense Chart Options
	   		 	let incomeOrExpense = '';
	   		 	
   		 		if(isEqual(OVERVIEW_CONSTANTS.incomeTotalParam,incomeTotalParameter)) {
   		 			// Store it in a cache
   		        	liftimeIncomeTransactionsCache = dateAndAmountAsList;
   		        	// Make it reasonably immutable
   		        	Object.freeze(liftimeIncomeTransactionsCache);
   		        	Object.seal(liftimeIncomeTransactionsCache);
   		        	
   		        	incomeOrExpense ='Income';
   		        	
   		 		}  else {
   		 			// Store it in a cache
   		        	liftimeExpenseTransactionsCache = dateAndAmountAsList;
   		        	// Make it reasonably immutable
   		        	Object.freeze(liftimeExpenseTransactionsCache);
   		        	Object.seal(liftimeExpenseTransactionsCache);
   		        	
   		 			incomeOrExpense = 'Expense';
   		 		}
	   		 	
	   		 	appendChartOptionsForIncomeOrExpense(incomeOrExpense);
	        },
	        error:  function (thrownError) {
           	 var responseError = JSON.parse(thrownError.responseText);
            	if(responseError.error.includes("Unauthorized")){
            		er.sessionExpiredSwal(thrownError);
            	} else{
            		showNotification('Unable to populate the chart at this moment. Please try again!','top','center','danger');
            	}
            }
		});
	}
	
	// Calculate and build line chart for income / expense
	function calcAndBuildLineChart(dateAndAmountAsList) {
		let labelsArray = [];
		let seriesArray = [];
		
		// Replace with empty chart message
    	if(isEmpty(dateAndAmountAsList)) {
    		let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
    		let emptyMessageDocumentFragment = document.createDocumentFragment();
    		emptyMessageDocumentFragment.appendChild(buildEmptyChartMessage());
    		// Replace inner HTML with EMPTY
    		while (chartAppendingDiv.firstChild) {
    			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
    		}
    		chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
    		return;
    	}
    	
    	let resultKeySet = Object.keys(dateAndAmountAsList);
    	// If year selected in IYP then 
    	let countValue = 0;
    	if(!selectedYearIYPCache) {
    		// One year of data at a time;
        	countValue = resultKeySet.length > 12 ? (resultKeySet.length - 12) : 0;
    	}
    	
    	for(let countGrouped = countValue, length = resultKeySet.length; countGrouped < length; countGrouped++) {
    		let dateKey = resultKeySet[countGrouped];
         	let userAmountAsListValue = dateAndAmountAsList[dateKey];

         	// Convert the date key as date
         	let dateAsDate = new Date(dateKey);
         	
         	// If selected year is present
         	if(selectedYearIYPCache) {
         		if(selectedYearIYPCache == dateAsDate.getFullYear()) {
         			labelsArray.push(months[dateAsDate.getMonth()].slice(0,3) + " '" + dateAsDate.getFullYear().toString().slice(-2));
                 	
                 	// Build the series array with total amount for date
                 	seriesArray.push(userAmountAsListValue);
         		}
         		// If year is valid then skip the next lines in for loop
         		continue;
         	}
         	
         	labelsArray.push(months[dateAsDate.getMonth()].slice(0,3) + " '" + dateAsDate.getFullYear().toString().slice(-2));
         	
         	// Build the series array with total amount for date
         	seriesArray.push(userAmountAsListValue);
         	
    	}
    	
    	// Replace with empty chart message (selectedYearIYPCache == 'EXISTS')
    	if(isEmpty(seriesArray)) {
    		let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
    		let emptyMessageDocumentFragment = document.createDocumentFragment();
    		emptyMessageDocumentFragment.appendChild(buildEmptyChartMessage());
    		// Replace inner HTML with EMPTY
    		while (chartAppendingDiv.firstChild) {
    			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
    		}
    		chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
    		return;
    	} else if(seriesArray.length == 1){
    		let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
    		let emptyMessageDocumentFragment = document.createDocumentFragment();
    		emptyMessageDocumentFragment.appendChild(buildInsufficientInfoMessage());
    		// Replace inner HTML with EMPTY
    		while (chartAppendingDiv.firstChild) {
    			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
    		}
    		chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
    		return;
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
	
	// Click the overview card items
	$('.overviewEntryRow').click(function(){
		// Append spinner
		let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
		let materialSpinnerDocumentFragment = document.createDocumentFragment();
		materialSpinnerDocumentFragment.appendChild(buildMaterialSpinner());
		// Replace inner HTML with EMPTY
		while (chartAppendingDiv.firstChild) {
			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
		}
		chartAppendingDiv.appendChild(materialSpinnerDocumentFragment);
		
		// Start requesting the chart  
		let firstChildClassList = this.children[0].classList;
		if(firstChildClassList.contains('incomeImage')) {
			// Populate Category Break down Chart if present
        	if(doughnutBreakdownOpen) {
        		// Fetch the expense cache 
        		fetchIncomeBreakDownCache = true;
        		populateCategoryBreakdown(fetchIncomeBreakDownCache);
        		// Replace the Drop down with one year view
    			replaceChartChosenLabel('Income Breakdown');
    			// Hide the Year Picker in Overview Chart Display
    			hideYearPickerICD(true);
        	} else {
        		// Fetch line chart Income or expense cache
        		fetchIncomeLineChartCache = true;
        		// Replace the Drop down with one year view
    			replaceChartChosenLabel(OVERVIEW_CONSTANTS.yearlyOverview);
    			// Replace the selected year picker cache to 0
    			selectedYearIYPCache = 0;
    			// Replace with current year display
    			overviewChartMonthDisplay();
    			// Generate Year Picker and replace it with current Year
    			dynamicYearGeneration();
    			populateLineChart(liftimeIncomeTransactionsCache, true);
    			// Hide the Year Picker in Overview Chart Display
    			hideYearPickerICD(false);
        	}
        	document.getElementById('chartDisplayTitle').firstChild.nodeValue = 'Income Overview';
			// Replace the drop down for chart options
			appendChartOptionsForIncomeOrExpense('Income');
		} else if(firstChildClassList.contains('expenseImage')) {
			// Populate Category Break down Chart if present
        	if(doughnutBreakdownOpen) {
        		// Fetch the expense cache 
        		fetchIncomeBreakDownCache = false;
        		populateCategoryBreakdown(fetchIncomeBreakDownCache);
        		// Replace the Drop down with one year view
    			replaceChartChosenLabel('Expense Breakdown');
    			// Hide the Year Picker in Overview Chart Display
    			hideYearPickerICD(true);
        	} else {
        		// Fetch line chart Income or expense cache
        		fetchIncomeLineChartCache = false;
        		// Replace the selected year picker cache to 0
    			selectedYearIYPCache = 0;
    			// Replace with current year display
    			overviewChartMonthDisplay();
    			// Generate Year Picker and replace it with current Year
    			dynamicYearGeneration();
        		populateLineChart(liftimeExpenseTransactionsCache, false);
    			// Replace the Drop down with one year view
    			replaceChartChosenLabel(OVERVIEW_CONSTANTS.yearlyOverview);
    			// Hide the Year Picker in Overview Chart Display
    			hideYearPickerICD(false);
        	}
        	document.getElementById('chartDisplayTitle').firstChild.nodeValue = 'Expense Overview';
			// Replace the drop down for chart options
			appendChartOptionsForIncomeOrExpense('Expense');
		} else if(firstChildClassList.contains('assetsImage')) {
			let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
    		let emptyMessageDocumentFragment = document.createDocumentFragment();
    		emptyMessageDocumentFragment.appendChild(buildEmptyChartMessage());
    		// Replace inner HTML with EMPTY
    		while (chartAppendingDiv.firstChild) {
    			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
    		}
    		chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
			
		} else if(firstChildClassList.contains('debtImage')) {
			let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
    		let emptyMessageDocumentFragment = document.createDocumentFragment();
    		emptyMessageDocumentFragment.appendChild(buildEmptyChartMessage());
    		// Replace inner HTML with EMPTY
    		while (chartAppendingDiv.firstChild) {
    			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
    		}
    		chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
			
		} else if(firstChildClassList.contains('networthImage')) {
			let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
    		let emptyMessageDocumentFragment = document.createDocumentFragment();
    		emptyMessageDocumentFragment.appendChild(buildEmptyChartMessage());
    		// Replace inner HTML with EMPTY
    		while (chartAppendingDiv.firstChild) {
    			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
    		}
    		chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
		}
		
		// Remove the old highlighted element
		let overviewEntryrow = document.getElementsByClassName('overviewEntryRow');
		for(let count = 0, length = overviewEntryrow.length; count < length; count++) {
			let overviewEntryElement = overviewEntryrow[count];
			
			if(overviewEntryElement.classList.contains('highlightOverviewSelected')) {
				overviewEntryElement.classList.remove('highlightOverviewSelected');
			}
		}
		
		// Add the highlight to the element
		this.classList.add('highlightOverviewSelected');
	});
	 
	/*  **************** Coloured Rounded Line Chart - Line Chart ******************** */

	function coloredRounedLineChart(dataColouredRoundedLineChart) {
		 optionsColouredRoundedLineChart = {
	             lineSmooth: Chartist.Interpolation.cardinal({
	                 tension: 10
	             }),
	             axisY: {
	            	 	showGrid: true,
	            	 	offset: 40,
	            	    labelInterpolationFnc: function(value) {
	            	      
	            	      value = formatLargeCurrencies(value);
	            	      return currentCurrencyPreference + value;
	            	    },
	            	    scaleMinSpace: 15
	             },
	             axisX: {
	                 showGrid: false,
	             },
	             showPoint: true,
	             height: '400px'
	         };
	     
		 // Empty the chart div
		 let coloredChartDiv = document.getElementById('colouredRoundedLineChart');
		// Replace inner HTML with EMPTY
 		while (coloredChartDiv.firstChild) {
 			coloredChartDiv.removeChild(coloredChartDiv.firstChild);
 		}
		 // Dispose the previous tooltips created
		 $("#colouredRoundedLineChart").tooltip('dispose');
		 
		 // Append tooltip with line chart
	     var colouredRoundedLineChart = new Chartist.Line('#colouredRoundedLineChart', dataColouredRoundedLineChart, optionsColouredRoundedLineChart).on("draw", function(data) {
	    		if (data.type === "point") {
	    			data.element._node.setAttribute("title", "Total: <strong>" + currentCurrencyPreference + formatNumber(data.value.y, currentUser.locale) + '</strong>');
	    			data.element._node.setAttribute("data-chart-tooltip", "colouredRoundedLineChart");
	    		}
	    	}).on("created", function() {
	    		// Initiate Tooltip
	    		$("#colouredRoundedLineChart").tooltip({
	    			selector: '[data-chart-tooltip="colouredRoundedLineChart"]',
	    			container: "#colouredRoundedLineChart",
	    			html: true,
	    			placement: 'auto',
					delay: { "show": 300, "hide": 100 }
	    		});
	    	});

	     md.startAnimationForLineChart(colouredRoundedLineChart);
	 }
	
	// Build material Spinner
	function buildMaterialSpinner() {
		let materialSpinnerDiv = document.createElement('div');
		materialSpinnerDiv.classList = 'material-spinner rtSpinner';
		
		return materialSpinnerDiv;
	}
	
	// Build Empty chart
	function buildEmptyChartMessage() {
		let emptyChartMessage = document.createElement('div');
		emptyChartMessage.classList = 'text-center align-middle';
		
		let divIconWrapper = document.createElement('div');
		divIconWrapper.classList = 'icon-center';
		
		let iconChart = document.createElement('i');
		iconChart.classList = 'material-icons noDataChartIcon';
		iconChart.innerText = 'multiline_chart';
		divIconWrapper.appendChild(iconChart);
		emptyChartMessage.appendChild(divIconWrapper);
		
		let emptyMessage = document.createElement('div');
		emptyMessage.classList = 'font-weight-bold tripleNineColor';
		emptyMessage.innerText = "There's not enough data! Start adding transactions..";
		emptyChartMessage.appendChild(emptyMessage);
		
		return emptyChartMessage;
		
	}
	
	// Build Insufficient Information Message
	function buildInsufficientInfoMessage() {
		let emptyChartMessage = document.createElement('div');
		emptyChartMessage.classList = 'text-center align-middle';
		
		let divIconWrapper = document.createElement('div');
		divIconWrapper.classList = 'icon-center';
		
		let iconChart = document.createElement('i');
		iconChart.classList = 'material-icons noDataChartIcon';
		iconChart.innerText = 'bubble_chart';
		divIconWrapper.appendChild(iconChart);
		emptyChartMessage.appendChild(divIconWrapper);
		
		let emptyMessage = document.createElement('div');
		emptyMessage.classList = 'font-weight-bold tripleNineColor';
		emptyMessage.innerText = "There's not enough data! We need transactions in atleast 2 categories..";
		emptyChartMessage.appendChild(emptyMessage);
		
		return emptyChartMessage;
		
	}
	
	/**
	 * Chart Overview Drop Down (Income / Expense)
	 */
	function appendChartOptionsForIncomeOrExpense(incomeOrExpenseParam) {
		let anchorFragment = document.createDocumentFragment();
		
		let anchorDropdownItem = document.createElement('a');
		anchorDropdownItem.classList = 'dropdown-item chartOverview' + incomeOrExpenseParam;
		
		let categoryLabelDiv = document.createElement('div');
		categoryLabelDiv.classList = 'font-weight-bold';
		categoryLabelDiv.innerText = OVERVIEW_CONSTANTS.yearlyOverview;
		anchorDropdownItem.appendChild(categoryLabelDiv);
		anchorFragment.appendChild(anchorDropdownItem);
		
		let anchorDropdownItem1 = document.createElement('a');
		anchorDropdownItem1.classList = 'dropdown-item chartBreakdown' + incomeOrExpenseParam;
		
		let categoryLabelDiv1 = document.createElement('div');
		categoryLabelDiv1.classList = 'font-weight-bold';
		categoryLabelDiv1.innerText = incomeOrExpenseParam + ' Breakdown';
		anchorDropdownItem1.appendChild(categoryLabelDiv1);
		anchorFragment.appendChild(anchorDropdownItem1);
		
		let chooseCategoryDD = document.getElementById('chooseCategoryDD');
	    // Replace inner HTML with EMPTY
 		while (chooseCategoryDD.firstChild) {
 			chooseCategoryDD.removeChild(chooseCategoryDD.firstChild);
 		}
	    chooseCategoryDD.appendChild(anchorFragment);
	}
	
	// Chart Income One Year Overview
	$( "#chooseCategoryDD" ).on( "click", ".chartOverviewIncome" ,function() {
		replaceChartChosenLabel(OVERVIEW_CONSTANTS.yearlyOverview);
		
		// Replace the selected year picker cache to 0
		selectedYearIYPCache = 0;
		// Replace with current year display
		overviewChartMonthDisplay();
		// Generate Year Picker and replace it with current Year
		dynamicYearGeneration();
		// populate the income line chart from cache
		populateLineChart(liftimeIncomeTransactionsCache, true);
		// Dough nut breakdown open cache
		doughnutBreakdownOpen = false;
		// Fetch income or expense line chart
		fetchIncomeLineChartCache = true;
		// Show the Year Picker for line chart
		hideYearPickerICD(false);
	});
	
	// Chart Income Breakdown Chart
	$( "#chooseCategoryDD" ).on( "click", ".chartBreakdownIncome" ,function() {
		replaceChartChosenLabel('Income Overview');
		
		// Populate Breakdown Category
		populateCategoryBreakdown(true);
		// Populate cache for income or expense breakdown
		fetchIncomeBreakDownCache = true;
		// Dough nut breakdown open cache
		doughnutBreakdownOpen = true;
		// Hide the Year Picker for line chart
		hideYearPickerICD(true);
	});
	
	// Chart Expense One Year Overview
	$( "#chooseCategoryDD" ).on( "click", ".chartOverviewExpense" ,function() {
		replaceChartChosenLabel(OVERVIEW_CONSTANTS.yearlyOverview);
		
		// Replace the selected year picker cache to 0
		selectedYearIYPCache = 0;
		// Replace with current year display
		overviewChartMonthDisplay();
		// Generate Year Picker and replace it with current Year
		dynamicYearGeneration();
		// Populate the expense line chart from cache
		populateLineChart(liftimeExpenseTransactionsCache, false);
		// Dough nut breakdown open cache
		doughnutBreakdownOpen = false;
		// Fetch income or expense line chart
		fetchIncomeLineChartCache = false;
		// Show the Year Picker for line chart
		hideYearPickerICD(false);
	});
	
	// Chart Expense  Breakdown Chart
	$( "#chooseCategoryDD" ).on( "click", ".chartBreakdownExpense" ,function() {
		replaceChartChosenLabel('Expense Breakdown');
		
		// Populate Breakdown Category
		populateCategoryBreakdown(false);
		// Populate cache for income or expense breakdown
		fetchIncomeBreakDownCache = false;
		// Dough nut breakdown open cache
		doughnutBreakdownOpen = true;
		// Hide the Year Picker for line chart
		hideYearPickerICD(true);
	});
	
	// Populate Breakdown Category
	function populateCategoryBreakdown(fetchIncome) {
		let labelsArray = [];
		let seriesArray = [];
		let absoluteTotal = 0;
		let othersTotal = 0;
		let otherLabels = [];
		
		// Reset the line chart with spinner
		let colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart');
		colouredRoundedLineChart.innerHTML = '<div class="material-spinner rtSpinner"></div>';
		
		
		// Build the Absolute total 
		let incomeCategory = fetchIncome ? CUSTOM_DASHBOARD_CONSTANTS.incomeCategory : CUSTOM_DASHBOARD_CONSTANTS.expenseCategory;
		let categoryKeys = Object.keys(categoryTotalMapCache);
		for(let count = 0, length = categoryKeys.length; count < length; count++) {
			let categoryId = categoryKeys[count];
			let categoryTotal = categoryTotalMapCache[categoryId];
			let categoryObject = categoryMap[categoryId];
			if(categoryObject.parentCategory == incomeCategory) {
				// Add the category total to absolute total
				absoluteTotal += categoryTotal;
			}
		}
		
		// Build the legend and the series array
		for(let count = 0, length = categoryKeys.length; count < length; count++) {
			let categoryId = categoryKeys[count];
			let categoryTotal = categoryTotalMapCache[categoryId];
			
			let categoryObject = categoryMap[categoryId];
			if(categoryObject.parentCategory == incomeCategory) {
				let percentageOfTotal = (categoryTotal / absoluteTotal) * 100;
				// If the total is greater than 5 % then print it separate else accumulate it with others
				if(percentageOfTotal > 5) {
					labelsArray.push(categoryObject.categoryName);
					seriesArray.push(categoryTotal);
				} else {
					othersTotal += categoryTotal;
					otherLabels.push(categoryObject.categoryName);
				}
				
			}
		}
		
		// If others total is > 0 then print it. 
		if(othersTotal > 0) {
			if(otherLabels.length > 1) {
				labelsArray.push('Others');
			} else {
				labelsArray.push(otherLabels[0]);
			}
			seriesArray.push(othersTotal);
		}
		
		// Replace with empty chart message
    	if(isEmpty(seriesArray)) {
    		let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
    		let emptyMessageDocumentFragment = document.createDocumentFragment();
    		emptyMessageDocumentFragment.appendChild(buildEmptyChartMessage());
    		// Replace inner HTML with EMPTY
    		while (chartAppendingDiv.firstChild) {
    			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
    		}
    		chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
    		return;
    	}
		
		// Build the data for the line chart
    	let dataSimpleBarChart = {
		         labels: labelsArray,
		         series: seriesArray
		         
    	}

    	buildPieChart(dataSimpleBarChart, 'colouredRoundedLineChart', absoluteTotal);
	}
	
	// Introduce Chartist pie chart
	function buildPieChart(dataPreferences, id, absoluteTotal) {
		 /*  **************** Public Preferences - Pie Chart ******************** */

        let optionsPreferences = {
		  donut: true,
		  donutWidth: 50,
		  startAngle: 270,
		  showLabel: true,
		  height: '300px'
        };
        
        let responsiveOptions = [
    	  ['screen and (min-width: 640px)', {
    	    chartPadding: 40,
    	    labelOffset: 50,
    	    labelDirection: 'explode',
    	    labelInterpolationFnc: function(value, idx) {
    	      // Calculates the percentage of category total vs absolute total
    	      let percentage = round((dataPreferences.series[idx] / absoluteTotal * 100),2) + '%';
    	      return value + ': ' + percentage;
    	    }
    	  }],
    	  ['screen and (min-width: 1301px)', {
    	    labelOffset: 30,
    	    chartPadding: 10
    	  }],
    	  ['screen and (min-width: 992px)', {
      	    labelOffset: 45,
      	    chartPadding: 40,
      	  }],
    	  
    	];
        
        // Reset the chart
        replaceHTML(id, '');
        $("#" + id).tooltip('dispose');
        
        // Append Tooltip for Doughnut chart
        if(isNotEmpty(dataPreferences)) {
        	let categoryBreakdownChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences, responsiveOptions).on('draw', function(data) {
        		  if(data.type === 'slice') {
		        	let sliceValue = data.element._node.getAttribute('ct:value');
		        	data.element._node.setAttribute("title", "Total: <strong>" + currentCurrencyPreference + formatNumber(Number(sliceValue), currentUser.locale) + '</strong>');
					data.element._node.setAttribute("data-chart-tooltip", id);
        		  }
			}).on("created", function() {
				// Initiate Tooltip
				$("#" + id).tooltip({
					selector: '[data-chart-tooltip="' + id + '"]',
					container: "#" + id,
					html: true,
					placement: 'auto',
					delay: { "show": 300, "hide": 100 }
				});
			});
        	
        	// Animate the doughnut chart
        	er.startAnimationDonutChart(categoryBreakdownChart);
        }
        
	}
	
	// Populate the line chart from cache
	function populateLineChart(dateAndTimeAsList, incomeChart) {
		// Reset the line chart with spinner
		let colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart');
		colouredRoundedLineChart.innerHTML = '<div class="material-spinner rtSpinner"></div>';

		if(isNotEmpty(dateAndTimeAsList)) {
			calcAndBuildLineChart(dateAndTimeAsList);
		} else if(incomeChart) {
			incomeOrExpenseOverviewChart(OVERVIEW_CONSTANTS.incomeTotalParam);
		} else {
			incomeOrExpenseOverviewChart(OVERVIEW_CONSTANTS.expenseTotalParam);
		}
		
	}
	
	// Replaces the text of the chart chosen
	function replaceChartChosenLabel(chosenChartText) {
		let chosenChartLabel = document.getElementsByClassName('chosenChart');
		chosenChartLabel[0].innerText = chosenChartText;
	}
	
	/**
	 * Date Picker
	 */
	
	// Date Picker on click month
	$('.monthPickerMonth').click(function() {
		let recentTransactionsDiv = document.getElementsByClassName('recentTransactionCard');

		// If other pages are present then return this event
		if(recentTransactionsDiv.length == 0) {
			return;
		}
		
		// Reset the optimizations and recent transactions tab
		let optimizationsModule = document.getElementById('optimizations');
		optimizationsModule.innerHTML = '<div class="material-spinner rtSpinner"></div>';
		
		let recentTransactionsTab = document.getElementById('recentTransactions');
		recentTransactionsTab.innerHTML = '<div class="material-spinner rtSpinner"></div>';
		
		// Set chosen date
		er.setChosenDateWithSelected(this);
		
		// Populate Recent transactions
		populateRecentTransactions();
		
		// Fetch transaction total and Optimizations (Populate Category Breakdown chart if open)
		fetchCategoryTotalForTransactions();
		
	});
	
	/**
	 * Overview Chart Month Display
	 */
	overviewChartMonthDisplay();
	
	// Display Month Chart Display
	function overviewChartMonthDisplay() {
		let monthDisplay = document.getElementById('overviewChartMonth');
		
		// Year Display
		let currentDate = new Date();
		
		// If month is December then show only the current year 
		if(currentDate.getMonth() == 11) {
			monthDisplay.innerText = currentDate.getFullYear();
		} else {
			monthDisplay.innerText = (Number(currentDate.getFullYear()) - 1) + ' - ' + currentDate.getFullYear()
		}
	}
	
	/**
	 * Year Picker
	 */
	document.getElementById("chartDisplayTitle").addEventListener("click",function(){
		// If the doughnut chart is open then return
		if(doughnutBreakdownOpen) {
			return;
		}
		
		showOrHideYearPopover(this);
	});
	
	// Show popover year
	function showOrHideYearPopover(elem) {
		let overviewYearPickerClass = document.getElementById('overviewYearPicker').classList;
		if(overviewYearPickerClass.contains('d-none')) {
			// Add click outside event listener to close the modal
			document.addEventListener('mouseup', closeYearPickerModal, false);
		}
		
		// Show the popover
		overviewYearPickerClass.toggle('d-none');
		
		// Convert SVG to upward arrow
		elem.lastElementChild.classList.toggle('transformUpwardArrow');
	}
	
	// Dynamically generate year
	dynamicYearGeneration();
	
	function dynamicYearGeneration() {
		let yearPickerParent = document.getElementsByClassName('yearPicker');
		// Replace inner HTML with EMPTY
		while (yearPickerParent[0].firstChild) {
			yearPickerParent[0].removeChild(yearPickerParent[0].firstChild);
		}
		// Append Child Years
		appendChildYears(yearPickerParent[0], new Date().getFullYear());
	}
	
	// Append child years
	function appendChildYears(yearPickerParent, currentyear) {
		let fiveYearDisplay = document.createDocumentFragment();
		let minusTwoYearCache = currentyear-2;
		let plusTwoYearCache = currentyear+2;
		
		let minusTwoYear = document.createElement('div');
		minusTwoYear.classList = 'yearPickerDisplay';
		minusTwoYear.innerText = minusTwoYearCache;
		fiveYearDisplay.appendChild(minusTwoYear);
		
		let minusOneYear = document.createElement('div');
		minusOneYear.classList = 'yearPickerDisplay';
		minusOneYear.innerText = currentyear-1;
		fiveYearDisplay.appendChild(minusOneYear);
		
		let currentYearDis = document.createElement('div');
		currentYearDis.classList = 'yearPickerDisplay font-weight-bold twoBThreeOneColor';
		currentYearDis.innerText = currentyear;
		fiveYearDisplay.appendChild(currentYearDis);
		
		let plusOneYear = document.createElement('div');
		plusOneYear.classList = 'yearPickerDisplay';
		plusOneYear.innerText = currentyear+1;
		fiveYearDisplay.appendChild(plusOneYear);
		
		let plusTwoYear = document.createElement('div');
		plusTwoYear.classList = 'yearPickerDisplay';
		plusTwoYear.innerText = plusTwoYearCache;
		fiveYearDisplay.appendChild(plusTwoYear);
		
		yearPickerParent.appendChild(fiveYearDisplay);
		
		// Load the cache with previous dates
		previousDateYearPicker = minusTwoYearCache;
		
		// Load the cache with next dates
		nextDateYearPicker = plusTwoYearCache;
	}
	
	// Click the up button for year picker
	document.getElementById("monthPickerUp").addEventListener("click",function(){
		let yearPickerParent = document.getElementsByClassName('yearPicker')[0].children;
		removeSelectedIYP();
		let minusFourDateCache = previousDateYearPicker-5;
		yearPickerParent[0].innerText = minusFourDateCache;
		yearPickerParent[1].innerText = previousDateYearPicker-4;
		yearPickerParent[2].innerText = previousDateYearPicker-3;
		yearPickerParent[3].innerText = previousDateYearPicker-2;
		yearPickerParent[4].innerText = previousDateYearPicker-1;
		
		// Load the cache with next dates
		nextDateYearPicker = previousDateYearPicker;
		
		// Load the cache with previous dates
		previousDateYearPicker = minusFourDateCache;
		
	});
	
	// Click the down button for year picker
	document.getElementById("monthPickerDown").addEventListener("click",function(){
		let yearPickerParent = document.getElementsByClassName('yearPicker')[0].children;
		removeSelectedIYP();
		let plusFourDateCache = nextDateYearPicker+4;
		yearPickerParent[0].innerText = nextDateYearPicker;
		yearPickerParent[1].innerText = nextDateYearPicker+1;
		yearPickerParent[2].innerText = nextDateYearPicker+2;
		yearPickerParent[3].innerText = nextDateYearPicker+3;
		yearPickerParent[4].innerText = plusFourDateCache;
		
		// Load the cache with previous dates
		previousDateYearPicker = nextDateYearPicker;
		
		// Load the cache with next dates
		nextDateYearPicker = plusFourDateCache+1;
		
	});
	
	// remove selected in year picker
	function removeSelectedIYP() {
		let yearPickerParent = document.getElementsByClassName('yearPicker')[0].children;
		$(yearPickerParent).removeClass('font-weight-bold twoBThreeOneColor');
	}
	
	// Properly closes the year picker modal and performs year picker actions.
	function closeYearPickerModal(event) {
		
		let yearPickerParent = document.getElementsByClassName('yearPickerWrapper')[0];
		let overviewTitle = document.getElementById("chartDisplayTitle");
		
		if(overviewTitle.contains(event.target)) {
			// Remove event listener once the function performed its task
			document.removeEventListener('mouseup', closeYearPickerModal, false);
			
		} else if(!yearPickerParent.contains(event.target)) {
			showOrHideYearPopover(document.getElementById("chartDisplayTitle"));
			// Remove event listener once the function performed its task
			document.removeEventListener('mouseup', closeYearPickerModal, false);
		} 
	}
	
	// On click year in year picker
	$('.yearPicker').on('click', '.yearPickerDisplay', function() {
		// Remove the selected in year picker
		removeSelectedIYP();
		// Fetch the year and store in Cache
		selectedYearIYPCache = Number(this.innerText);
		// Display the month
		document.getElementById('overviewChartMonth').innerText = selectedYearIYPCache;
		// Show or hide year picker
		showOrHideYearPopover(document.getElementById("chartDisplayTitle"));
		// Remove event listener once the function performed its task
		document.removeEventListener('mouseup', closeYearPickerModal, false);
		// High light the selected
		this.classList.add("font-weight-bold", "twoBThreeOneColor");
		// Upon refresh call the income overview chart
		if(!doughnutBreakdownOpen) {
			if(fetchIncomeLineChartCache) {
				populateLineChart(liftimeIncomeTransactionsCache, true);
			} else {
				populateLineChart(liftimeExpenseTransactionsCache, false);
			}
		}
		
	});
	
	// Toggle Year picker in chart display
	function hideYearPickerICD(hideElement) {
		let overviewChartMonthDiv = document.getElementById('overviewChartMonth');
		let dateMonthArrowDiv = document.getElementById('dateMonthArrow');
		
		if(hideElement) {
			if(!overviewChartMonthDiv.classList.contains('d-none')) {
				overviewChartMonthDiv.classList.add('d-none');
			}
			
			if(!dateMonthArrowDiv.classList.contains('d-none')) {
				dateMonthArrowDiv.classList.add('d-none');
			}
		} else {
			if(overviewChartMonthDiv.classList.contains('d-none')) {
				overviewChartMonthDiv.classList.remove('d-none');
			}
			
			if(dateMonthArrowDiv.classList.contains('d-none')) {
				dateMonthArrowDiv.classList.remove('d-none');
			}
		}
	}
	
});