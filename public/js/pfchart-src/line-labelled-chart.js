function LineLabelledChart(config, range) {
	this.LABELS_WIDTH = 150;
	this.ALPHA = 1.5;
	this.SPACING = 12;
	this.range = range;
	this.config(config);
}

_.extend(LineLabelledChart.prototype, Chart.prototype);

LineLabelledChart.prototype.chart = function(selection) {
	this.xScale().domain([_.first(this.range), _.last(this.range)]);
	this.xScale().range([0, this.getXViewport()]);
	
	var lineData = _(this.data()).chain().pluck("values").flatten().value();
	this.yDomain(helpers.minToMax);
	this.yScale().domain(this._yDomain(lineData));
	this.yScale().range([this.getYViewport(), 0]);
	
	var _self = this;
	this.lines = this.data().map(function(d) {
		var lastValue = _.last(d.values).value;
		var scaledValue = _self._yScale(lastValue);
		return {
			label: d.label,
			y: scaledValue
		}
	});
	
	return this;
};

LineLabelledChart.prototype.draw = function() {
	var svg = d3.select("svg");
	var newWidth = +svg.attr("width") + this.LABELS_WIDTH;
	svg.attr("width", newWidth);
	
	this.addSeries();
	this.labelXPos = this._xScale(_.last(this.range));
	d3.timer(_.bind(this.positionLabels, this));
	return this;
};

LineLabelledChart.prototype.addSeries = function() {
	var _self = this;
	var line = d3.svg.line()
	    .interpolate("basis")
	    .defined(function(d) { return _self.hasValue(d); })
		.x(function(d, i) { return _self._xScale(_self.range[i]); })
	    .y(function(d) { return _self._yScale(d.value); });

	var series = this.svgElem.selectAll(".series")
		.data(this.data())
		.enter().append("g")
		.attr("class", "series");

	series.append("path")
		.attr("d", function(d) { return line(d.values); })
		.style("stroke", function(d, i) { return _self.getHclColor(i); })
		.attr("class", "active")
		.attr("d", function(d) { return line(d.values); });
	
	series.append("text")
		.attr("class", "label active")
		.data(this.lines)
		.style("fill", function(d, i) { return _self.getHclColor(i); })
		.text(function(d) { return d.label; });
	
	series.selectAll(".active")
		.on("mouseover", _.bind(function(data) { _self.onMouseOver(data); }, this))
		.on("mouseout", _.bind(this.onMouseOut, this));
};

LineLabelledChart.prototype.positionLabels = function() {
	var again = false;
	var _self = this;
	_self.lines.forEach(function(a, i) {
		_self.lines.slice(i + 1).forEach(function(b) {
			var dy = a.y - b.y;
			if (Math.abs(dy) < _self.SPACING) {
				again = true;
				var sign = dy > 0 ? 1 : -1;
				a.y += sign * _self.ALPHA;
				b.y -= sign * _self.ALPHA;
			}
		});
	});
	
	var nodes = d3.selectAll(".label");
	nodes.attr("transform", function(data) { return "translate(" + _self.labelXPos + "," + data.y + ")"; });
	return !again;
};

LineLabelledChart.prototype.hasValue = function(d) {
	if (d === null || d.value === null) {
		return false;
	}
	
	else {
		var type = typeof(d.value);
		if (type === "number") {
			return true;
		} else {
			throw new Error("Found unexpected type [" + type + "] for:", d.value);
		}
	}
}

LineLabelledChart.prototype.getColor = function(selectedSeries, line, index) {
	return selectedSeries.label == line.label ? this.getHclColor(index) : constants.DESELECTED_COLOR;
};

LineLabelledChart.prototype.getHclColor = function(index) {
	return d3.hcl(55 * index, 55, 38).toString();
};

LineLabelledChart.prototype.onMouseOver = function(selectedSeries) {
	//console.log(selectedSeries);
	var _self = this;
	d3.selectAll(".series path")
		.classed("hover", function(line) { return line.label == selectedSeries.label; })
		.style("stroke", function(line, i) { return _self.getColor(selectedSeries, line, i); });
			
	d3.selectAll(".series text")
		.classed("hover", function(line) { return line.label == selectedSeries.label; })
		.style("fill", function(line, i) { return _self.getColor(selectedSeries, line, i); });
};

LineLabelledChart.prototype.onMouseOut = function() {
	var _self = this;
	d3.selectAll(".series path")
		.classed("hover", false)
		.style("stroke", function(line, i) { return _self.getHclColor(i); });
	
	d3.selectAll(".series text")
		.classed("hover", false)
		.style("fill", function(line, i) { return _self.getHclColor(i); });
};
