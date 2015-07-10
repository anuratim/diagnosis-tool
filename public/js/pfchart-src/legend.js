/**
 * Constructor.
 * @param {Chart} chart  the chart associated with the legend
 * @param {String[]} labelArr  the array of labels to display in legend
 * @param {Integer} highlightIndex  optional: index in labelArr
 * if we want to highlight a legend item
 * 
 * The css for legend items is in the format for as many items as labelArr:
 * 
 * .[chart._idPrefix]-legend .legend-0 {
 * 		fill: #ff4900;
 * }
 */
function Legend(chart, labelArr, highlightIndex) {
	this.chart = chart;
	this.labelArr = labelArr;
	this.highlightIndex = helpers.isEmpty(highlightIndex) ? -1 : highlightIndex;
	this.bulletWidthAndHeight = 18;
	this.legendItemHeight = 20;
}

Legend.prototype.draw = function() {
	var self = this;
	
	var legendClassName = this.chart._idPrefix + "legend";
	
	var legend = this.chart.svgElem.selectAll("." + legendClassName)
		.data(this.labelArr)
		.enter().append("g")
		.attr("class", legendClassName)
		.attr("transform", function(d, i) { return "translate(0," + (i * self.legendItemHeight) + ")"; });
	
	legend.append("rect")
	    .attr("class", function(d, i) { return "legend-" + (i + 1); })
	    .attr("x", this.chart._width - this.bulletWidthAndHeight)
	    .attr("width", this.bulletWidthAndHeight)				
	    .attr("height", this.bulletWidthAndHeight)
	    .attr("stroke", "#000")
	    .attr("stroke-width", 2)
	    .attr("fill-opacity", function(d, i) { return i === self.highlightIndex ? 1.0 : .5; } )
	    .attr("stroke-opacity", function(d, i) { return i === self.highlightIndex ? 1.0 : 0; } );
	
	legend.append("text")
	    .attr("x", this.chart._width - 24)
	    .attr("y", this.bulletWidthAndHeight / 2)
	    .attr("dy", ".35em")
	    .style("text-anchor", "end")
	    .text(function(d, i) { return self.labelArr[i]; });
};
