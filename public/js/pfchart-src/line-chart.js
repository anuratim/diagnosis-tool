function LineChart(config) {
	this.clipId = "line-chart-clip";
	this.drawDelay = 50;
	this.drawWidth = 0;
	this.drawWidthIncrement = 50;
	this.intervalId = -1;

	this.config(config);
}

_.extend(LineChart.prototype, Chart.prototype);

LineChart.prototype.chart = function(selection) {
	this.ticks({ x: this._data.length, y: this._data.length });
	this.setDefaultXDomainAndScale();
	this._xScale.range([0, this.getXViewport()]);
	
	this.setDefaultYDomainAndScale();
	this._yScale.range([this.getYViewport(), 0]);
};

LineChart.prototype.draw = function(selection) {
	var self = this;
	
	var line = d3.svg.line()
		.x(function(d) { return self._xScale(d.label); })
		.y(function(d) { return self._yScale(d.value); });
	
	this.hide();
	this.drawCircles();
	
	// draw line (still hidden)
	this.appendHidden(this.svgElem, "g")
		.append("path")
		.datum(this.data())
		.attr("d", line);
	
	// show line on a delay by widening clipPath
	this.intervalId = setInterval(_.bind(this.show, this), this.drawDelay);
};

/**
 * Widens viewport on line and circles until entire line is shown.
 */
LineChart.prototype.show = function() {
	// draw a rectangle in which all contents will be shown
	d3.select("#" + this.clipId)
		.append("rect")
			// move rectangle off (0, 0) or rect will hide the axes
			.attr("x", 1)
			.attr("y", 1)
			.attr("width", this.drawWidth)
			.attr("height", this._height);

	this.drawWidth += this.drawWidthIncrement;
	
	if (this.drawWidth >= this._width) {
		clearInterval(this.intervalId);
		this.enableToolTips();
	}
};

LineChart.prototype.hide = function() {
	// set clipPath to hide line
	this.svgElem
		.append("defs")
			.append("clipPath")
				.attr("id", this.clipId);
};

LineChart.prototype.appendHidden = function(d3Elem, tagName) {
	var newElem = this.svgElem.append(tagName);
	newElem.attr("clip-path", "url(#" + this.clipId + ")");
	return newElem;
};

LineChart.prototype.drawCircles = function() {
	var self = this;
	
	// draw circle for each point
	var data = this.data();
	for (var i = 0; i < data.length; i++) {
		var d = data[i];
		
		var circle = this.appendHidden(this.svgElem, "circle")
			.datum(d)
			.attr("class", constants.CIRCLE_CLS_NAME)
			.attr("r", 3.5)
			.attr("cx", this._xScale(d.label))
			.attr("cy", this._yScale(d.value));
	}
};
