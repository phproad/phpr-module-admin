<?php
 /*
 * Admin_Chart -- PHP wrapper for the popular JS charting library Highcharts
 * Author:       jmaclabs@gmail.com
 * File:         Admin_Chart.php
 * Date:         Sun Jan 29 20:35:13 PST 2012
 * Version:      1.0.5
 *
 * Licensed to Gravity.com under one or more contributor license agreements.
 * See the NOTICE file distributed with this work for additional information
 * regarding copyright ownership.  Gravity.com licenses this file to you use
 * under the Apache License, Version 2.0 (the License); you may not this
 * file except in compliance with the License.  You may obtain a copy of the
 * License at 
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* Usage:

echo Admin_Chart::set_charts_location(url('admin/assets/extras/highcharts/highcharts.src.js'));

$chart_data = array(5324, 7534, 6234, 7234, 8251, 10324);

$linechart = new Admin_Chart();
$linechart->chart->type = 'line';
$linechart->chart->renderTo = 'linechart';
$linechart->title->text = 'Line Chart';

$series1 = new Admin_Chart_Series_Data();
$series1->addName('myData')->addData($chart_data);

$linechart->addSeries($series1);

echo '<script>';
echo $linechart->renderChart();
echo '</script>';

*/

class Admin_Chart 
{

	public $chart;
	public $title;
	public $series = array();

	// Types
	// area, areaspline, bar, column, line, pie, scatter, spline
	function __construct($type=null)
	{
		$this->chart = new stdClass();
		$this->title = new stdClass();
		$this->series = new stdClass();

		if ($type)
			$this->chart->type = $type;

		$this->title->text = "Untitled";

		$this->xAxis = new stdClass();
		$this->xAxis->title = new stdClass();
		$this->yAxis = new stdClass();
		$this->yAxis->title = new stdClass();
		$this->legend = new stdClass();
	}

	public static function create($type=null) 
	{
		return new self($type);
	}

	public static function create_dataset()
	{
		return new Admin_Chart_Data();
	}

	public function addSeries($chartData)
	{
		
		if(!is_object($chartData))
		{
			die("Admin_Chart::addSeries() - series input format must be an object.");
		}

		if (is_object($this->series))
		{
			$this->series = array($chartData);
		} 
		else if(is_array($this->series)) 
		{
			array_push($this->series, $chartData);
		}
	}

	public function renderChart($engine = 'jquery')
	{
		if ($engine == 'mootools')
			$chart_js = 'window.addEvent(\'domready\', function() {';
		else
			$chart_js = '$(document).ready(function() {';

		$options = new Admin_Chart_Options();

		$chart_js .= "\n    Highcharts.setOptions(\n";
		$chart_js .= "       " . json_encode($options) . "\n";
		$chart_js .= "    );\n";
		$chart_js .= "\n\n    // '" . $this->title->text . "' " . $this->chart->type . " chart";
		$chart_js .= "\n    var " . $this->chart->renderTo . " = new Highcharts.Chart(\n";
		$chart_js .= "       " . $this->get_chart_options_object() . "\n";
		$chart_js .= "    );\n";
		$chart_js .= "\n  });\n";
		return trim($chart_js);
	}
	
	public function get_chart_options_object()
	{
		return trim(json_encode($this));
	}
}

class Admin_Chart_Options 
{
	public $global;
	
	function __construct()
	{
		$this->global = new stdClass();
		$this->global->useUTC = true;
	}
}

class Admin_Chart_Data {

	public $name;
	public $data = array();
	
	public function setName($name)
	{
		$this->name = $name;
		return $this;
	}

	public function setType($type)
	{
		$this->type = $type;
		return $this;
	}

	public function setData($data)
	{
		$this->data = $data;
		return $this;
	}

	public function setColor($color)
	{
		$this->color = $color;
		return $this;
	}

	public function isDate($start_time='-7 day', $int_days=1)
	{
		$this->pointStart = strtotime($start_time) * 1000;
		$this->pointInterval = (24 * 3600 * 1000) * $int_days; // one day
		return $this;
	}
}