/*globals d3:true*/

function Chart() {

}

Chart.prototype.config = function (config) {
  var master = defaults[this.__proto__.constructor.name];
  /**
    Overwrite master config with local config values
  */
  for (var key in config) {
    master[key] = config[key];
  }
  /**
    If config key is a chart accessor, call and set 
    with value from master
  */
  for (var key in master) {
    if (typeof this[key] === 'function') {
      this[key](master[key]);
    }
  }

  d3.select(master.container)
    .datum(master.data);

  this.chart(d3.select(master.container));
};

Chart.prototype.width = function (value) {
  if (!arguments.length) return this._width;
  this._width = value;
  return this;
};

Chart.prototype.height = function (value) {
  if (!arguments.length) return this._height;
  this._height = value;
  return this;
};

Chart.prototype.ticks = function (value) {
  if (!arguments.length) return this._ticks;
  this._ticks = value;
  return this;
};

Chart.prototype.xScale = function (value) {
  if (!arguments.length) return this._xScale;
  this._xScale = value;
  return this;
};

Chart.prototype.xDomain = function (value) {
  if (!arguments.length) return this._xDomain;
  this._xDomain = value;
  return this;
};

Chart.prototype.yScale = function (value) {
  if (!arguments.length) return this._yScale;
  this._yScale = value;
  return this;
};

Chart.prototype.yDomain = function (value) {
  if (!arguments.length) return this._yDomain;
  this._yDomain = value;
  return this;
};

Chart.prototype.dateFormat = function (value) {
  if (!arguments.length) return this._dateFormat;
  this._dateFormat = value;
  return this;
};

Chart.prototype.margins = function (value) {
  if (!arguments.length) return this._margins;
  this._margins = value;
  return this;
};

Chart.prototype.sortBy = function (value) {
  if (!arguments.length) return this._sortBy;
  this._sortBy = value;
  return this;
};

Chart.prototype.data = function (values) {
  if (!arguments.length) return this._data;
  this._data = values;

  /*
  If the domain is defined, set xScale. It is is not,
  xScale will be set for fist time in constructor.
  */
  if (this._xDomain) {
    this._xScale
      .domain(this._xDomain(this._data))
      .range([0, this._width - this._margins.left - this._margins.right]);
  }

  if (this._yDomain) {
    this._yScale
      .domain(this._yDomain(this._data))
      .range([0, this._height - this._margins.top - this._margins.bottom]);
  }

  return this;
};
