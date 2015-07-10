/**
 * Defines defaults for each chart type,
 * which can be over-written by each view's config.
 */
var defaults = {};

defaults.AreaChart = {
	width: 800,
	height: 400,
	container: ".module",
	xScale: d3.time.scale(),
	yScale: d3.scale.linear(),
	xDomain: helpers.minToMax,
	yDomain: helpers.zeroToMax,
	dateFormat: "%d-%b-%y"
};

defaults.BarChart = {
	width: 500,
	height: 600,
	xScale: d3.scale.linear(),
	yScale: d3.scale.ordinal(),
	xDomain: helpers.zeroToMax,
	sortBy: helpers.sortByLabelDesc
};

defaults.StackedBarChart = {
	xScale: d3.scale.linear(),
	yScale: d3.scale.ordinal()
};

defaults.StackedColumnChart = {
	xScale: d3.scale.ordinal(),
	yScale: d3.scale.linear()
};

defaults.PairedColumnChart = {
	xScale: d3.scale.ordinal(),
	yScale: d3.scale.linear(),
	yDomain: helpers.zeroToMax
};

defaults.LineChart = {
	width: 800,
	height: 400,
	xScale: d3.time.scale(),
	yScale: d3.scale.linear(),
	xDomain: helpers.minToMaxDates,
	yDomain: helpers.zeroToMax
};

defaults.LineLabelledChart = {
	width: 800,
	height: 400,
	xScale: d3.scale.linear(),
	yScale: d3.scale.linear(),
	xDomain: helpers.minToMax,
	yDomain: helpers.zeroToMax
};

defaults.ScatterChart = {
	width: 800,
	height: 400,
	xScale: d3.scale.linear(),
	yScale: d3.scale.linear(),
	xDomain: helpers.minToMax,
	yDomain: helpers.minToMax
};
