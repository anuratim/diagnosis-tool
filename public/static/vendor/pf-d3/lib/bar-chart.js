/*globals d3:true, _:true, Chart:true*/

function BarChart(config) {
  this.config(config);
}

_.extend(BarChart.prototype, Chart.prototype);

BarChart.prototype.chart = function (selection) {
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

    self._gXAxis = svg
      .append("g")
      .attr("transform", "translate(" + self._margins.left + "," +
        (self._height - self._margins.bottom) + ")")
      .attr("class", "axis");

    self._xScale
      .domain(self._xDomain(data))
      .range([0, self._width - self._margins.left - self._margins.right]);

    // yScale is always ordinal
    self._yScale = d3.scale.ordinal();
    self._yScale.rangeRoundBands([0, self._height - self._margins.top - self._margins.bottom], 0);

    self.draw();
  });
};

BarChart.prototype.draw = function () {
  var self = this;

  var y0 = this._y0 = this._yScale.domain(
    this._data.sort(this._sortBy).map(function (d) { return d.label; })
  ).copy();

  var barHeight = this._barHeight = (this._height - this._margins.top -
    this._margins.bottom) / this._data.length;

  this._gXAxis
    .transition()
    .duration(1000)
    .call(d3.svg.axis()
      .scale(this._xScale)
      .ticks(this._ticks)
      .orient("bottom"));

  var labels = this._labels = this._gYAxis
    .selectAll('text')
    .data(this._data, function (d) { return d.label; });

  labels
    .text(function (d) { return d.label; })
    .transition()
    .duration(1000)
    .attr('y', function (d) { return y0(d.label) + barHeight; });

  labels
    .enter()
    .append('text')
    .text(function (d) { return d.label; })
    .attr('opacity', 0)
    .transition()
    .duration(1000)
    .attr('opacity', 1)
    .attr('y', function (d) {
      return y0(d.label) + barHeight;
    });

  labels
    .exit()
    .attr('opacity', function () { return 1; })
    .transition()
    .duration(1000)
    .attr('opacity', 0)
    .remove();

  var bars = this._bars = this._gBody
    .selectAll('rect')
    .data(this._data, function (d) { return d.label; });

  bars
    .exit()
    .attr('opacity', 1)
    .transition()
    .duration(1000)
    .attr('opacity', 0)
    .remove();

  bars
    .enter()
    .insert('rect')
    .style('fill', '#ccc')
    .attr('x', 0)
    .attr('y', function (d) { return y0(d.label); })
    .attr('height', barHeight - 2)
    .attr('width', 0)
    .transition()
    .duration(1000)
    .attr('width', function (d) { return self._xScale(d.value); });

  bars
    .attr('opacity', 1)
    .transition()
    .duration(1000)
    .attr('y', function (d) { return y0(d.label); })
    .attr('width', function (d) { return self._xScale(d.value); })
    .attr('height', barHeight - 2);
};

BarChart.prototype.sort = function () {
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
