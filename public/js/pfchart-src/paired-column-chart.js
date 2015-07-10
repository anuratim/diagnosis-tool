function PairedColumnChart(config) {
	this.config(config);
}

_.extend(PairedColumnChart.prototype, Chart.prototype);

PairedColumnChart.prototype.chart = function(selection) {
	var self = this;
	
	this.setDefaultXDomainAndScale();
	this.xDomain(d3.range(this._data.length));
	this._xScale.domain(this._xDomain).rangeRoundBands([0, this.getXViewport()], pairedChartHelpers.INNER_PADDING, pairedChartHelpers.OUTER_PADDING);
	
	this.setDefaultYDomainAndScale();
	this._yScale.range([this.getYViewport(), 0]);
};

PairedColumnChart.prototype.draw = function() {
	var self = this;
	
	// bar-pairs
	var pairsElem = this.svgElem.selectAll(".pair")
		.data(this.data())
		.enter().append("g")
			.attr("class", "pair")
			.attr("transform",function(d, i) { return "translate(" + self._xScale(i) + ",0)"; });

	this.addColumn(pairsElem, 0);
	this.addColumn(pairsElem, 1);
	this.addColumnLabel(pairsElem, 0);
	this.addColumnLabel(pairsElem, 1);
};

PairedColumnChart.prototype.addColumn = function(pairsElem, index) {
	var self = this;
	var valueProp = index == 0 ? "value0" : "value";
	
	pairsElem.append("rect")
		.attr("class", function(d, j) {return self._getClassName(d, index, j); })
		.attr("x", index === 0 ? self._xScale.rangeBand() / 2 : 0)
		.attr("width", self._xScale.rangeBand() / 2)
		.attr("y", self.getYViewport())
		.attr("height", 0)
		.transition()
		.duration(constants.TRANSITION_DURATION)
		.attr("y", function(d) { return self._yScale(d[valueProp]); })
		.attr("height", function(d) { return self.getYViewport() - self._yScale(d[valueProp]); });
};

PairedColumnChart.prototype.addColumnLabel = function(pairsElem, index) {
	var self = this;
	var valueProp = index == 0 ? "value0" : "value";
	
	pairsElem.append("text")
		.attr("x", 0)
		.attr("y", function(d) { return self._yScale(d[valueProp]) - 15; })
		.attr("dy", 10)
		.attr("dx", (index === 0 ? 3 : 1) * (self._xScale.rangeBand() / 4))
		.transition()
		.delay(constants.TRANSITION_DURATION)
		.text(function(d) {
			var val = d[valueProp];
			
			// do type-insensitive check (==) because values might be stringified numbers
			if (val == 0) {
				return "";
			}
			
			else if (self._labelFn) {
				return self._labelFn(val);
			}
			
			else {
				return val;
			}
		});
};


PairedColumnChart.prototype._getClassName = function(d, i, j) {
	return this._cssClassNameFn ? this._cssClassNameFn(d, i, j) : "pair-" + (i + 1)
};
