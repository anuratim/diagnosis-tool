/*globals $:true, d3:true, helpers:true, AreaChart:true*/

var data = [], random = function (x) { return Math.ceil(Math.random() * x); };

var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var startDate = new Date(2012, 0, random(365))
   	,endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 10);

for (var d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
	var currDate = new Date(d);
 	var formattedDate = currDate.getDate() + "-" + monthNames[currDate.getMonth()] + "-" + (currDate.getFullYear() - 2000);     
	data.push({"value": random(100), "date": formattedDate});
}

// Create default configs for
var config = {
  "data": data,
  "container": ".module"
};

var areaChart = new AreaChart(config);

$("#refresh").click(function () {
  var data = [];
  var limit = random(20) + 2;
	var startDate = new Date(2012, 0, random(365))
  	 	,endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + limit);

	for (var d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
		var currDate = new Date(d);
 		var formattedDate = currDate.getDate() + "-" + monthNames[currDate.getMonth()] + "-" + (currDate.getFullYear() - 2000);     
		data.push({"value": random(100), "date": formattedDate});
	}
	
  areaChart
    .data(data)
    .draw();
});
