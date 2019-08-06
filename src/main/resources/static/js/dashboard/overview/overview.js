"use strict";
$(document).ready(function(){
	// User Budget Map Cache
	let userBudgetCache = {};
	// User transaction category ID and total
	let categoryTotalMapCache = {};
	// OVERVIEW CONSTANTS
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
	
	/**
	 * Optimizations Module
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
	 * Chart Mdule
	 * 
	 */ 
	 
	  /*  **************** Coloured Rounded Line Chart - Line Chart ******************** */


     dataColouredRoundedLineChart = {
         labels: ['\'06', '\'07', '\'08', '\'09', '\'10', '\'11', '\'12', '\'13', '\'14', '\'15'],
         series: [
             [287, 480, 290, 554, 690, 690, 500, 752, 650, 900, 944]
         ]
     };
     
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
     
});