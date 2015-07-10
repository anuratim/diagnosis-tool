var DebugHelpers = {};
DebugHelpers.DEFAULT_COLOR = "green";

/**
 * Draws a vertical line in SVG space
 * across the entire viewport at given x position.
 */
DebugHelpers.drawSvgVerticalLine = function(x) {
	var height = $(document).height();
	
	d3.select("svg").append("path")
		.attr("d", "M" + x + ",0 L" + x + "," + height)
		.attr("stroke", DebugHelpers.DEFAULT_COLOR);
		
	d3.select("svg").append("text")
		.attr("x", x + 5)
		.attr("y", height / 2)
		.text("x: " + x);
};

/**
 * Draws a horizontal line in SVG space
 * across the entire viewport at given y position.
 */
DebugHelpers.drawSvgHorizontalLine = function(y) {
	var width = $(document).width();
	
	d3.select("svg").append("path")
		.attr("d", "M0," + y + " L" + width + "," + y)
		.attr("stroke", DebugHelpers.DEFAULT_COLOR);
		
	d3.select("svg").append("text")
		.attr("x", width / 2)
		.attr("y", y + 15)
		.text("y: " + y);
};

/**
 * Draws a circle in SVG space at given x,y position.
 */
DebugHelpers.drawSvgCircle = function(x, y) {
	var radius = 3;
	
	d3.select("svg").append("circle")
		.attr("r", radius)
		.attr("cx", x)
		.attr("cy", y)
		.style("fill", DebugHelpers.DEFAULT_COLOR)
		.style("stroke", "black");
		
	d3.select("svg").append("text")
		.attr("x", x + 15)
		.attr("y", y + radius)
		.text(x + ", " + y);
};

/**
 * Draws a box in DOM space at given x,y position.
 */
DebugHelpers.drawDomBox = function(x, y) {
	var div = $("<div style='position: absolute; left: " + x + "px; top: " + y + "px; border: 1px solid " + DebugHelpers.DEFAULT_COLOR + "; color: " + DebugHelpers.DEFAULT_COLOR + "; font: 16px normal Arial'>" + x + ", " + y + "</div>");
	div.appendTo($("body"));
};
