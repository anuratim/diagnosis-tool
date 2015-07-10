/*globals d3:true*/

/*
Helper functions
*/

var helpers = {};

helpers.zeroToMax = function (data) {
  return [0, d3.max(data.map(function (d) { return d.value; }))];
};

helpers.minToZero = function (data) {
  return [d3.min(data.map(function (d) { return d.value; })), 0];
};

helpers.minToMax = function (data) {
  return [d3.min(data.map(function (d) { return d.value; })),
    d3.max(data.map(function (d) { return d.value; }))];
};

helpers.sortByLabelAsc = function (a, b) { return d3.ascending(a.label, b.label); };

helpers.sortByLabelDesc = function (a, b) { return d3.descending(a.label, b.label); };

helpers.sortByValueAsc = function (a, b) { return b.value - a.value; };

helpers.sortByValueDesc = function (a, b) { return b.value - a.value; };
