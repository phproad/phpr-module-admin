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

    public function subscribe_events(){

        Phpr::$events->add_event('phpr:on_execute_cron_exception', $this, 'cron_exception_alert_super_admins');
    }


        public function build_admin_menu($menu)
    {
        $dash = $menu->add('dash', 'Dashboard', '/', 100)->icon('dashboard')->permission('access_dashboard');

        $system = $menu->add('system', 'System', '/admin/system/', 1000)->icon('cog')->permission(array('manage_users', 'manage_updates', 'manage_settings'));
        $system->add_child('settings', 'Settings', '/admin/settings')->permission('manage_settings');


        if (!Phpr::$config->get('DISABLE_UPDATES', false))
            $system->add_child('updates', 'Updates', '/admin/updates')->permission('manage_updates');

        $system->add_child('admins', 'Administrators', '/admin/users')->permission('manage_users');
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
        $host->add_permission_field($this, 'manage_users', 'Manage administrators', 'right')->display_as(frm_checkbox)->comment('Manage administration members');
        $host->add_permission_field($this, 'manage_updates', 'Manage updates', 'left')->display_as(frm_checkbox)->comment('Manage software updates');
        $host->add_permission_field($this, 'manage_settings', 'Manage settings', 'right')->display_as(frm_checkbox)->comment('Manage website settings');
    }

    public function build_quicksearch_feed($feed, $query)
    {
        $feed->add('users', Admin_User::create(), array(
            'item_name' => 'Administrator',
            'icon' => 'shield',
            'label_field' => 'short_name',
            'search_fields' => array('login', 'email', 'first_name', 'last_name'),
            'link' => url('admin/users/edit/%s')
        ));
    }

    public function cron_exception_alert_super_admins($exception){

        trace_log('triggeres_admin_cron_alert');

        $alert_admins = Phpr::$config->get('CRON_FAIL_ALERT_ADMIN', false);

        if($alert_admins) {
            $admins = Admin_User::get_super_administrators();
            foreach($admins as $admin){
                Notify::trigger('admin:error_alert',array('user'=>$admin,'error'=>$exception));
            }
        }

    }

}
