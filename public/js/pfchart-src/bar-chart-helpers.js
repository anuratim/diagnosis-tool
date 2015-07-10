var barChartHelpers = {};
barChartHelpers.MIN_BAR_WIDTH_FOR_LABEL = 30;

barChartHelpers.drawBars = function(chart, selection, barHeight, barHeightSpacing) {
	// if we have a custom function to determine css class for the bar
	if (chart._range) {
		selection.attr("class", function(d) {
			//console.log("cssClassName [" + chart._range.cssClassNameFn(d) + "], d", d);
			return chart._range.cssClassNameFn(d);
		})
	}
	
	// stacked charts use "value0" to scale x; all other charts use "value"
	var isStackedChart = chart.constructor.name.toLowerCase().indexOf("stacked") >= 0; 
	
	// x starts from right of previous band
	selection
		.attr("x", function(d) {
			if (isStackedChart) {
				return helpers.scaleValue(chart, "x", d.value0, chart._xScale);
			}
			
			else {
				return 0;
			}
		})
		.attr("y", function(d) {
			//var tickLabel = chart._tickLabelFn(d);
			var tickLabel = d.label;
			var y = chart._yScale(tickLabel);
			//console.log("y [" + y + "], tickLabel [" + tickLabel + "], d", d);
			return y;
		})
		.attr("width", 0)
		.transition()
		.duration(constants.TRANSITION_DURATION)
		.attr("width", function(d) {
			return helpers.scaleValue(chart, "x", d.value, chart._xScale);
		})
		.attr("height", barHeight - barHeightSpacing);
};

/**
 * Adds labels to each bar.
 * @param {Object} data
 */
barChartHelpers.addBarLabels = function(chart, data, barHeight) {
	var self = chart;
	var labelCls = "bar-label";
	
	// clear previous labels
	chart.svgElem.selectAll("." + labelCls).remove();
	
	// add label to each bar
	chart.svgElem.selectAll("." + labelCls)
		.data(data)
		.enter()
		.append("text")
		.attr("class", labelCls)
		.transition()
		// wait til bars are drawn before adding labels
		.delay(constants.TRANSITION_DURATION)
		.attr("x", function (d) { return self._xScale(d.value); })
		.attr("y", function (d) { return self._yScale(self._tickLabelFn(d)); })
		.attr("dx", -5)
		.attr("dy", (barHeight + 5) / 2)	// 5 == estimate of the font height
		.text(function (d) {
			var val = helpers.scaleValue(chart, "x", d.value, self._xScale);
			//console.log("xscale [" + val + "], d.value [" + d.value + "], d", d);
			return barChartHelpers._getLabelDisplay(val, d.value);
		});
};

barChartHelpers._getLabelDisplay = function(barWidth, labelTxt) {
	if (_.str.isBlank(labelTxt)) {
		console.log("No labelTxt for barWidth [" + barWidth + "].");
		return "";
	}
	
	else {
		var labelTxtLength = new String(labelTxt).length;
		//console.log("labelTxt [" + labelTxt + "], barWidth [" + barWidth + "], minBarWidth [" + this.MIN_BAR_WIDTH_FOR_LABEL + "] (labelTxtLength + barWidth) = [" + (labelTxtLength + barWidth) + "]");
		
		if ((labelTxtLength + barWidth) >= barChartHelpers.MIN_BAR_WIDTH_FOR_LABEL) {
			return labelTxt.toLocaleString();
		}
		
		else {
			return "";
		}
	}
};
