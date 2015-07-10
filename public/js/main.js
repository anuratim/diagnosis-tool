$(document).ready(function() {
	load("cholesterol");
	
	$("#nav").delegate("a", "click", function() {
		load($(this).attr("id"));
	});
});

var prevId;

function highlightNavLink(id) {
	if (prevId) {
		$("#" + prevId).removeClass("pf-active");
	}
	$("#" + id).addClass("pf-active");
	prevId = id;
}

function load(id) {
	var title;
	var drawChartFn;
	
	switch (id) {
		case "cholesterol":
			title = "Your High-Cholesterol Patients";
			drawChartFn = initCholesterol;
			break;

		case "pop-cholesterol":
			title = "Population Trend vs. Your Cholesterol Patients";
			drawChartFn = function() {
				$("#data-bubble-container-cholesterol").css("display", "none");
				
				var goalMin = 70;
				var goalMax = 160;
				var myProviderId = 108;
				var modelForMe = new CholesterolModel(250, goalMin, goalMax, myProviderId);
				var dataForMe = modelForMe.dataset;
				
				// randomProviderId can be anything except myProviderId
				var randomProviderId = 1;
				var dataForOthers = new CholesterolModel(2000, goalMin, goalMax, randomProviderId).dataset;
				
				var range = new Range({
					valueThresholds: _.pluck(modelForMe.BUCKET, "value"),
					valueLabels: _.pluck(modelForMe.BUCKET, "display"),
					cssClassNames: ["good", "warning", "severe", "danger"]
				});
				
				var data = pairedChartHelpers.transformDataForChart(dataForOthers.concat(dataForMe), range, "providerId", myProviderId);
				
				var config = {
					data: data,
					container: "#pop-cholesterol-chart-container",
					width: 500,
					height: 400,
					margins: { top: 75, bottom: 0, left: 75, right: 0 },
					axes: { x: {title: "LDL", orientation: constants.ORIENTATION.bottom}, y: {title: "% Patients", orientation: constants.ORIENTATION.left} },
					yDomain: function() { return [0, .75]; },
					tickFormat: {
						x: new constants.Format("pop-cholesterol").setFormatFn(function(columnIndex) {
							return range.valueLabels[columnIndex];
						}),
						y: constants.FORMAT_FACTORY("percentage")
					},
					// for second column (i === 0), add bucket-specific class;
					// for first column (i === 1), add generic class;
					// this class is also used to trigger clicking the column to view the patients inside
					cssClassNameFn: function(d, i, j) { return i === 0 ? range.cssClassNames[j] : "pair-" + (i + 1); },
					labelFn: function(value) {
						var labelFormatter = constants.FORMAT_FACTORY("percentage").setSpecifier("100.1%");
						return labelFormatter.format(value);
					}
				};
				
				new PairedColumnBubbleChart(config, dataForMe, true);
				
				PopCholesterolView.showPatientTable(modelForMe.getProblemPatients());
				//TODO: don't hard-code color here: addClass not working for some reason
				$("rect.danger").css("fill", "#105085"); 
			};
			break;
			
		case "pop-diabetes":
			title = "Population Trend vs. Your Diabetes Patients";
			drawChartFn = function() {
				$("#data-bubble-container-diabetes").css("display", "none");
				
				// reading greater than 7
				var valueThreshold = 7;
				// months-elapsed greater than 6
				var value0Threshold = 6;
				var highestRiskNum = 10;
				var providerId = 7;//757;//469;//811;
				var diabetesModel = new DiabetesModel(valueThreshold, value0Threshold, highestRiskNum, providerId);
				
				var range = new Range({
					valueThresholds: [7.01, 8.01, 9, 50],
					valueLabels: ["0-7", "7-8", "8-9", "9+"],
					cssClassNames: ["good", "warning", "severe", "danger"],
					titles: ["Patients with a Score less than 7", "Patients with a Score between 7 and 8", "Patients with a Score between 8 and 9", "Patients with a Score greater than 9"]
				});
				
				d3.csv("/data/diabetes.csv", function(rawData) {
					var data = diabetesModel.processData(rawData, range, "PATIENTKEY", "OBSVALUE", "DATE", "providerid");
					DiabetesView.addDataToChart(data, diabetesModel.highestRisk, range);
					//console.log("danger-patients", diabetesModel.getPatientsForBucket(3));
				});
			};
			break;
		
		case "two-condition":
			title = "Your Diabetes and Renal Patients";
			drawChartFn = function() {
				var data = [];
				var propertyName = "loincCodes";
				var diabetesMinValue = 4;
				var conditions = {
					diabetes: { id: "04548-4", domain: [4, 12] },
					creatinine: { id: "02160-0", domain: [0, 100] }
				};
				var d;
				
				for (var i = 0; i < 250; i++) {
					d = { loincCodes: [], label: 0, value: 0 };
					
					// 60% have both conditions
					if (Math.random() >= .6) {
						d.name = "Patient " + i;
						d.label = getRandomNumber(conditions.creatinine);
						d.value = getRandomNumber(conditions.diabetes);
						d.loincCodes.push(conditions.diabetes.id);
						d.loincCodes.push(conditions.creatinine.id);
					}
					
					/*
					// the remaining patients are split 50/50 between the two conditions
					// 20% have Diabetes only
					else if (Math.random() >= .5) {
						d.value = getRandomNumber(conditions.diabetes);
						d.loincCodes.push(conditions.diabetes.id);
					}
					
					// 20% have Creatinine only
					else {
						d.label = getRandomNumber(conditions.creatinine);
						d.loincCodes.push(conditions.creatinine.id);
					}
					*/
					
					data.push(d);
				}
				
				new TwoConditionView(data, propertyName, conditions.diabetes.id, conditions.creatinine.id);
			};
			break;

		case "vaccinations":
			title = "Vaccinations Administered per Month";
			drawChartFn = function() {
				d3.csv("/data/vaccinations.csv", function(rawData) {
					var chartWidth = 800;
					var margins = { top: 20, bottom: 20, left: 75, right: 10 };
					var modelAndView = new VaccinationModelAndView(rawData, "EhrProviderId", "NumVaccinations", "Date", chartWidth, margins);
					modelAndView.drawChart();
				});
			};
			break;
			
		default:
			throw new Error("Unknown id [" + id + "].");
	}
	
	if (prevId) {
		activateContainer(prevId, false);
	}
	
	activateContainer(id, true);
	
	if (drawChartFn) {
		drawChartFn.apply();
	}

	highlightNavLink(id);
	$("#title").html(title);
}

function getRandomNumber(condition) {
	var precision = 100000;
	var min = condition.domain[0]
	var max = condition.domain[1];
	var rnd = helpers.getRandomNumber((max - min) * precision) / precision;
	return rnd + min;
}

function activateContainer(id, activate) {
	if (activate) {
		$("#" + id + "-content").addClass("show");
	}
	
	else {
		$("#" + id + "-chart-container").empty();
		$("#" + id + "-content").removeClass("show");
	}
}
