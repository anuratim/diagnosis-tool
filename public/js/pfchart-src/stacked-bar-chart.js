function StackedBarChart(config) {
	this.config(config);
}

_.extend(StackedBarChart.prototype, Chart.prototype);

StackedBarChart.prototype.chart = function(selection) {
	stackedChartHelpers.init(this);
	
	var self = this;
	
	this.xDomain(helpers.zeroToLayeredMax);
	this.xDomain(this._xDomain(this._data));
	this._xScale.domain(this._xDomain).range([0, this.getXViewport()]);
	
	var firstLayerArr = stackedChartHelpers.getFirstLayerArr(this);
	this.yDomain(firstLayerArr.map(function(d) {
		//TODO: this should be encapsulated in self._range.tickLabelFn
		return self._range ? d.label : self._tickLabelFn(d);
	}));
	this._yScale.domain(this._yDomain).rangeRoundBands([this.getYViewport(), 0]);
};

StackedBarChart.prototype.draw = function() {
	var self = this;
	
	// add a class for each layer
	var bands = this.svgElem.selectAll("g.band")
		.data(this.data())
		.enter().append("g")
		.attr("class", function(d, i) { return "band band-" + (i + 1); });
	
	// add a bar for each value
	var selection = bands.selectAll("rect")
		.data(Object)
		.enter().append("rect");
		
	var barHeight = self._yScale.rangeBand();
	var barHeightSpacing = 0;
	
	barChartHelpers.drawBars(this, selection, barHeight, barHeightSpacing);
	//barChartHelpers.addBarLabels(this, this._subset, barHeight);
	//barChartHelpers.addBarLabels(this, this.data()[0], barHeight);
};
