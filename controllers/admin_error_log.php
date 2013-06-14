<?php

class Admin_Error_Log extends Admin_Settings_Controller
{
	public $implement = 'Db_List_Behavior, Db_Form_Behavior';
	public $list_model_class = 'Phpr_Trace_Log_Record';
	public $list_record_url = null;

	public $form_preview_title = 'Preview';
	public $form_model_class = 'Phpr_Trace_Log_Record';
	public $form_not_found_message = 'Record not found';
	public $form_redirect = null;
	
	public function __construct()
	{
		parent::__construct();
		$this->app_menu = 'admin';
		$this->app_module_name = 'Admin';

		$this->list_record_url = url('admin/error_log/preview');
		$this->form_redirect = url('admin/error_log');
	}
	
	public function index()
	{
		try
		{
			$this->app_page_title = 'Error Log';
		}
		catch (Exception $ex)
		{
			$this->handle_page_error($ex);
		}
	}
	
	protected function index_on_clear()
	{
		try
		{
			Db_Helper::query('delete from phpr_trace_log where log="ERROR"');
			Phpr::$session->flash['success'] = 'Error log records have been successfully deleted.';
			Phpr::$response->redirect(url('admin/error_log'));
		}
		catch (Exception $ex)
		{
			Phpr::$response->ajax_report_exception($ex, true, true);
		}
	}

}