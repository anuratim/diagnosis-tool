function StackedColumnChart(config) {
	this.config(config);
}

_.extend(StackedColumnChart.prototype, Chart.prototype);

StackedColumnChart.prototype.chart = function(selection) {
	stackedChartHelpers.init(this);
	
	var firstLayerArr = stackedChartHelpers.getFirstLayerArr(this);

	var self = this;
	
	this.xDomain(firstLayerArr.map(function(d) { return self._tickLabelFn(d); }));
	this._xScale.domain(this._xDomain).rangeRoundBands([0, this.getXViewport()]);
	
	this.yDomain(helpers.zeroToLayeredMax);
	this.yDomain(this._yDomain(this._data));
	this._yScale.domain(this._yDomain).range([this.getYViewport(), 0]);
};

StackedColumnChart.prototype.draw = function() {
	var self = this;
	
	// add a class for each layer
	var bands = this.svgElem.selectAll("g.band")
		.data(this.data())
		.enter().append("g")
		.attr("class", function(d, i) { return "band band-" + (i + 1); });
	
	// add a column for each value
	var columns = bands.selectAll("rect")
		.data(Object)
		.enter().append("rect")
		.attr("x", function(d) { return self._xScale(self._tickLabelFn(d)); })
		.attr("width", self._xScale.rangeBand())
		// y starts from top of previous band
		.attr("y", function(d) {
			var scaledValue = self._yScale(d.value0 + d.value);
			//var scaledValue = helpers.scaleValue(self, "y", d.value0 + d.value, self._yScale);
			//console.log("yScaledValue [" + scaledValue + "], total [" + (d.value0 + d.value) + "], d", d);
			return scaledValue;
		})
		.attr("y", self.getYViewport())
		.attr("height", 0)
		.transition()
		.duration(constants.TRANSITION_DURATION)
		.attr("y", function(d) {
			var scaledValue = self._yScale(d.value0 + d.value);
			//var scaledValue = helpers.scaleValue(self, "y", d.value0 + d.value, self._yScale);
			//console.log("yScaledValue [" + scaledValue + "], total [" + (d.value0 + d.value) + "], d", d);
			return scaledValue;
		})
		.attr("height", function(d) {
			var scaledValue = helpers.scaleValue(self, "y", d.value, self._yScale);
			//console.log("height scaledValue [" + scaledValue + "], d", d);
			return scaledValue === 0 ? 0 : self.getYViewport() - scaledValue;
		});
};
