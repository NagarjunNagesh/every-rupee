/**
 * Helpful functions with javascript
 */

function lastElement(arr){
	if(Array.isArray(arr)){
		return isEmpty(arr) ? arr : arr[arr.length-1];
	}
	return arr;
}

function  isEmpty(obj) {
	if(typeof(obj) == 'number' || typeof(obj) == 'boolean')
	    return false; 
	
	if (obj == null || obj === undefined)
        return true;
	
	if(typeof(obj.length) != 'undefined')
	    return obj.length == 0;
	 
	 for(var key in obj) {
	        if(obj.hasOwnProperty(key))
	            return false;
	    }
	    
	 return true;
}

function  isNotEmpty(obj) {
	return !isEmpty(obj);
}

function  isNotBlank(obj) {
	return isNotEmpty(obj) && obj !== '';
}

function trimElement(str) {
	return $.trim(str);
}

function splitElement(str, splitString){
	if(includesStr(str, splitString)){
		return isEmpty(str) ? str : str.split(splitString);
	}
	
	return str;
}

function includesStr(arr, val){
	return isEmpty(arr) ? null : arr.includes(val); 
}

function fetchFirstElement(arr){
	if(Array.isArray(arr)){
		return isEmpty(arr) ? null : arr[0];
	}
	return arr;
}

function isEqual(obj1,obj2){
	if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
	    return true;
	}
	return false;
}

function groupByKey(xs, key) {
	  return xs.reduce(function(rv, x) {
	    (rv[x[key]] = rv[x[key]] || []).push(x);
	    return rv;
	  }, {});
};

function isNotEqual(obj1,obj2){
	return !isEqual(obj1,obj2);
}