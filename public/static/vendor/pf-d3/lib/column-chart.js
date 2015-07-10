/*globals d3:true, _:true, Chart:true*/

function ColumnChart(config) {
  this.config(config);
}

_.extend(ColumnChart.prototype, Chart.prototype);

ColumnChart.prototype.chart = function (selection) {
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
      .attr("transform", "translate(10, " + self._margins.top + ")");

    /*
    self._gXAxis = svg
      .append("g")
      .attr("transform", "translate(" + self._margins.left + "," +
        (self._height - self._margins.bottom) + ")")
      .attr("class", "axis");
    */

    self._yScale
      .domain(self._yDomain(data))
      .range([0, self._height - self._margins.top - self._margins.bottom]);

    // xScale is always ordinal
    self._xScale = d3.scale.ordinal();
    self._xScale.rangeRoundBands([0, self._width - self._margins.left - self._margins.right], 0);

    self.draw();
  });
};

ColumnChart.prototype.draw = function () {
  var self = this;

  var x0 = this._x0 = this._xScale.domain(
    this._data.sort(this._sortBy).map(function (d) { return d.label; })
  ).copy();

  var barWidth = this.barWidth = (this._width - this._margins.left -
    this._margins.right) / this._data.length;
  /*
  this._gXAxis
    .transition()
    .duration(1000)
    .call(d3.svg.axis()
      .scale(this._xScale)
      .ticks(this._ticks)
      .orient("bottom"));
  */
  /*
  this._labels = this._gYAxis
    .selectAll('text')
    .data(this._data, function (d) { return d.label; });

  this._labels
    .text(function (d) { return d.label; })
    .transition()
    .duration(1000)
    .attr('y', function (d) { return y0(d.label) + barHeight; });

  this._labels
    .enter()
    .append('text')
    .text(function (d) { return d.label; })
    .attr('opacity', 0)
    .transition()
    .duration(1000)
    .ease('sin')
    .attr('opacity', 1)
    .attr('y', function (d) {
      return y0(d.label) + barHeight;
    });

  this._labels
    .exit()
    .attr('opacity', function () { return 1; })
    .transition()
    .duration(1000)
    .attr('opacity', 0)
    .remove();
  */
  this._bars = this._gBody
    .selectAll('rect')
    .data(this._data, function (d) { return d.label; });

  this._bars
    .exit()
    .attr('opacity', 1)
    .transition()
    .duration(1000)
    .attr('opacity', 0)
    .remove();

  this._bars
    .enter()
    .insert('rect')
    .style('fill', '#666')
    .attr('x', function (d, i) { return i * 2/*x0(d.label);*/ })
    .attr('y', function (d) { return self._yScale(d.value); })
    .attr('height', self._height)
    .attr('width', 1)
    //.transition()
    //.duration(1000)
    //.ease('sin')
    //.attr('y', function (d) { return self._yScale(d.value); })
    //.attr('height', function (d) { return self._yScale(d.value); });

  /*
  this._bars
    .attr('opacity', 1)
    .transition()
    .duration(1000)
    .attr('y', function (d) { return y0(d.label); })
    .attr('height', function (d) { return self._xScale(d.value); })
    .attr('height', barWidth - 2);
  */
};

ColumnChart.prototype.sort = function () {
  var self = this;

  var y0 = this._y0 = this._yScale.domain(
    this._data.sort(this._sortBy).map(function (d) { return d.label; })
  ).copy();

  this._labels
    .transition()
    .delay(function (d, i) { return i * 50; })
    .duration(700)
    .attr("y", function (d) { return y0(d.label) + self._barHeight; });

  this._bars
    .transition()
    .delay(function (d, i) { return i * 50; })
    .duration(700)
    .attr("y", function (d) { return y0(d.label); });
};
