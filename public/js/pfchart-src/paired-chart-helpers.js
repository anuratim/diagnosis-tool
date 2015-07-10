var pairedChartHelpers = {};

// padding is in range [0, 1]
pairedChartHelpers.INNER_PADDING = 0.3;
pairedChartHelpers.OUTER_PADDING = 0.1;

/**
 * Converts data from its raw-state to the format needed by PairedColumnChart.
 * @param {Object[]} rawData
 * @param {Range} range
 * @param {String} filterProperty
 * @param {Object} filterValue
 */
pairedChartHelpers.transformDataForChart = function(rawData, range, filterProperty, filterValue) {
	var data = [];
	var allRanges = range.mapCount(rawData);
	var filteredRanges = range.mapCount(rawData.filter(function(item) {
		return item[filterProperty] === filterValue;
	}));
	
	for (var i = 0; i < allRanges.length; i++) {
		data.push({value: allRanges[i].percent, value0: filteredRanges[i].percent});
	}
	
	return data;
};