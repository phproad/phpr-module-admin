<?php

class Admin_Settings_Controller extends Admin_Controller
{
	public function __construct()
	{
		parent::__construct();
		
		$this->app_module = 'system';
		$this->app_menu = 'system';
		$this->app_module_name = 'System';
		$this->app_page = 'settings';
	}
}

