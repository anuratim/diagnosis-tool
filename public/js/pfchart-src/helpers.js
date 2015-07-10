var helpers = {};

helpers.zeroToMax = function(data) { return [0, helpers.max(data)]; };

/**
 * Gets a domain for a stacked chart.
 */
helpers.zeroToLayeredMax = function(data) {
	var lastLayerArr = data[data.length - 1];
	if (!_.isArray(lastLayerArr)) {
		throw new Error("Expected array, but found [" + typeof(lastLayerArr) + "]: " + lastLayerArr);
	}
	
	var lastValue = d3.max(lastLayerArr, function(d) { return d.value0 + d.value; });
	return [0, lastValue];
};

helpers.minToZero = function(data) { return [helpers.min(data), 0]; };

helpers.minToMax = function(data) { return [helpers.min(data), helpers.max(data)]; };

helpers.minToMaxDates = function(data) {
	var minDate = new Date(data[0].label);
    var maxDate = new Date(data[data.length-1].label);
    
    // don't cut the axis right at the min/max values
    maxDate = moment(maxDate).add("months", 1).toDate();
	minDate = moment(minDate).subtract("months", 1).toDate();
    return [minDate, maxDate];
};

helpers.min = function(data) {
	if (!data || !data.length) {
		return null;
	}
	
	else {
		switch (data.length) {
			case 0:
				return null;
	
			case 1:
				return 0;
	
			default:
				var clonedArr = helpers._cloneAndSort(data, helpers.sortByValueAsc);
				var firstValue = _.first(clonedArr).value;
				
				if (firstValue > 0) {
					// don't cut the axis right at the min value
					var nextValue = helpers._findSecondUniqueValue(clonedArr);
					var increment = nextValue - firstValue;
					return Math.max(0, firstValue - increment);
				}
				
				else {
					return firstValue;
				}
		}
	}
}

helpers.max = function(data) {
	if (!data || !data.length) {
		return null;
	}
	
	else {
		switch (data.length) {
			case 0:
				return null;
	
			case 1:
				return data[0].value * 2;
	
			default:
				var clonedArr = helpers._cloneAndSort(data, helpers.sortByValueAsc);
				var lastValue = _.last(clonedArr).value;
				// don't cut the axis right at the max value
				var previousValue = helpers._findSecondToLastUniqueValue(clonedArr);
				var increment = lastValue - previousValue;
				return lastValue + increment;
		}
	}
}

helpers.sortAsc = function(a, b) { return a - b; }
helpers.sortDesc = function(a, b) { return b - a; }
helpers.sortByLabelAsc = function(a, b) { return d3.ascending(a.label, b.label); };
helpers.sortByLabelDesc = function(a, b) { return d3.descending(a.label, b.label); };
helpers.sortByValueAsc = function(a, b) { return helpers.sortAsc(a.value, b.value); };
helpers.sortByValueDesc = function(a, b) { return helpers.sortDesc(a.value, b.value); };

helpers.sortByDateAsc = function(firstDate, secondDate) {
	if (firstDate > secondDate) {
		return 1;
	}
	
	else if (firstDate < secondDate) {
		return -1;
	}
	
	else {
		return 0;
	}
};

helpers.sortByDateDesc = function(firstDate, secondDate) {
	return -1 * helpers.sortByDateAsc(firstDate, secondDate);
};

/**
 * Returns whether the given point is inside the given rectangle.
 * @param {Map<String, Integer>} rect  a rectangle with x, y, w, and h properties
 * @param {Map<String, Integer>} point  a position with x and y properties
 */
helpers.containsPoint = function(rect, point) {
	var contains = point.x >= rect.x && point.x <= (rect.x + rect.w);
	
	if (contains) {
		contains = point.y >= rect.y && point.y <= (rect.y + rect.h);
	}
	
	return contains;
};

/**
 * Gets a property value from loaded css styles.
 * @param {String} htmlFragment  a single-level HTML fragment that should match the css style we're targeting;
 * e.g., "<p class='cls-name'/>" if we want to find "p.cls-name" in the css.
 * Note: doesn't work for nested tags; e.g, "<div><p class='cls-name'/></div>" to match "div p.cls-name"
 * @param {String} propertyName  the name of the css property in the target css style
 * whose value we want
 */
helpers.getCssPropertyValue = function(htmlFragment, propertyName) {
	var tmpElem = $(htmlFragment).hide().appendTo("body");
    var propertyValue = tmpElem.css(propertyName);
    tmpElem.remove();
    return propertyValue;
}

/**
 * Scales given value with the given function.
 * @param {Chart} chart
 * @param {String} axisId "x" or "y"
 * @param {Number} value
 * @param {Function} scaleFn
 */
helpers.scaleValue = function(chart, axisId, value, scaleFn) {
	return value === 0 ? 0 : scaleFn(value);
};

// why doesn't underscore's isEmpty work like this?
helpers.isEmpty = function(value) {
	return typeof(value) === "undefined" || value == null;
};

helpers.getRandomNumber = function(n) {
	return Math.floor(Math.random() * n) + 1;
};

helpers.indexOfProperty = function(arr, obj, propertyName) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i][propertyName] === obj[propertyName]) {
			return i;
		}
	}
	
	return -1;
};

/**
 * Gets the difference in months between two dates.
 * @firstDate {Date}  a date to compare
 * @secondDate {Date}  if not given, uses the current date
 */
helpers.getMonthsElapsed = function(firstDate, secondDate) {
	var firstMoment = moment(firstDate);
	var secondMoment = helpers.isEmpty(secondDate) ? moment() : moment(secondDate);
	return Math.abs(firstMoment.diff(secondMoment, "month"));
};

helpers._getDate = function(d) {
    return new Date(d.label);
};

helpers._cloneAndSort = function(arr, sorter) {
	var clonedArr = arr.slice(0);
	clonedArr.sort(sorter);
	return clonedArr;
};

/**
 * Finds the previous value in the array that is not the same as the last value.
 * @param {Object[]} sortedArr
 * @param {Integer} index  optional first call, calculated for the recursive calls
 */
helpers._findSecondToLastUniqueValue = function(sortedArr, index) {
	switch (sortedArr.length) {
		case 0:
			return null;
		
		case 1:
		case 2:
			return sortedArr[0].value;
		
		default:
			if (helpers.isEmpty(index)) {
				index = sortedArr.length - 2;
			}
			
			if ((index === 0) || (sortedArr[index].value !== _.last(sortedArr).value)) {
				return sortedArr[index].value;
			}
			
			else {
				return helpers._findSecondToLastUniqueValue(sortedArr, index - 1);
			}
	}
};

/**
 * Finds the next value in the array that is not the same as the first value.
 * @param {Object[]} sortedArr
 * @param {Integer} index  optional first call, calculated for the recursive calls
 */
helpers._findSecondUniqueValue = function(sortedArr, index) {
	switch (sortedArr.length) {
		case 0:
			return null;
		
		case 1:
			return sortedArr[0].value;
		
		case 2:
			return sortedArr[1].value;
		
		default:
			if (helpers.isEmpty(index)) {
				index = 1;
			}
			
			if ((index === sortedArr.length - 1) || sortedArr[index].value !== _.first(sortedArr).value) {
				return sortedArr[index].value;
			}
			
			else {
				return helpers._findSecondUniqueValue(sortedArr, index + 1);
			}
	}
};
