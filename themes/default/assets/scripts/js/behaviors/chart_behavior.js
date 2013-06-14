var Admin_Page = (function(page, $){

	page.chChartId = 'visitor-chart';
	page.chColors = ["#7bafcc", "#a6bf85", "#ccc96f", "#71bac3", "#c37171", "#171b19"];
	page.chBackgroundColors = ["#fff", "#fff"];

	page.chDataSet = {
		data1: [
			[1359158400000, 20],
			[1359244800000, 75],
			[1359331200000, 150],
			[1359417600000, 222],
			[1359504000000, 230],
			[1359590400000, 218],
			[1359676800000, 234],
			[1359763200000, 298],
			[1359849600000, 211],
			[1359936000000, 207],
			[1360022400000, 276],
			[1360108800000, 312],
			[1360195200000, 313],
			[1360281600000, 385],
			[1360368000000, 280],
			[1360454400000, 293],
			[1360540800000, 214],
			[1360627200000, 273],
			[1360713600000, 311],
			[1360800000000, 300],
			[1360886400000, 322],
			[1360972800000, 355],
			[1361059200000, 323],
			[1361145600000, 302],
			[1361232000000, 350],
			[1361318400000, 374],
			[1361404800000, 322],
			[1361491200000, 298],
			[1361577600000, 302],
			[1361664000000, 325]
		],
		data2: [
			[1359158400000, 1],
			[1359244800000, 8],
			[1359331200000, 16],
			[1359417600000, 32],
			[1359504000000, 65],
			[1359590400000, 63],
			[1359676800000, 53],
			[1359763200000, 65],
			[1359849600000, 69],
			[1359936000000, 46],
			[1360022400000, 43],
			[1360108800000, 62],
			[1360195200000, 50],
			[1360281600000, 45],
			[1360368000000, 64],
			[1360454400000, 58],
			[1360540800000, 22],
			[1360627200000, 56],
			[1360713600000, 43],
			[1360800000000, 60],
			[1360886400000, 58],
			[1360972800000, 66],
			[1361059200000, 45],
			[1361145600000, 22],
			[1361232000000, 56],
			[1361318400000, 68],
			[1361404800000, 45],
			[1361491200000, 49],
			[1361577600000, 65],
			[1361664000000, 77]
		]
	}

	// chart options
	var _chart_options = {
		xaxis: { mode: "time", tickLength: 5 },
		selection: { mode: "x" },
		grid: { 
			markingsColor:   "rgba(0,0,0, 0.02)",
			backgroundColor: { },
			borderColor:     "#f0f0f0",
			borderWidth:     0,
			color:           "#cccccc",
			hoverable:       true,
			clickable:       true
		},
		series: {
			lines: {
				show: true,
				fill: true
			},
			points: {
				show: true
			}
		},
		colors: [],
		tooltip: true,
		tooltipOpts: {
			defaultTheme: false,
			content:      "%x: <strong>%y %s</strong>",
			dateFormat:   "%y-%0m-%0d",
			shifts: {
				x: 10,
				y: 20
			}
		},
		legend: {
			show: true,
			noColumns: 2
		}
	};

	var _plot_obj = null;

	page.chInitChart = function() {
		
		// First correct the timestamps - they are recorded as the daily
		// midnights in UTC+0100, but Flot always displays dates in UTC
		// so we have to add one hour to hit the midnights in the plot
		for (var i = 0; i < page.chDataSet.data1.length; ++i) {
			page.chDataSet.data1[i][0] += 60 * 60 * 1000;
			page.chDataSet.data2[i][0] += 60 * 60 * 1000;
		}
		
		page.chApplyStyles();

		_plot_obj = $.plot(
			$("#"+page.chChartId), [
				{ data: page.chDataSet.data1, label: "Pageviews" }, 
				{ data: page.chDataSet.data2, label: "Visitors" }
			], 
			_chart_options
		);
	}

	page.chBindChart = function() {
		_chart_options.markings = page.chWeekendAreas;
		page.chInitChart();
		page.chBindChartEvents();
	}

	page.chBindChartEvents = function() {

		$("#"+page.chChartId).bind("plotselected", function (event, ranges) {			
			_plot_obj = $.plot(
				$("#"+page.chChartId), [
					{ data: page.chDataSet.data1, label: "Pageviews" }, 
					{ data: page.chDataSet.data2, label: "Visitors" }
				],
				$.extend(true, _chart_options, {
					xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
				})
			);
		});

	}

	page.chClearZoom = function() {		
		_plot_obj = $.plot(
			$("#"+page.chChartId), [
				{ data: page.chDataSet.data1, label: "Pageviews" }, 
				{ data: page.chDataSet.data2, label: "Visitors" }
			],
			_chart_options
		);
	}

	// Helper functions
	
	page.chWeekendAreas = function(axes) {
		var markings = [];
		var d = new Date(axes.xaxis.min);
		// go to the first Saturday
		d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 1) % 7))
		d.setUTCSeconds(0);
		d.setUTCMinutes(0);
		d.setUTCHours(0);
		var i = d.getTime();
		do {
			// When we don't set yaxis, the rectangle automatically
			// extends to infinity upwards and downwards
			markings.push({ xaxis: { from: i, to: i + 2 * 24 * 60 * 60 * 1000 } });
			i += 7 * 24 * 60 * 60 * 1000;
		} while (i < axes.xaxis.max);

		return markings;
	}

	page.chApplyStyles = function() {
		_chart_options.colors = page.chColors;
		_chart_options.grid.backgroundColor = { colors: page.chBackgroundColors };
		_chart_options.grid.borderColor = page.chColors[0];
		_chart_options.grid.color = page.chColors[0];
	}

	return page;
}(Admin_Page || {}, jQuery));