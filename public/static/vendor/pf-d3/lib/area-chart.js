/*globals d3:true, _:true, Chart:true*/

function AreaChart(config) {
  this.config(config);
}

_.extend(AreaChart.prototype, Chart.prototype);

AreaChart.prototype.chart = function (selection) {
  var self = this;

  selection.each(function (data) {
    self._data = data;

    // Select the svg element, if it exists.
    var svg = self._svg = d3.select(this).selectAll("svg").data([data]);

    svg.enter().append("svg");

    // Update the outer dimensions.
    svg
      .attr('height', self._height)
      .attr('width', self._width);

    self._gBody = svg
      .append('g')
      .attr("transform", "translate(" + self._margins.left + "," + self._margins.top + ")");

    self._gYAxis = svg
      .append('g')
      .attr("transform", "translate(" + self._margins.left + "," + self._margins.top + ")")
			.attr("class", "y axis");

    self._gXAxis = svg
      .append("g")
      .attr("transform", "translate(" + self._margins.left + "," +
        (self._height - self._margins.bottom) + ")")
      .attr("class", "x axis");

		// Make parser more general? i.e. xParser, yParser?
		self._parseDate = d3.time.format(self._dateFormat).parse;

		// Refactor helper functions to operate on arrays so that parsed date doesn't have to be assigned to value?
    self._xScale
			.domain(self._xDomain(data.map(function(d) { return {"value": self._parseDate(d.date)}; })))
			.range([0, self._width - self._margins.left - self._margins.right]);

    self._yScale = d3.scale.linear();

    self._yScale
			.domain(self._yDomain(data))
			.range([self._height - self._margins.top - self._margins.bottom, 0]);

	 	self._area = d3.svg.area()
 			.x(function(d) { return self._xScale(self._parseDate(d.date)); })
    	.y0(self._height - self._margins.top - self._margins.bottom)
    	.y1(function(d) { return self._yScale(d.value); });
 
		self._paths = self._gBody
			.append('path')
    	.datum(data)
			.attr('class','area')
			.attr('d', self._area);

		self.draw();

  });
};

AreaChart.prototype.draw = function () {

  var self = this; 

	// Refactor helper functions to operate on arrays so that parsed date doesn't have to be assigned to value?
  var x0 = this._x0 = this._xScale.domain(this._xDomain(this._data.map(function(d) { return {"value": self._parseDate(d.date)}; }))).copy();
  var y1 = this._y1 = this._yScale.domain(this._yDomain(this._data)).copy();
	
	this._paths
		.datum(this._data)
		.attr('d', this._area);
	
	this._gXAxis
		.transition()
		.duration(1000)
		.call(d3.svg.axis()
			.scale(x0)
			.orient("bottom"));
		
	this._gYAxis
		.transition()
		.duration(1000)
		.call(d3.svg.axis()
			.scale(y1)
			.orient("left")); 

};
