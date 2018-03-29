<?php

class Admin_Users extends Admin_Controller
{
    public $implement = 'Db_List_Behavior, Db_Form_Behavior, Db_Filter_Behavior';
    public $list_model_class = 'Admin_User';
    public $list_record_url = null;

    public $form_preview_title = 'Administrator';
    public $form_create_title = 'New Administrator';
    public $form_edit_title = 'Edit Administrator';
    public $form_model_class = 'Admin_User';
    public $form_not_found_message = 'User not found';
    public $form_redirect = null;

    public $form_edit_save_flash = 'Administrator has been successfully saved';
    public $form_create_save_flash = 'Administrator has been successfully added';
    public $form_edit_delete_flash = 'Administrator has been successfully deleted';

    public $list_search_enabled = true;
    public $list_search_fields = array('@first_name', '@last_name', '@email', '@login');
    public $list_search_prompt = 'find users by name, login or email';
	public $list_render_filters = true;

	public $filter_list_title = 'Filter items';
	public $filter_on_apply = 'listReload();';
	public $filter_on_remove = 'listReload();';
	public $filter_filters = array();

	public $filter_switchers = array(
		'hide_disabled'=>array('name'=>'Hide disabled accounts', 'class_name'=>'Admin_HideDisabledAccountsSwitcher')
	);

    protected $required_permissions = array('admin:manage_users');

    protected $access_exceptions = array('mysettings');

    public function __construct()
    {
        parent::__construct();
        $this->app_menu = 'system';
        $this->app_page = 'admins';
        $this->app_module_name = 'System';

        $this->list_record_url = url('admin/users/edit');
        $this->form_redirect = url('admin/users');
    }

    public function index()
    {
        $this->app_page_title = 'Administrators';
    }


	public function list_prepare_data(){
		$obj = new Admin_User();
		$this->filter_apply_to_model($obj);
		return $obj;
	}

    //
    // My settings
    //

    public function mysettings()
    {
        $this->edit($this->active_user->id, 'mysettings');
        $this->app_page_title = 'My Settings';
    }

    protected function mysettings_on_save()
    {
        $this->form_redirect = null;
        $this->form_edit_save_flash = null;

        $this->edit_on_save($this->active_user->id);
        echo Admin_Html::flash_message('Your settings have been saved.');
    }

    protected function mysettings_on_reset_preferences()
    {
        $this->form_redirect = null;
        $this->form_edit_save_flash = null;

        Phpr_User_Parameters::reset($this->active_user->id);

        echo Admin_Html::flash_message('Your preferences have been reset.');
    }
}

