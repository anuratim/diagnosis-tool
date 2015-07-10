/*globals $:true, d3:true, helpers:true, BarChart:true*/

var data = [], random = function (x) { return Math.ceil(Math.random() * x); };

var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var startDate = new Date(2012, 0, random(365))
    ,endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 100);

for (var d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
  var currDate = new Date(d);
  var formattedDate = currDate.getDate() + "-" + monthNames[currDate.getMonth()] + "-" + (currDate.getFullYear() - 2000);     
  data.push({"value": random(100), "date": formattedDate});
}

// Create default configs for
var config = {
  "height": 400,
  "width": 1000,
  "margins": { "top": 10, "right": 10, "bottom": 40, "left": 25 },
  "xScale": d3.time.scale(),
  "yScale": d3.scale.linear(),
  "xDomain": helpers.minToMax,
  "yDomain": helpers.zeroToMax,
  "dateFormat": "%d-%b-%y",
  "data": data,
  "container": "#module0"
};

var areaChart = new AreaChart(config);

var data = [],
  zero = d3.format("02d"),
  random = function (n) { return Math.ceil(Math.random() * n); };

for (var i = 0; i < 730; i++) {
  data.push({
    "value": random(100),
    "label": "Label-" + zero(i)
  });
}

/*
  Config overwrites defaults
*/
var config = {
  "height": 50,
  "width": 1000,
  "margins": { "top": 50, "right": 10, "bottom": 40, "left": 25 },
  "data": data,
  "container": "#module1"
};

var columnChart1 = new ColumnChart(config);

var config = {
  "height": 50,
  "width": 1000,
  "margins": { "top": 50, "right": 10, "bottom": 40, "left": 25 },
  "data": data,
  "container": "#module2"
};

var columnChart2 = new ColumnChart(config);

var config = {
  "height": 50,
  "width": 1000,
  "margins": { "top": 50, "right": 10, "bottom": 40, "left": 25 },
  "data": data,
  "container": "#module3"
};

var columnChart2 = new ColumnChart(config);

$("#refresh").click(function () {
  var data = [];
  var limit = random(20) + 2;

  for (var i = 0; i < limit; i++) {
    data.push({
      "value": random(100),
      "label": "Label-" + zero(i)
    });
  }

  barChart
    .data(data)
    .draw();
});

$("#sort-label").click(function () {
  $(this).addClass("disabled");
  $("#sort-value").removeClass("disabled");

  barChart
    .sortBy(helpers.sortByLabelAsc)
    .sort();
});

$("#sort-value").click(function () {
  $(this).addClass("disabled");
  $("#sort-label").removeClass("disabled");

  barChart
    .sortBy(helpers.sortByValueAsc)
    .sort();
});
