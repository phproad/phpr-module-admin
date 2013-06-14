<?php

class Admin_Updates extends Admin_Controller
{
	public $implement = 'Db_List_Behavior, Db_Form_Behavior';

	protected $required_permissions = array('admin:manage_updates');

	public function __construct()
	{
		parent::__construct();
		$this->app_menu = 'system';
		$this->app_page = 'updates';
		$this->app_module_name = 'Admin';
	}

	public function index()
	{
		$this->app_page_title = 'Software Update';
		$this->view_data['modules'] = $modules = Core_Module_Manager::get_modules();
	}

	protected function index_on_update_form()
	{
		$this->display_partial('updates_check_form');
	}

	protected function index_on_check_for_updates()
	{
		try
		{
			$update_data = Core_Update_Manager::create()->request_update_list();
			$this->view_data['update_list'] = $update_data;
		}
		catch (Exception $ex)
		{
			$this->view_data['error'] = $ex->getMessage();
		}

		$this->display_partial('update_list');
	}

	protected function index_on_apply_updates()
	{
		try
		{
			Core_Update_Manager::create()->update_application();
			Phpr::$session->flash['success'] = 'Software has been updated successfully';
			Phpr::$response->redirect(url('admin/updates'));
		}
		catch (Exception $ex)
		{
			Phpr::$response->ajax_report_exception($ex, true, true);
		}
	}

	protected function index_on_force_update()
	{
		try
		{
			Core_Update_Manager::create()->update_application(true);
			Phpr::$session->flash['success'] = 'Software has been updated successfully';
			Phpr::$response->redirect(url('admin/updates'));
		}
		catch (Exception $ex)
		{
			Phpr::$response->ajax_report_exception($ex, true, true);
		}
	}


}