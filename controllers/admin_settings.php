<?php

class Admin_Settings extends Admin_Controller
{
	protected $required_permissions = array('admin:manage_settings');
	
	public function __construct()
	{
		parent::__construct();
		$this->app_menu = 'system';
		$this->app_module_name = 'System';
	}

	public function index()
	{
		$this->app_page_title = 'Settings';
		$this->app_page = 'settings';

		$this->view_data['items'] = Core_Settings::create()->get();
	}
}

