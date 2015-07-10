/**
 * Adds a gradient axis to a Chart.
 * @param {Chart} chart
 * @param {String} axisId
 * @param {Range} range  the thresholds to determine how the gradient should be drawn
 */
function AxisGradient(chart, axisId, range) {
	this.chart = chart;
	this.axisId = axisId;
	this.range = range;
	this.isDomainAscending = chart.isDomainAscending(axisId);
	this.TAG_NAME = "path";
	this.CLS_NAME = this.axisId + "-axis";
	this.SELECTOR = this.TAG_NAME + "." + this.CLS_NAME;
}

AxisGradient.prototype.draw = function() {
	switch (this.axisId) {
		case "x":
			this.drawXAxisGradient();
			break;
		
		case "y":
			this.drawYAxisGradient();
			break;
		
		default:
			throw new Error("Unexpected axisId [" + this.axisId + "].");
	}
	
	this.hideDefaultAxis();
};

AxisGradient.prototype.show = function() {
	this.checkGradientPaths()
		.transition()
		.duration(constants.TRANSITION_DURATION)
		.attr("opacity", 1);
};

AxisGradient.prototype.hide = function() {
	this.checkGradientPaths()
		.attr("opacity", 0);
};

AxisGradient.prototype.drawXAxisGradient = function() {
	var self = this;

	var xLine = d3.svg.line()
		.x(function(d) { return self.chart._xScale(d); })
		.y(this.chart.getYViewport())
		.interpolate("linear");

	var maxX = this.chart._xScale.invert(this.isDomainAscending ? this.chart.getXViewport() : 0);
	
	this.drawAxisGradient(xLine, maxX);
};

AxisGradient.prototype.drawYAxisGradient = function() {
	var self = this;
		
	var yLine = d3.svg.line()
		.x(0)
		.y(function(d) { return self.chart._yScale(d); })
		.interpolate("linear");

	var maxY = this.chart._yScale.invert(this.isDomainAscending ? 0 : this.chart.getYViewport());
	
	this.drawAxisGradient(yLine, maxY);
};

AxisGradient.prototype.drawAxisGradient = function(line, maxAxisValue) {
	// build lines for each class range
	var pathInfo = [];
	var thresholds = this.range.valueThresholds;
	var numThresholds = thresholds.length;
	
	for (var i = 0; i < numThresholds; i++) {
		pathInfo.push([
			thresholds[i],
			i === (numThresholds - 1) ? maxAxisValue : thresholds[i + 1]
		]);
	}
	
	var self = this;
	
	this.getGradientPaths()
		.data(thresholds)
		.enter()
		.append(this.TAG_NAME)
		.attr("class", function(d, i) { return self.CLS_NAME + " " + self.getGradientClsName(d, self.range); })
		.attr("opacity", 0)
		.attr("d", function(d, i) { return line(pathInfo[i]); });

	if (this.chart.drawImmediately()) {
		this.show();
	}
};

AxisGradient.prototype.getGradientPaths = function() {
	return this.chart.svgElem.selectAll(this.SELECTOR);
};

AxisGradient.prototype.checkGradientPaths = function() {
	var paths = this.getGradientPaths();
	
	if (paths[0].length === 0) {
		throw new Error("No paths for selector [" + this.SELECTOR + "].");
	}
	
	return paths;
};

AxisGradient.prototype.getGradientClsName = function(d) {
	for (var i = 0; i < this.range.valueThresholds.length; i++) {
		if (d <= this.range.valueThresholds[i]) {
			return this.range.cssClassNames[i];
		}
	}
	
	return _.last(this.range.cssClassNames);
};

AxisGradient.prototype.hideDefaultAxis = function() {
	d3.select("#" + this.chart._idPrefix + this.axisId + "-axis path")
		.style("stroke-width", "0");
};
