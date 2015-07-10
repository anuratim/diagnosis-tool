/**
 * Manages one or two Brushes on a single Chart
 * to determine (if two Brushes) when their selections intersect.
 * Also broadcasts a "select" event every time chart-selection changes;
 * to listen for this event, add the following code:
 * $(document).select(function(e) {
 * 		selectionHandler(e.selectedItems);
 * });
 * 
 */
function BrushManager() {
	this.brushes = {};
}

BrushManager.prototype.register = function(brush) {
	var axisId = brush.axisId;
	
	if (this.brushes[axisId]) {
		throw new Error("A brush for axisId [" + axisId + "] is already registered.");
	}
	
	else if (this.brushes.length >= 2) {
		throw new Error("There are already two brushes registered.");
	}
	
	this.brushes[axisId] = brush;
};

BrushManager.prototype.toggleBrushes = function(show) {
	_.each(this.brushes, function(brush, axisId) {
		//console.log("axisId [" + axisId + "], brush", brush);
		if (show) {
			brush.show();
		}
		
		else {
			brush.hide();
		}
	});
};

/**
 * Reselects chart elements as brush is moved by adding "selected" class
 * to all points that fall within the intersection of brush ranges.
 * @param {Object} brush  the brush being moved
 */
BrushManager.prototype.select = function(brush) {
	var otherAxisId = brush.axisId === "x" ? "y" : "x";
	var otherBrush = this.brushes[otherAxisId];
	var self = this;
	
	var selectedItems = [];
	
	// add "selected" class to all points that fall within brush range
	brush.chart.svgElem
		.selectAll("circle." + constants.CIRCLE_CLS_NAME)
		.classed("selected", function(d) {
			if (helpers.isEmpty(d)) {
				return false;
			}
			
			else {
				var select = self._shouldSelect(d, brush);
				
				if (select && otherBrush) {
					select = self._shouldSelect(d, otherBrush);
				}
				
				if (select) {
					selectedItems.push(d);
				}
				
				return select;
			}
		});

	// broadcast a selection event for the selected items
	//console.log("BrushManager#select, firing 'select' event for [" + selectedItems.length + "] items");
	$.event.trigger({ type: "select", selectedItems: selectedItems });
};

BrushManager.prototype._shouldSelect = function(d, brush) {
	var value = d[brush.propertyName];
	var brushRange = brush.d3Brush.extent();
	var min = brushRange[0];
	var max = brushRange[1];
	return value >= min && value <= max;
};
