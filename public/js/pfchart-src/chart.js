function Chart() {}

Chart.prototype.config = function (config) {
	var name = this.__proto__.constructor.name;
	//console.log("#config, name", name);
	
	this.idPrefix(name + "-");
	
	// initialize state with subclass's default values
	var master = defaults[name];
	
	if (!master) {
		throw new Error("No defaults defined for chart type [" + name + "] in defaults.js.");
	}
	
    // overwrite any default config values with those that have been passed in
	for (var key in config) {
		master[key] = config[key];
	}
	
    // if config key is a chart accessor, call and set with value from master
	for (var key in master) {
		if (typeof(this[key]) === "function") {
			var paramValue = master[key];
			
			switch (typeof(paramValue)) {
				case "undefined":
					throw new Error("No value for key [" + key + "].");
				default:
					this[key](paramValue);
					break;
			}
		}
		
		// "container" and "svgElem" are the only keys we don't set with a setter: we just give them to d3
		else if (key !== "container" && key !== "svgElem"){
			throw new Error("Unknown key [" + key + "].");
		}
	}
	
	if (!master.container) {
		master.container = "#svg-container";
	}
	
	if (!this._margins) {
		this.margins(constants.DEFAULT_MARGINS);
	}
	
	// if a custom tick-label function has not been defined,
	// add the default, which just displays the data-item's label
	if (!this._tickLabelFn) {
		this.tickLabelFn(constants.DEFAULT_TICK_LABEL_FN);
	}
	
	if (helpers.isEmpty(this._drawImmediately)) {
		this.drawImmediately(true);
	}
	
	this.axisGradient({});
	
	// tell d3 where in the DOM it should append the chart
	var d3Container;
	
	// if we're appending to a pre-existing svg element
	if (master.svgElem) {
		this.svgElem = master.svgElem;
		d3Container = this.svgElem[0][0].parentNode;
	}
	
	// if we're creating a new svg element on the given DOM element
	else if (master.container) {
		d3Container = d3.select(master.container);
		
		if (helpers.isEmpty(d3Container[0][0])) {
			throw new Error("Cannot add chart because no element for selector [" + master.container + "].");
		}
		
		else {
			d3Container.datum(this._data);
			this.svgElem = this.createSvgElem(d3Container);
		}
	}
	
	else {
		throw new Error("Chart requires either an 'svgElem' property (a pre-existing SVG element) or 'container' property (a DOM element where we should append a new SVG element).")
	}

	// call the subclass's chart and draw functions
	this.chart(d3Container);
	
	if (this.drawImmediately()) {
		this.addAxes();	
		this.draw();
		this.enableToolTips();
	}

	// add brushes after #draw because BrushManager needs the chart elements for selection
	this._addBrushes();
};

Chart.prototype.setDefaultXDomainAndScale = function() {
	if (_.isFunction(this._xDomain)) {
		this.xDomain(this._xDomain(this._data));
		
		if (this._xScale) {
			this._xScale.domain(this._xDomain);
		}
		
		return true;
	}
	
	else {
		return false;
	}
};

Chart.prototype.setDefaultYDomainAndScale = function() {
	if (_.isFunction(this._yDomain)) {
		this.yDomain(this._yDomain(this._data));
		
		if (this._yScale) {
			this._yScale.domain(this._yDomain);
		}
		
		return true;
	}
	
	else {
		return false;
	}
};

Chart.prototype.createSvgElem = function(container) {
	var svg = container.append("svg");
	return D3Helpers.appendG(svg, this.width(), this.height(), this.margins());
};

Chart.prototype.getXViewport = function() {
	var m = this.margins();
	return this._width - m.left - m.right;
}

Chart.prototype.getYViewport = function() {
	var m = this.margins();
	return this._height - m.top - m.bottom;
}

Chart.prototype.addAxes = function() {
	var axesElems = [];
	var a = this.axes();
	
	if (a) {
		// x-axis
		if (a.x && a.x.orientation) {
			var xAxisElem = this.addAxis(this.xScale(), a.x.orientation);
			this.addAxisTitle(xAxisElem, a.x.title, a.x.orientation);
			axesElems.push(xAxisElem[0][0]);
		}
		
		// y-axis
		if (a.y && a.y.orientation) {
			var yAxisElem = this.addAxis(this.yScale(), a.y.orientation);
			this.addAxisTitle(yAxisElem, a.y.title, a.y.orientation);
			axesElems.push(yAxisElem[0][0]);
		}
	}
	
	return axesElems;
};

/**
 * Adds an axis to the current SVG element.
 * @svgElem  the DOM element where we should add the axis as a direct child
 * @scale {d3#scale}
 * @orientation {constants#ORIENTATION}
 * @return  the axis DOM element
 */
Chart.prototype.addAxis = function(scale, orientation) {
	var axisElem = this.svgElem.append("g")
		.attr("id", this.getAxisElemId(this.getAxisId(orientation))) 
		.attr("class", "axis");
		
	return this.setAxis(axisElem, scale, orientation);
};

Chart.prototype.setAxis = function(axisElem, scale, orientation) {
	this.setOrientation(axisElem, orientation);
	
	var axis = d3.svg.axis(axisElem)
		.scale(scale)
		.orient(orientation);
	
	var axisId = this.getAxisId(orientation);
	
	if (this._ticks && this._ticks[axisId]) {
		axis.ticks(this._ticks[axisId]);
	}
	
	var tickFormatFn = this.getTickFormatFn(axisId);
	if (tickFormatFn) {
		axis.tickFormat(tickFormatFn);
	}
	
	axisElem
		.transition()
		.duration(constants.TRANSITION_DURATION)
		.call(axis);
	
	var range = this._axes[axisId].range;
	
	if (range) {
		this._axisGradient[axisId] = new AxisGradient(this, axisId, range);
		this._axisGradient[axisId].draw();
	}
	
	return axisElem;
};

Chart.prototype.getDomainArr = function(axisId) {
	var domain = axisId === "x" ? this.xDomain() : this.yDomain();
	
	if (_.isFunction(domain)) {
		return domain(this._data);
	}
	
	else if (_.isArray(domain)) {
		return domain;
	}
	
	else {
		return null;
	}
};

/**
 * Determines whether the values of the given axis are in ascending order.
 * @param {String} axisId
 */
Chart.prototype.isDomainAscending = function(axisId) {
	var domainArr = this.getDomainArr(axisId);
	
	if (domainArr) {
		//console.log("axisId [" + axisId + "], domainArr", domainArr);
		return domainArr[0] < domainArr[1];
	}
	
	// if we don't have a domain
	else {
		throw new Error("No domain on chart.");
	}
};

Chart.prototype.rotateLabels = function(axisId, angleInRadians, dx, dy) {
	var labels = d3.select("#" + this.idPrefix() + constants.AXIS_ID[axisId]).selectAll("g text");
	
	labels
		.attr("transform", "rotate(" + angleInRadians + ")")
		.attr("dx", dx)
		.attr("dy", dy);
};

Chart.prototype.getTickFormatFn = function(axisId) {
	if (this._tickFormat) {
		var tf = this._tickFormat[axisId];
		if (tf) {
			return tf.fn ? tf.fn : tf.getFormatFn();
		}
	}
	
	return null;
};

Chart.prototype.enableToolTips = function() {
	if (this._toolTipFn) {
		var self = this;
		
		$("." + constants.CIRCLE_CLS_NAME).tipsy({
		    gravity: "w",
		    html: true,
		    title: function() {
		    	var d = this.__data__;
				return self._toolTipFn(d);
		    }
		});
	}
};

Chart.prototype.setOrientation = function(elem, orientation) {
	switch (orientation) {
		case constants.ORIENTATION.bottom:
			elem.attr("transform", "translate(0," + this.getYViewport() + ")");
			break;
		case constants.ORIENTATION.right:
			elem.attr("transform", "translate(" + this.getXViewport() + ",0)");
			break;
		default:
			elem.attr("transform", null);
			break;
	}
};

/**
 * Adds a title to an axis.
 * @param axisElem  the DOM element where we should add the title
 * @param {String} @title  the title text
 * @param {constants#ORIENTATION} orientation
 * @return the title's DOM element
 */
Chart.prototype.addAxisTitle = function(axisElem, title, orientation) {
	var titleElem = axisElem.append("text")
		.attr("id", this._idPrefix + constants.AXIS_TITLE_ID[this.getAxisId(orientation)])
		.attr("class", "axis-title");
		
	return this.setAxisTitle(titleElem, axisElem, title, orientation);
};

/**
 * Resets a title of an axis.
 * @param {Object} titleElem
 * @param {Object} axisElem  the DOM element where we should add the title
 * @param {String} @title  the title text
 * @param {constants#ORIENTATION} orientation
 */
Chart.prototype.setAxisTitle = function(titleElem, axisElem, title, orientation) {
	if (!_.str.isBlank(title)) {
		var yPadding = 50;
		var halfX = this.getXViewport() / 2;
		var halfY = this.getYViewport() / 2;
		
		switch (orientation) {
			case constants.ORIENTATION.top:
				titleElem
					.attr("transform", null)
					.attr("x", halfX)
					.attr("y", -35);
				break;
				
			case constants.ORIENTATION.bottom:
				titleElem
					.attr("transform", null)
					.attr("x", halfX)
					.attr("y", -this.margins().bottom + yPadding);
				break;
		
			case constants.ORIENTATION.left:
				titleElem
					.attr("transform", "rotate(-90)")
					.attr("x", -halfY)
					.attr("y", -this.margins().left + 10);
				break;
			
			case constants.ORIENTATION.right:
				titleElem
					.attr("transform", "rotate(90)")
					.attr("x", halfY)
					.attr("y", -yPadding);
				break;
		}
		
		titleElem
			.style("text-anchor", "middle")
			.text(title);
	}
	
	return titleElem;
};

Chart.prototype.getAxisId = function(orientation) {
	switch (orientation) {
		case constants.ORIENTATION.top:
		case constants.ORIENTATION.bottom:
			return "x";
		default:
			return "y";
	}
};

Chart.prototype._addBrushes = function() {
	if (this._brushes) {
		// add listener before adding brushes
		// because as soon as brushes are drawn, BrushManager will fire
		// its first selection event
		if (this._brushes.selectionListener) {
			//console.log("adding selection listener");
			$(document).select(this._brushes.selectionListener);
		}

		var self = this;
		
		_.each(["x", "y"], function(axisId) {
			self._addBrush(axisId);
		});
	}
};

Chart.prototype._addBrush = function(axisId) {
	var brushConfig = this._brushes[axisId];
	
	if (brushConfig) {
		var brush = new Brush(this, axisId);
		var brushPos = brushConfig.brushPosition;
		
		if (brushPos) {
			if (brushPos.position) {
				brush.brushPosition.position = brushPos.position;
			}
			
			if (brushPos.percentage) {
				brush.brushPosition.percentage = brushPos.percentage;
			}
		}
		
		if (brushConfig.range) {
			brush.range = brushConfig.range;
			//console.log("_addBrush, axisId [" + axisId + "], range", brushConfig.range);
		}
		
		brush.draw(this.drawImmediately());
	}
};

/**
 * @param {String} axisId  "x" or "y"
 */
Chart.prototype.getAxisElemId = function(axisId) {
	return this._idPrefix + constants.AXIS_ID[axisId];
};

/**
 * @param {String} axisId  "x" or "y"
 */
Chart.prototype.getAxisElem = function(axisId) {
	return d3.select("#" + this.getAxisElemId(axisId));
};

/**
 * @param {String} axisId  "x" or "y"
 */
Chart.prototype.getAxisGradient = function(axisId) {
	if (!this._axisGradient) {
		throw new Error("No AxisGradients defined for chart.");
	}
	
	else {
		return this._axisGradient[axisId];
	}
};

Chart.prototype.axisGradient = function(value) {
	if (!arguments.length) return this._axisGradient;
	this._axisGradient = value;
	return this;
};

Chart.prototype.idPrefix = function(value) {
	if (!arguments.length) return this._idPrefix;
	this._idPrefix = value;
	return this;
};

Chart.prototype.drawImmediately = function(value) {
	if (!arguments.length) return this._drawImmediately;
	this._drawImmediately = value;
	return this;
};

Chart.prototype.axes = function(value) {
	if (!arguments.length) return this._axes;
	this._axes = value;
	return this;
};

Chart.prototype.brushes = function(value) {
	if (!arguments.length) return this._brushes;
	this._brushes = value;
	return this;
};

Chart.prototype.width = function(value) {
  if (!arguments.length) return this._width;
  this._width = value;
  return this;
};

Chart.prototype.height = function(value) {
  if (!arguments.length) return this._height;
  this._height = value;
  return this;
};

Chart.prototype.xScale = function(value) {
  if (!arguments.length) return this._xScale;
  this._xScale = value;
  return this;
};

Chart.prototype.yScale = function(value) {
  if (!arguments.length) return this._yScale;
  this._yScale = value;
  return this;
};

Chart.prototype.ticks = function(value) {
	if (!arguments.length) return this._ticks;
	this._ticks = value;
	return this;
};

Chart.prototype.tickFormat = function(value) {
	if (!arguments.length) return this._tickFormat;
	this._tickFormat = value;
	return this;
};

Chart.prototype.xDomain = function(value) {
  if (!arguments.length) return this._xDomain;
  this._xDomain = value;
  return this;
};

Chart.prototype.yDomain = function(value) {
  if (!arguments.length) return this._yDomain;
  this._yDomain = value;
  return this;
};

Chart.prototype.dateFormat = function(value) {
  if (!arguments.length) return this._dateFormat;
  this._dateFormat = value;
  return this;
};

Chart.prototype.margins = function(value) {
	if (!arguments.length) return this._margins;
	this._margins = value;
	return this;
};

// singleton per chart
Chart.prototype.brushManager = function() {
	if (!this._brushManager) {
		this._brushManager = new BrushManager();
	}
	
	return this._brushManager;
};

Chart.prototype.addBrush = function(brush) {
	this.brushManager().register(brush);
	return this;
};

/**
 * Formats a value for a label for an axis tick.
 * @param {Object} value
 */
Chart.prototype.tickLabelFn = function(value) {
	if (!arguments.length) return this._tickLabelFn;
	this._tickLabelFn = value;
	return this;
};

Chart.prototype.cssClassNameFn = function(value) {
	if (!arguments.length) return this._cssClassNameFn;
	this._cssClassNameFn = value;
	return this;
};

/**
 * Formats a value for a BarChart.
 * @param {Object} value
 */
Chart.prototype.labelFn = function(value) {
	if (!arguments.length) return this._labelFn;
	this._labelFn = value;
	return this;
};

/**
 * Returns HTML for a single tooltip, given a single data item.
 * @param {Object} value
 */
Chart.prototype.toolTipFn = function(value) {
	if (!arguments.length) return this._toolTipFn;
	this._toolTipFn = value;
	return this;
};

Chart.prototype.range = function(value) {
	if (!arguments.length) return this._range;
	this._range = value;
	return this;
};

Chart.prototype.stack = function(value) {
	if (!arguments.length) return this._stack;
	this._stack = value;
	return this;
};

Chart.prototype.sortBy = function(value) {
	if (!arguments.length) return this._sortBy;
	this._sortBy = value;
	return this;
};

Chart.prototype.data = function(values) {
	if (!arguments.length) return this._data;
	this._data = values;
	return this;
};
