/**
 * Constructor.
 * @param {Map<String, Object[]} options
 * options.valueThresholds {Float[]} defines the buckets
 * options.valueLabels {String[]} bucket-labels for y-axis
 * options.cssClassNames {String[]} css to be applied for each bucket
 */
function Range(options) {
	this.valueThresholds = options.valueThresholds;
	var numValues = this.valueThresholds.length;
	
	this.valueLabels = this._checkArg(numValues, options.valueLabels, "valueLabels");
	this.cssClassNames = this._checkArg(numValues, options.cssClassNames, "cssClassNames");
	this.countToIndex = new Object();
}

Range.prototype.valueLabelFn = function(d) {
	var value = d.value;
	var rangeLabel = this.valueLabels[this.getBucketForCount(value)];
	//console.log("rangeLabel [" + rangeLabel + "], value [" + value + "], d", d);
	return rangeLabel;
};

Range.prototype.getIndexOf = function(rangeLabel) {
	for (var i = 0; i < this.valueLabels.length; i++) {
		if (this.valueLabels[i] === rangeLabel) {
			return i;
		}
	}
	
	throw new Error("Range label [" + rangeLabel + "] not found.");
};

Range.prototype.cssClassNameFn = function(d) {
	return this.cssClassNames[this.getBucketForCount(d.value)];
};

Range.prototype.getBucketForCount = function(count) {
	return this.countToIndex[count];
};

Range.prototype.getBucketForValue = function(value) {
	var bucket = -1;
	var numValueThresholds = this.valueThresholds.length;
	var lastThresholdIndex = numValueThresholds - 1;
	
	for (var i = 0; i < lastThresholdIndex; i++) {
		if (value <= this.valueThresholds[i]) {
			bucket = i;
			break;
		}
	}
	
	if (bucket === -1) {
		bucket = lastThresholdIndex;
	}
	
	return bucket;
};

Range.prototype.mapCount = function(data) {
	var countedData = [];
	var dataLength = data.length;
	
	for (var i = 0; i < this.valueThresholds.length; i++) {
		countedData[i] = { value: 0, percent: 0 };
	}
	
	var self = this;
	var bucket;
	var secondBucket;
	_.each(data, function(d) {
		bucket = self.getBucketForValue(d.value);
		countedData[bucket].value++;
	});
	
	var strKey;
	for (var i = 0; i < this.valueThresholds.length; i++) {
		strKey = new String(countedData[i].value);
		this.countToIndex[strKey] = i;
		countedData[i].percent = (countedData[i].value / dataLength).toFixed(4);
	}
	
	return countedData;
};

Range.prototype._checkArg = function(numValueTresholds, arr, type) {
	if (arr && arr.length !== numValueTresholds) {
		throw new Error("Number of valueThresholds (" + numValueTresholds + ") and " + type + " (" + arr.length + ") need to match.");
	}
	
	else {
		return arr;
	}
};
