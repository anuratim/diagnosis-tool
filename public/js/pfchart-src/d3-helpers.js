var D3Helpers = {};

D3Helpers.appendG = function(elem, width, height, margins) {
	return elem
		.attr("width", width + margins.left + margins.right)
		.attr("height", height + margins.top + margins.bottom)
		.append("g")
			.attr("transform", "translate(" + margins.left + "," + margins.top + ")");
};

/**
 * Translates the given d3 element with the given offset.
 */
D3Helpers.translateOffset = function(detachedD3Elem, offset) {
	var d3Elem = _.isArray(detachedD3Elem) ? detachedD3Elem : d3.select(detachedD3Elem);
	var translation = D3Helpers.getTranslation(d3Elem);
	var newX = translation.x + offset.x;
	var newY = translation.y + offset.y;
	//console.log("offsetX [" + offset.x + "], offsetY [" + offset.y + "], newX [" + newX + "], newY [" + newY + "], translationX [" + translation.x + "], translationY [" + translation.y + "]", d3Elem[0][0]);
	d3Elem.attr("transform", "translate(" + newX + ", " + newY + ")");
};

/**
 * Gets the current translation of the given d3 element.
 * @return Map{x, y}
 */
D3Helpers.getTranslation = function(d3Elem) {
	var translation = {x: 0, y: 0};
	
	var transform = d3Elem.attr("transform");
	
	if (transform) {
		var match = transform.match(/\((-?[0-9]+),(-?[0-9]+)\)/);
		
		if (match) {
			translation.x = +match[1];
			translation.y = +match[2];
		}
	}
	
	return translation;
};

/**
 * Builds and returns an array of d3 elements
 * from the given selectors.
 * @param {String[]} selectorArr array of selectors
 */
D3Helpers.buildD3Arr = function(selectorArr) {
	var arr = [];
	
	_.each(selectorArr, function(selector) {
		arr = arr.concat(d3.selectAll(selector)[0]);
	});
	
	return arr;
};

/**
 * Checks if a selector returns any elements.
 * @param {String} selector  the selector
 * @return  the selection
 */
D3Helpers.checkSelection = function(container, selector) {
	var selection = container.selectAll(selector);
	
	if (selection[0].length === 0) {
		throw new Error("No elements found for selector [" + selector + "].");
	}
	
	else {
		return selection;
	}
}
