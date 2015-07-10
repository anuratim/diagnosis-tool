/*globals d3:true*/

/*
  Default configs
*/

var defaults = {};

defaults.BarChart = {
  "height": 700,
  "width": 500,
  "margins": { "top": 50, "right": 10, "bottom": 40, "left": 150 },
  "container": "body",
  "xScale": d3.scale.linear(),
  "xDomain": helpers.zeroToMax,
  "ticks": 5,
  "sortBy": helpers.sortByLabelDesc
};

defaults.ColumnChart = {
  "height": 700,
  "width": 500,
  "margins": { "top": 50, "right": 10, "bottom": 40, "left": 50 },
  "container": "body",
  "yScale": d3.scale.linear(),
  "yDomain": helpers.zeroToMax,
  "ticks": 5,
  "sortBy": helpers.sortByLabelDesc
};

defaults.AreaChart = {
  "height": 400,
  "width": 800,
  "margins": { "top": 50, "right": 50, "bottom": 40, "left": 50 },
  "container": ".module",
  "xScale": d3.time.scale(),
  "yScale": d3.scale.linear(),
	"xDomain": helpers.minToMax,
  "yDomain": helpers.zeroToMax,
	"dateFormat": "%d-%b-%y"
};
