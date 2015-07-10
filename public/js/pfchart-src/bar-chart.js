function BarChart(config) {
	this.includeBarLabels = true;
	this.config(config);
}

_.extend(BarChart.prototype, Chart.prototype);

BarChart.prototype.chart = function(selection) {
	this.setDefaultXDomainAndScale();
	this.setDefaultYDomainAndScale();
	
	this.xScale().range([0, this.getXViewport()]);
	var innerPadding = 0;
	this.yScale().rangeRoundBands([this.getYViewport(), 0], innerPadding);
};

BarChart.prototype.draw = function () {
	var self = this;
	
	// sort first, then draw the axes and bars around the new order
	this.sort();
	
	var numDataItems = this.data().length;
	var barHeightSpacing = 2;

	this.barHeight = this._yScale.rangeBand();
	this.barHeight = Math.max(this.barHeight, barHeightSpacing);
	
	this._bars = this.svgElem
		.selectAll('rect')
		.data(this.data(), function (d) { return self._tickLabelFn(d); });

	// remove any old bars still hanging around
	this._bars
		.exit()
		.remove();

	this._bars
		.enter()
		.insert('rect');
	
	barChartHelpers.drawBars(this, this._bars, this.barHeight, barHeightSpacing);
	
	var a = this.axes();
	if (a) {
		if (a.x && a.x.orientation) {
			this.setAxis(this.getAxisElem("x"), this.xScale(), a.x.orientation);
		}
		
		if (a.y && a.y.orientation) {
			this.setAxis(this.getAxisElem("y"), this.yScale(), a.y.orientation);
		}
	}
	
	if (this.includeBarLabels) {
		barChartHelpers.addBarLabels(this, this.data(), this.barHeight);
	}
};

BarChart.prototype.sort = function () {
	var self = this;
	this._yScale.domain(
		this.data().sort(this._sortBy).map(function (d) { return self._tickLabelFn(d); })
	).copy();
};

BarChart.prototype.getLabelDisplay = function(barWidth, labelTxt) {
	if (_.str.isBlank(labelTxt)) {
		console.log("No labelTxt for barWidth [" + barWidth + "].");
		return "";
	}
	
	else {
		var labelTxtLength = new String(labelTxt).length;
		
		if ((labelTxtLength + barWidth) >= this.MIN_BAR_WIDTH_FOR_LABEL) {
			return labelTxt.toLocaleString();
		}
		
		else {
			return "";
		}
	}
}
