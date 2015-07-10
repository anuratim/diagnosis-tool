/**
 * Constructor.
 * @param {HashMap} config
 * @param {Object[]} dataForSecondColumn  the raw data for the second column to draw the bubbles
 * (this._data holds the summary ranges for the paired columns)
 * @param {Boolean} drawCirclesImmediately
 */
function PairedColumnBubbleChart(config, dataForSecondColumn, drawCirclesImmediately) {
	this.drawCirclesImmediately = helpers.isEmpty(drawCirclesImmediately) ? true : drawCirclesImmediately;
	
	var self = this;
	this.dataForSecondColumn = [];
	_.each(config.data, function(item) {
		self.dataForSecondColumn.push([]);
	});
	
	_.each(dataForSecondColumn, function(item) {
		self.dataForSecondColumn[item.value - 1].push(item);
	});
	
	defaults.PairedColumnBubbleChart = defaults.PairedColumnChart;
	defaults.PairedColumnBubbleChart.idPrefix = "paired-bubble-column-chart-";
	
	this.RADIUS = 3;
	// horizontal padding is fixed; vertical padding calculated dynamically by #_calculateVerticalPadding
	this.H_PADDING = 7.5;
	// a way to mark all the circles for later retrieval,
	// but shouldn't match an actual class name in the css
	this.FAKE_CIRCLE_CLASS_NAME = this.__proto__.constructor.name + "-" + helpers.getRandomNumber(10);
	this.config(config);
}

_.extend(PairedColumnBubbleChart.prototype, PairedColumnChart.prototype);

PairedColumnBubbleChart.prototype.draw = function() {
	// tell super class to draw bars
	PairedColumnChart.prototype.draw.call(this);

	// hide bars
	this.toggleBars(false);
	
	if (this.drawCirclesImmediately) {
		this.drawCircles();
		this.toggleBars(true);
	}
};

PairedColumnBubbleChart.prototype.drawCircles = function(circleArr, onBeforeMoveCircle) {
	// get css value for "circle.circle-in-bar { fill: green; }"
	var circleFillColor = helpers.getCssPropertyValue("<circle class='circle-in-bar'/>", "fill");
	
	this.barWidth = this._xScale.rangeBand() / 2;
	
	var appendNewCircle = !circleArr;
	var self = this;
	var halfRadius = this.RADIUS / 2;
	var maxCirclesPerRow = Math.floor(this.barWidth / (this.RADIUS + this.H_PADDING));
	var bottomEdgeOfBar = this.getYViewport() - halfRadius;
	var count = 0;
	var dataForBucket;
	var numDataItemsForBucket;
	var numRows;
	var topPos;
	var barHeight;
	var vPadding;
	var leftEdgeOfBar;
	var circlesInCurrentRow;
	var currentRowNum;
	var circle;
	var xPos;
	var yPos;
	
	for (var bucket = 0; bucket < this.dataForSecondColumn.length; bucket++) {
		dataForBucket = this.dataForSecondColumn[bucket];
		numDataItemsForBucket = dataForBucket.length;
		numRows = Math.ceil(numDataItemsForBucket / maxCirclesPerRow);
		
		topPos = this._yScale(this._data[bucket].value0);
		barHeight = this.getYViewport() - topPos;
		vPadding = this._calculateVerticalPadding(numRows, this.RADIUS, barHeight);
		
		leftEdgeOfBar = self._xScale(bucket) + this.barWidth + halfRadius;
		circlesInCurrentRow = 0;
		currentRowNum = 0;
		
		for (var i = 0; i < numDataItemsForBucket; i++) {
			circle = appendNewCircle ? this.svgElem.append("circle") : d3.select(circleArr[count++]);
			
			xPos = leftEdgeOfBar + (circlesInCurrentRow * (this.RADIUS + this.H_PADDING)) + (this.RADIUS * 1.25);
			yPos = bottomEdgeOfBar - (currentRowNum * (this.RADIUS + vPadding)) - halfRadius;
    		++circlesInCurrentRow;
			    	
	    	// start new row
	    	if (circlesInCurrentRow === maxCirclesPerRow) {
	    		circlesInCurrentRow = 0;
	    		++currentRowNum;
	    	}
	    	
	    	// apply custom state
	    	if (onBeforeMoveCircle) {
	    		circle = onBeforeMoveCircle(circle);
	    	}
	    	
	    	// add a default before-state of hidden and the default transition
	    	else {
	    		circle
	    			.attr("opacity", 0)
					.transition()
					.duration(constants.TRANSITION_DURATION);
	    	}
	    	
	    	// draw the final state of the circle
	    	circle
				.attr("class", this.FAKE_CIRCLE_CLASS_NAME)
			    .attr("r", this.RADIUS)
			    .attr("cx", xPos)
			    .attr("cy", yPos)
				.style("fill", circleFillColor);
		}
	}
};

PairedColumnBubbleChart.prototype.onCirclesMoved = function() {
	var selector = "circle." + this.FAKE_CIRCLE_CLASS_NAME;
	var circles = d3.selectAll(selector);
	
	if (circles[0].length > 0) {
		circles
			.style("opacity", null)
			.attr("opacity", 1);
	}
	
	else {
		console.log("No circles for selector [" + selector + "].");
	}
};

PairedColumnBubbleChart.prototype.toggleBars = function(show, onToggle) {
	var bars = this.svgElem.selectAll("g.pair");
	
	if (onToggle) {
		onToggle(bars);
	}
	
	else {
		if (show) {
			bars
				.transition()
				.duration(constants.TRANSITION_DURATION * 2);
		}
		
		bars.attr("opacity", show ? 1 : 0);
	}
};

PairedColumnBubbleChart.prototype._calculateVerticalPadding = function(numRows, radius, barHeight) {
	var totalHeightWithoutPadding = numRows * radius;
	var extraSpace = barHeight - totalHeightWithoutPadding;
	return extraSpace / numRows;
};
