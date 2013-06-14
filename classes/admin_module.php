<?php

class Admin_Module extends Core_Module_Base
{

	protected function set_module_info()
	{
		return new Core_Module_Detail(
			"Admin",
			"Administration interface",
			"PHPRoad",
			"http://phproad.com/"
		);
	}

	public function build_admin_menu($menu)
	{
		$dash = $menu->add('dash', 'Dashboard', '/', 100)->icon('dashboard')->permission('access_dashboard');

		$system = $menu->add('system', 'System', '/admin/settings', 1000)->icon('cog')->permission(array('manage_users', 'manage_updates', 'manage_settings'));
		$system->add_child('admins', 'Staff', '/admin/users')->permission('manage_users');

		if (!Phpr::$config->get('DISABLE_UPDATES', false))
			$system->add_child('updates', 'Updates', '/admin/updates')->permission('manage_updates');

		$system->add_child('settings', 'Settings', '/admin/settings')->permission('manage_settings');
	}

	public function build_admin_tray($tray)
	{		
		$tray->add('search', 'Search', 100)->partial('tray_search.htm')->icon('search');
		$tray->add('fullscreen', 'Fullscreen', 300)->partial('tray_fullscreen.htm')->icon('fullscreen');
		$tray->add('logout', 'Logout', 600)->link(url('admin/auth/logout'))->icon('off');
	}

	public function build_admin_settings($settings)
	{
		$settings->add('/admin/setup', 'Admin Settings', 'Customise the admin area', '/modules/admin/assets/images/admin_config.png', 20);
		$settings->add('/admin/access_tools', 'Access Tools', 'Edit robots, humans and .htaccess files', '/modules/admin/assets/images/access_config.png', 30);
		$settings->add('/admin/error_log', 'Error Log', 'View error log messages', '/modules/admin/assets/images/error_log.png', 30);
	}

	public function build_admin_permissions($host)
	{
		$host->add_permission_field($this, 'access_dashboard', 'Dashboard', 'left')->display_as(frm_checkbox)->comment('View the dashboard');
		$host->add_permission_field($this, 'manage_users', 'Manage staff', 'right')->display_as(frm_checkbox)->comment('Manage administration staff members');
		$host->add_permission_field($this, 'manage_updates', 'Manage updates', 'left')->display_as(frm_checkbox)->comment('Manage software updates');
		$host->add_permission_field($this, 'manage_settings', 'Manage settings', 'right')->display_as(frm_checkbox)->comment('Manage website settings');
	}

	public function subscribe_access_points($action = null)
	{
		return array(
			'api_admin_quicksearch' => 'Admin_Quicksearch::process_search',
		);
	}

}
