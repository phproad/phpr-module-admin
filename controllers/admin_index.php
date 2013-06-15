<?php

class Admin_Index extends Admin_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->app_menu = 'dash';
	}

	//
	// Dashboard
	// 

	public function index()
	{
		$this->app_page_title = 'Dashboard';
		$this->check_permissions();
	}

	protected function check_permissions()
	{
		if ($this->active_user->get_permission('admin', 'access_dashboard'))
			return;

		$menu = Admin_Menu::create()->get_items();
		if (!$menu)
			Phpr::$security->logout();

		$first_menu = reset($menu);

		Phpr::$response->redirect(url($first_menu->link));
	}

	protected function get_cms_stats()
	{
		$end = Phpr_Date::user_date(Phpr_DateTime::now())->get_date();
		$start = $end->add_days(-6);
		return Cms_Statistics::get_visitor_stats($start, $end);
	}

	protected function get_dash_chart()
	{
		$end = Phpr_Date::user_date(Phpr_DateTime::now())->get_date();
		$start = $end->add_days(-30);
		$cms_data = Cms_Statistics::get_chart_series($start, $end);
		return $cms_data;
	}

	//
	// Quicksearch
	// 

	public function quicksearch()
	{
		$this->suppress_view();
		header('Content-type: application/json');
		$results = Admin_Quicksearch::process_search();
		echo json_encode($results);
	}

}

