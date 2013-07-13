<?php

class Admin_Controller extends Phpr_Controller
{
	public $app_menu;
	public $app_page;
	public $app_module = null;
	public $app_page_title;
	public $app_module_name;
	public $app_page_subheader = null;

	protected $module_id = null;
	protected $public_actions = array();

	protected $active_user = null;
	protected $access_for_groups = null;
	protected $access_exceptions = null;

	public $list_control_panel;

	protected $required_permissions = array();

	public function __construct()
	{
		Core_Module_Manager::get_modules();

		parent::__construct();

		if (!Phpr::$request->is_remote_event())
		{
			// Vendors
			$this->add_javascript('/modules/admin/assets/extras/chosen/chosen.jquery.js');
			$this->add_javascript('/modules/admin/assets/extras/modernizr/custom.modernizr.js');
			$this->add_javascript('/modules/admin/assets/extras/utility/jquery.utility.scrollbar.js');
			
			// Uploader
			$this->add_javascript('/modules/admin/assets/extras/fileupload/js/jquery.fileupload.js');
			$this->add_javascript('/modules/admin/assets/extras/fileupload/js/jquery.iframe-transport.js');
			
			// Boostrap Framework
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-tooltip.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-affix.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-alert.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-button.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-carousel.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-collapse.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-dropdown.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-modal.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-popover.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-scrollspy.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-tab.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-transition.js');
			$this->add_javascript('/modules/admin/assets/extras/bootstrap/js/bootstrap-typeahead.js');
			
			// Admin
			$this->add_javascript('/modules/admin/assets/scripts/js/jquery.admin.forms.js');
			$this->add_javascript('/modules/admin/assets/scripts/js/jquery.admin.tabmanager.js');
			$this->add_javascript('/modules/admin/assets/scripts/js/jquery.admin.scrollable.js');
			$this->add_javascript('/modules/admin/assets/scripts/js/jquery.admin.scrollable_toolbar.js');
			$this->add_javascript('/modules/admin/assets/scripts/js/jquery.admin.scrollable_tabs.js');            
			$this->add_javascript('/modules/admin/assets/scripts/js/jquery.admin.search_control.js');
			$this->add_javascript('/modules/admin/assets/scripts/js/jquery.admin.sortable_list.js');
			$this->add_javascript('/modules/admin/assets/scripts/js/jquery.admin.uploader.js');
		}

		$this->global_handlers[] = 'hint_hide';

		$this->layout = 'admin';
		$this->layout_path = PATH_APP.'/'.PHPR_MODULES.'/admin/skins/'.Admin_Config::get_theme_id().'/layouts';
		$this->view_path = PATH_APP.'/'.PHPR_MODULES.'/'.$this->get_module_id().'/'.'controllers'.'/'.strtolower(get_class($this));

		$is_public_action = in_array(Phpr::$router->action, $this->public_actions);

		if (!$is_public_action && !Phpr_Controller::$skip_permission_check)
		{
			if (!$is_public_action && !Phpr::$security->cookies_updated)
				Phpr::$security->base_authorization();

			$this->active_user = Phpr::$security->get_user();

			if (is_array($this->access_for_groups))
			{
				if (!(is_array($this->access_exceptions) && in_array(Phpr::$router->action, $this->access_exceptions)))
				{
					if (!$this->active_user || !$this->active_user->belongs_to_groups($this->access_for_groups))
						Phpr::$response->redirect(url('/'));
				}
			}

			if ($this->required_permissions)
			{
				$permission_found = false;
				foreach ($this->required_permissions as $permission)
				{
					$permission_info = explode(':', $permission);
					$count = count($permission_info);
					if ($count != 2)
						throw new Phpr_SystemException('Invalid permission qualifier: '. $permission);

					if ($this->active_user->get_permission($permission_info[0], $permission_info[1]))
					{
						$permission_found = true;
						break;
					}
				}

				if (!$permission_found)
					Phpr::$response->redirect(url('/'));
			}
		}

		if (Phpr::$request->is_remote_event())
		{
			$event_name = isset($_SERVER['HTTP_PHPR_EVENT_HANDLER']) ? $_SERVER['HTTP_PHPR_EVENT_HANDLER'] : null;
			$event_name = substr($event_name, 3, -1);
			Phpr::$events->fire_event('admin:on_before_remote_event', $this, $event_name);
		}

		Phpr::$events->fire_event('admin:on_controller_ready', $this);
	}

	protected function get_module_id()
	{
		if ($this->module_id !== null)
			return $this->module_id;

		$ref_obj = new ReflectionObject($this);
		return $this->module_id = basename(dirname(dirname($ref_obj->getFileName())));
	}

	/**
	 * Helper UI hints
	 */

	protected function hint_render($name, $message, $can_hide=true)
	{
		$str = '<div class="clearfix"></div>';
		if ($can_hide)
			$str .= Phpr_Form::open_tag(array('id'=>'hint-form'));

		$str .= '<div class="alert alert-block hint-container">';
		$str .= '<div class="icon"></div>';
		$str .= $message;

		if ($can_hide)
			$str .= '<a title="Hide this hint" href="javascript:;" class="close-hint" onclick="return Admin_Page.hideHint(\''.$name.'\', this)">Close</a>';

		$str .= '</div>';

		if ($can_hide)
			$str .= '</form>';
		return $str;
	}

	protected function hint_hide()
	{
		$name = post('name');
		if (!$name)
			throw new Phpr_SystemException('Missing hint name');

		$hidden_hints = Phpr_User_Parameters::get('hidden_hints', null, array());
		$hidden_hints[$name] = 1;

		Phpr_User_Parameters::set('hidden_hints', $hidden_hints);
	}

	protected function hint_check($name)
	{
		$hidden_hints = Phpr_User_Parameters::get('hidden_hints', null, array());
		return (!array_key_exists($name, $hidden_hints));
	}

	public function load_view($view, $suppress_layout = false, $suppress_default = false)
	{
		Phpr::$events->fire_event('admin:on_before_display_page', $this, $view);
		parent::load_view($view, $suppress_layout, $suppress_default);
	}

	public function display_partial($view, $params = null, $partial_mode = true, $force_path = false)
	{
		Phpr::$events->fire_event('admin:on_before_display_partial', $this, $view, $params);
		parent::display_partial($view, $params, $partial_mode, $force_path);
	}

	// Form behavior
	// 
	public function handle_page_error($exception_obj)
	{
		Phpr::$session->flash['error'] = $exception_obj->getMessage();
		$this->view_data['fatal_error'] = true;
	}

	public function add_public_action($action)
	{
		$this->public_actions[] = $action;
	}
}
