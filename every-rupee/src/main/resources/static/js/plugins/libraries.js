/**
 * Helpful functions with javascript
 */

function lastElement(arr){
	return isEmpty(arr) ? null : arr[arr.length-1];
}

function  isEmpty(obj) {
	 for(var key in obj) {
	        if(obj.hasOwnProperty(key))
	            return false;
	    }
	    return true;
}

function trimElement(str) {
	return $.trim(str);
}

function splitElement(str, splitString){
	return isEmpty(str) ? null : str.split(splitString);;
}

function includesStr(arr, val){
	return  isEmpty(arr) ? null : arr.includes(val); 
}

function fetchFirstElement(arr){
	return isEmpty(arr) ? null : arr[0];
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