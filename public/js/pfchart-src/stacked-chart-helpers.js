var stackedChartHelpers = {};

stackedChartHelpers.init = function(chart) {
	if (!chart._stack) {
		throw new Error("stack parameter required for " + chart.__proto__.constructor.name);
	}
	
	var boundFn = _.bind(chart._stack.stackFn, chart);
	var stackedData = boundFn();
	var stack = d3.layout.stack()
		// map d3's y0/y to our d.value0/d.value
		.out(function (d, y0, y) { d.value0 = y0; d.value = y; })
		(stackedData);

	chart.data(stack);
};

stackedChartHelpers.getFirstLayerArr = function(chart) {
	var firstLayerArr = chart._data[0];
	
	if (!_.isArray(firstLayerArr)) {
		throw new Error("Expected array, but found [" + typeof(firstLayerArr) + "]: " + firstLayerArr);
	}
	
	return firstLayerArr;
};

/**
 * Prepares data for d3.layout.stack if we have all-data/subset-of-data
 * (e.g., All Patients / Single Provider's Patients).
 * @param {Object} chart
 */
stackedChartHelpers.subsetStackFn = function(chart) {
	return ["_subset", "_data"].map(function(layerFieldName) {
		
		var dataArr = [];
		
		for (var i = 0; i < chart._data.length; i++) {
			dataArr.push({
				label: chart._tickLabelFn(chart._data[i]),
				y: chart[layerFieldName][i].value
			});
		}
		
		return dataArr;
	});
};
