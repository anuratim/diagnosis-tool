var constants = {};

/***** DEFAULTS *****/
constants.TRANSITION_DURATION = 1000;
constants.ORIENTATION = { top: "top", bottom: "bottom", left: "left", right: "right" };
constants.DEFAULT_MARGINS = { top: 35, bottom: 10, left: 75, right: 10 };
constants.DEFAULT_TICK_LABEL_FN = function(d) { return d.label; }; 

/***** CSS CLASS NAMES *****/
constants.CIRCLE_CLS_NAME = "dot";

/***** COLORS *****/
constants.DESELECTED_COLOR = "#aaa";

/***** IDs *****/
constants.AXIS_ID =			{ x: "x-axis", y: "y-axis" };
constants.AXIS_TITLE_ID =	{ x: "x-axis-title", y: "y-axis-title" };

/***** Tick and Label Formats *****/
constants.Format = function(id, specifier, d3Format) {
	this.id = id;
	this.specifier = specifier;
	this.d3Format = d3Format ? d3Format : d3.format;
	if (this.specifier) {
		this.resetFormatFn();
	}
}

constants.Format.prototype.format = function(value) {
	return this.formatFn(value);
};

constants.Format.prototype.setSpecifier = function(specifier) {
	this.specifier = specifier;
	this.resetFormatFn();
	return this;
};

constants.Format.prototype.getFormatFn = function() {
	return this.formatFn;
};

constants.Format.prototype.setFormatFn = function(formatFn) {
	this.formatFn = formatFn;
	return this;
};

constants.Format.prototype.resetFormatFn = function() {
	this.formatFn = this.d3Format(this.specifier);
};

constants.FORMAT_FACTORY = function(id) {
	switch(id) {
		case "date":
			return new constants.Format(id, "%d%Y", d3.time.format);
		case "large-number":
			return new constants.Format(id, "s");
		case "number":
			return new constants.Format(id, ",.0f");
		case "percentage":
			return new constants.Format(id, "1%");
		// if not a pre-defined format, it's up to the caller to call #setFormatFn
		default:
			return new constants.Format(id);
	}
};

