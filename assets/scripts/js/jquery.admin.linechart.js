
/**
 * Chart widget
 */

;(function ($, window, document, undefined) {

	$.widget("admin.lineChart", {
		version: '1.0.0',
		options: { 
			resetZoomButton: '#chart-reset-zoom'
		},

		// Chart options
		chartOptions: {
			xaxis: { mode: "time", tickLength: 5 },
			selection: { mode: "x" },
			grid: { 
				markingsColor:   "rgba(0,0,0, 0.02)",
				backgroundColor: { colors: ["#fff", "#fff"] },
				borderColor:     "#7bafcc",
				borderWidth:     0,
				color:           "#7bafcc",
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
			colors: ["#7bafcc", "#a6bf85", "#ccc96f", "#71bac3", "#c37171", "#171b19"],
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
		},

		resetZoomButton: null,
		fullDataSet: [],

		_init: function () {
			this.chartOptions.markings = this._weekend_areas;
			this.resetZoomButton = $(this.options.resetZoomButton);
			this.rebuildChart();		
			this.bindEvents();


			this.resetZoomButton.on('click', $.proxy(this.clearZoom, this));
		},

		rebuildChart: function() {
			$.plot(this.element, this.fullDataSet, this.chartOptions);
		},

		clearZoom: function() {
			this.rebuildChart();
			this.resetZoomButton.hide();
		},

		bindEvents: function() { var self = this;
			this.element.on("plotselected", function (event, ranges) {			
				var newCoords = { 
					xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to } 
				};
				
				$.plot(self.element, self.fullDataSet, $.extend(true, {}, self.chartOptions, newCoords));
				self.resetZoomButton.show();
			});
		},

		addData: function(label, dataset) {
			// First correct the timestamps - they are recorded as the daily
			// midnights in UTC+0100, but Flot always displays dates in UTC
			// so we have to add one hour to hit the midnights in the plot
			for (var i = 0; i < dataset.length; ++i) {
				dataset[i][0] += 60 * 60 * 1000;
			}

			this.fullDataSet.push({
				label: label,
				data: dataset
			});

			this.rebuildChart();
		},

		_weekend_areas: function(axes) {
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

	});

})( jQuery, window, document );

