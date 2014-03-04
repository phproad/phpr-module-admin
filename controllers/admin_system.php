<?php

class Admin_System extends Admin_Controller
{
	protected $required_permissions = array('admin:manage_settings',
                                            'admin:manage_users',
                                            'admin:manage_updates');
	
	public function __construct()
	{
		parent::__construct();
		$this->app_menu = 'system';
		$this->app_module_name = 'System';
	}

	public function index()
	{
		$this->app_page_title = 'System';
		$this->app_page = 'system';

        //settings
        if($this->active_user->get_permission('admin', 'manage_settings')){
        Phpr::$response->redirect(url('admin/settings/'));
        }

        //users
        if($this->active_user->get_permission('admin', 'manage_users')){
        Phpr::$response->redirect(url('admin/users/'));
        }

        //updates
        if($this->active_user->get_permission('admin', 'manage_updates')){
        Phpr::$response->redirect(url('admin/updates/'));
        }

        //default to no content with navigation menu.

	}
}

