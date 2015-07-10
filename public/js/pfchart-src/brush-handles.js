/**
 * Adds brush handles to a Brush.
 * @param {Brush} brushElem  the parent element where we'll add the handles
 * @param {String} axisId  "x" or "y"
 * @param {Integer} brushSize  brushWidth if "x" axis; brushHeight if "y" axis
 */
function BrushHandles(brushElem, axisId, brushSize) {
	this.brushElem = brushElem;
	this.halfBrushSize = brushSize / 2;
	
	// start and end angles (in degrees)
	// to indicate which direction the brush handle faces
	var brushHandleFaces = {
		// (
		left: [0, 180],
		// U
		top: [90, 270],
		// )
		right: [180, 360],
		// A
		bottom: [270, 450]
	}
	
	this.brushHandleXPos = 0;
	this.brushHandleYPos = 0;
	
	switch (axisId) {
		case "x":
			this.faces = [brushHandleFaces.left, brushHandleFaces.right];
			this.brushHandleYPos = this.halfBrushSize;
			break;
			
		case "y":
			this.faces = [brushHandleFaces.bottom, brushHandleFaces.top];
			this.brushHandleXPos = this.halfBrushSize;
			break;
		
		default:
			throw new Error("Unexpected axisId [" + axisId + "].");
	}
}

BrushHandles.prototype.draw = function(show) {
	if (helpers.isEmpty(show)) {
		show = true;
	}
	
	var self = this;
	
	var brushHandles = d3.svg.arc()
		.outerRadius(this.halfBrushSize)
		.startAngle(function(d, i) { return self.degreesToRadians(self.faces[i][0]); })
		.endAngle(function(d, i) { return self.degreesToRadians(self.faces[i][1]); });	

	// "resize" is d3's built-in css classname
	this.brushElem
		.selectAll(".resize")
		.append("path")
		.attr("opacity", 0)
	    .attr("transform", "translate(" +  this.brushHandleXPos + "," + this.brushHandleYPos + ")")
	    .attr("d", brushHandles);
	
	if (show) {
		this.show();
	}
};

BrushHandles.prototype.show = function() {
	this._setOpacity(1);
};

BrushHandles.prototype.hide = function() {
	this._setOpacity(0);
};

BrushHandles.prototype.degreesToRadians = function(degrees) {
	return degrees * (Math.PI / 180);
};

BrushHandles.prototype._setOpacity = function(opacity) {
	// "resize" is d3's built-in css classname
	this.brushElem
		.selectAll(".resize path")
		.transition()
		.duration(constants.TRANSITION_DURATION)
		.attr("opacity", opacity);
};