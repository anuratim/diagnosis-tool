function ScatterChart(config) {
	this.RADIUS = 3.5;
	this.config(config);
}

_.extend(ScatterChart.prototype, Chart.prototype);

ScatterChart.prototype.chart = function (selection) {
	this._xScale.range([0, this.getXViewport()]);
	this.xDomain(this._xDomain(this._data.map(function(d) { return {value: d.label}; })));
	this._xScale.domain(this._xDomain);
	
	this._yScale.range([this.getYViewport(), 0]);
	this.setDefaultYDomainAndScale();
};

ScatterChart.prototype.draw = function () {
	this.drawCircles();
};

/**
 * Adds pre-existing circles to chart,
 * useful for moving circles from one chart to another.
 * @param {Object} circleArr
 * @param {Object} onBeforeMoveCircle
 */
ScatterChart.prototype.drawCircles = function(circleArr, onBeforeMoveCircle) {
	var appendNewCircle = !circleArr;
	var dataLength = this._data.length;
	
	//console.log("numCircles [" + (circleArr ? circleArr.length : "null") + "], dataLength [" + dataLength + "]");
	
	// if we're adding pre-existing circles
	if (!appendNewCircle) {
		var numCircles = circleArr.length;
		//console.log("num circles [" + numCircles + "], num data items [" + dataLength + "]");
		
		if (numCircles !== dataLength) {
			throw new Error("UI and model are out-of-sync: [" + numCircles + "] circles, [" + dataLength + "] data items");
		}
	}
	
	var self = this;
	var d;
	var circle;
	var id;
	
	for (var i = 0; i < dataLength; i++) {
		d = this._data[i];
		d.id = "dot-" + i;
		
		circle = appendNewCircle ? this.svgElem.append("circle") : d3.select(circleArr[i]);
    	
    	// event handlers (.on) have to be added before transitions
    	circle
    		.attr("id", d.id)
			.attr("class", constants.CIRCLE_CLS_NAME)
			.on("mouseover", function() { self._toggle(this, true); })
			.on("mouseout", function() { self._toggle(this, false); })
		
		// set transition
		if (onBeforeMoveCircle) {
    		circle = onBeforeMoveCircle(circle);
    	}
    	
    	// default transition is to hide/show the circles
    	else {
    		circle
    			.attr("opacity", 0)
		    	.transition()
		    	.duration(constants.TRANSITION_DURATION)
		    	.attr("opacity", 1);
    	}
    	
    	circle
		    .attr("r", this.RADIUS)
		    .attr("cx", self._xScale(d.label))
		    .attr("cy", self._yScale(d.value))
	}
	
	// bind data to all the circles we just added
	d3.selectAll("." + constants.CIRCLE_CLS_NAME).data(this._data);
};

ScatterChart.prototype._toggle = function(detachedElem, highlight) {
	var d3Elem = d3.select(detachedElem);
	d3Elem.classed("highlight", highlight);
	
	var eventType = highlight ? "select" : "deselect";
	var id = d3Elem.attr("id");
	//console.log("ScatterChart#_toggle, broadcasting " + eventType + " event with id [" + id + "]");
	$.event.trigger({ type: eventType, id: id });
};
