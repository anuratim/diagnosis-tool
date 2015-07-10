/**
 * Adds brushing to a Chart.
 * @param {Chart} chart  the Chart where we're adding the d3.svg.brush
 * @param {String} axisId  "x" or "y," the axis along which to draw the brush
 * 
 * To automatically configure brushes on both axes with all defaults:
 * config: {
 *     brushes: {
 * 	       x: {},
 *         y: {}
 *    }
 * }
 * 
 * Within the x and/or y hashes, you can define the initial brush-range by one of the following:
 * brushPosition: { position: constants.ORIENTATION.bottom, percentage: .5 } }
 * range: [4, 12]
 */
function Brush(chart, axisId) {
	this.BRUSH_SIZE = 20;
	this.chart = chart;
	this.axisId = axisId;
	
	switch(this.axisId) {
		case "x":
			this.propertyName = "label";
			this.otherPropertyName = "value";
			break;
		
		case "y":
			this.propertyName = "value";
			this.otherPropertyName = "label";
			break;
		
		default:
			throw new Error("Unexpected axisId [" + axisId + "].");
	}
	
	/***** overwrite brushPosition or range if you want to customize the initial range of the brush *****/
	this.brushPosition = {
		// default to high values
		position: this.axisId === "x" ? constants.ORIENTATION.right : constants.ORIENTATION.top,
		// a float between 0 and 1, the initial size of the brush, as a percentage of the chart width or height
		percentage: .33
	};
	
	// the range of the brush extent
	this.range = [-1, -1];
	
	// register this brush with the Chart's BrushManager
	chart.addBrush(this);
}

Brush.prototype.draw = function(show) {
	if (helpers.isEmpty(show)) {
		show = true;
	}
	
	//console.log("Brush#draw, show? [" + show + "]");
	var self = this;
	this.d3Brush = d3.svg.brush();
	var xPos = 0;
	var yPos = 0;
	
	switch(this.axisId) {
		case "x":
			yPos = this.chart.getYViewport() - this.BRUSH_SIZE;
			this.d3Brush.x(this.chart._xScale);
			break;

		case "y":
			this.d3Brush.y(this.chart._yScale);
			break;
	}
	
	var startRange = this._calculateStartRange(this.axisId);
	this.d3Brush.extent(startRange);
	
	this.brushElem = this.chart.svgElem.append("g")
		.attr("class", "brush")
		.attr("transform", function(d) { return "translate(" + xPos + "," + yPos + ")"; })
		.call(this.d3Brush);
		
	// add brush handles
	this.brushHandles = new BrushHandles(this.brushElem, this.axisId, this.BRUSH_SIZE);
	this.brushHandles.draw(show);
	
	this.hide();
	
	// show transition
	if (show) {
		this.show();
	}
	
	this.d3Brush
		.on("brushstart", _.bind(this._start, this))
		.on("brush", _.bind(this._move, this))
		.on("brushend", _.bind(this._end, this));
};

Brush.prototype.show = function() {
	// make sure the data gets re-attached if it's become detached
	this.chart.svgElem
		.selectAll("circle." + constants.CIRCLE_CLS_NAME)
		.data(this.chart._data);
		
	this.brushElem
		.selectAll("rect")
		.transition()
		.duration(constants.TRANSITION_DURATION)
		.attr(this.axisId === "x" ? "height" : "width", this.BRUSH_SIZE)
		.attr("opacity", 1);

	this.brushHandles.show();
	this._initSelection();
};

Brush.prototype.hide = function() {
	this.brushElem
		.selectAll("rect")
		.attr("opacity", 0);

	this.brushHandles.hide();
};

Brush.prototype._initSelection = function() {
	this._start();
	this._move();
	this._end();
};

Brush.prototype._start = function() {
	this.chart.svgElem.classed("selecting", true);
};

/**
 * Reselects chart elements as brush is moved.
 */
Brush.prototype._move = function() {
	this.chart.brushManager().select(this);
};

Brush.prototype._end = function() {
	this.chart.svgElem.classed("selecting", true);
	
	// always show brush handles, even when no selection: otherwise, very confusing for user
	this.chart.svgElem
		.selectAll("g.resize")
		.style("display", "block");
};

/**
 * Ensures that min is less than max, swapping array elements if necessary.
 * @param {Object[2]} arr
 */
Brush.prototype._checkMinMax = function(arr) {
	if (!arr || arr.length !== 2) {
		throw new Error("Expected array with two elements, but found " + (arr ? "an array with [" + arr.length + "] elements" : "[" + arr + "]") + ".");
	}
	
	if (arr[0] > arr[1]) {
		var tmpMin = arr[0];
		arr[0] = arr[1];
		arr[1] = tmpMin;
	}
	
	return arr;
};

Brush.prototype._calculateStartRange = function(axisId) {
	// if a brush range has been set
	if (this.range[0] >= 0 && this.range[1] >= 0) {
		var domainArr = this.chart.getDomainArr(axisId);
		//console.log("axisId [" + axisId + "], domainArr", domainArr, "rangeArr", this.range);
		return this._checkStartRange(axisId, domainArr, this.range);
	}
	
	else if (this.range[0] >= 0 || this.range[1] >= 0) {
		throw new Error("Expected both minimum and maximum values for range, but found [" + this.range[0] + "-" + this.range[1] + "].");
	}
	
	// no range has been set: calculate percentage
	else {
		this._checkBrushPosition(this.axisId, this.brushPosition);
		var percentageRange = this._getPercentageStartRange(axisId);
		//console.log("percentageRange for axisId [" + axisId + "]", percentageRange);
		return percentageRange;
	}
};

Brush.prototype._getPercentageStartRange = function(axisId) {
	//console.log("axisId [" + axisId + "], brushPos [" + this.brushPosition.position + "], isDomainAscending [" + isDomainAscending + "], setInMinPosition [" + setInMinPosition + "]");
	
	var isXAxis = axisId === "x";
	var axisLength = isXAxis ? this.chart.getXViewport() : this.chart.getYViewport();
	var scale = isXAxis ? this.chart._xScale : this.chart._yScale;
	var invertFn = scale.invert;
	
	return this._calculatePercentageStartRange(axisLength, this.brushPosition.position, this.brushPosition.percentage, invertFn);
};

Brush.prototype._shouldSetBrushInMinimumPosition = function(brushPosition, isDomainAscending) {
	var o = constants.ORIENTATION;
	
	switch(brushPosition) {
		case o.left:
		case o.top:
			return isDomainAscending;

		case o.right:
		case o.bottom:
			return !isDomainAscending;

		default:
			throw new Error("Unexpected brush position [" + this.brushPosition + "].");
	}
};

Brush.prototype._calculatePercentageStartRange = function(axisLength, brushPosition, percent, invertFn) {
	var min = invertFn(0);
	var max = invertFn(axisLength);
	var isDomainAscending = min < max;
	var setInMinPosition = this._shouldSetBrushInMinimumPosition(brushPosition, isDomainAscending);
	
	//console.log("#_calculatePercentageStartRange, min [" + min + "], max [" + max + "], setInMinPosition [" + setInMinPosition + "]");
	
	// swap min and max if we have a descending domain
	var arr = this._checkMinMax([min, max]);
	min = arr[0];
	max = arr[1];
	
	if (setInMinPosition) {
		max *= percent;
	}
	
	else {
		min = max * (1 - percent);
	}

	return [min, max];
};

Brush.prototype._checkBrushPosition = function(axisId, brushPosition) {
	var pos = brushPosition.position;
	var o = constants.ORIENTATION;
	var validBrushPositionArr = axisId === "x" ? [o.left, o.right] : [o.top, o.bottom];
	
	if (pos !== validBrushPositionArr[0] && pos !== validBrushPositionArr[1]) {
		throw new Error("A brush along the " + axisId + " axis can only be positioned left or right, but received [" + pos + "].");
	}
	
	else {
		var percent = brushPosition.percentage;
		if (percent <= 0 || percent >= 1) {
			throw new Error("A brush percentage must be between 0 and 1, exclusive, but received [" + percent + "].");
		}
		
		else {
			return brushPosition;
		}
	}
};

Brush.prototype._checkStartRange = function(axisId, readOnlyDomainArr, rangeArr) {
	// clone the array for checking
	var domainArr = readOnlyDomainArr.slice(0);
	
	if (helpers.isEmpty(domainArr) || helpers.isEmpty(domainArr[0]) || helpers.isEmpty(domainArr[1])) {
		throw new Error("No domain set for chart.");
	}
	
	else {
		this._checkMinMax(domainArr);
		
		if (rangeArr[0] < domainArr[0]) {
			throw new Error("Brush range minimum [" + rangeArr[0] + "] is less than smallest value [" + domainArr[0] + "] for axis [" + axisId + "].");
		}
		
		else if (rangeArr[1] > domainArr[1]) {
			throw new Error("Brush range maximum [" + rangeArr[1] + "] is greater than largest value [" + domainArr[1] + "] for axis [" + axisId + "].");
		}
		
		else if (rangeArr[0] >= rangeArr[1]) {
			throw new Error("Invalid brush range [" + rangeArr[0] + "-" + rangeArr[1] + "].");
		}
		
		else {
			return rangeArr;
		}
	}
};
