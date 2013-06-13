<?php

class Admin_User_Invite_Template extends Notify_Template_Base
{
    public $required_params = array('user');

    public function get_info()
    {
        return array(
            'name'=> 'Admin User Invitation',
            'description' => 'Sent to administrators when their account is first created.',
            'code' => 'admin:user_invite'
        );
    }

    public function get_subject()
    {
        return 'Welcome to {site_name}';
    }

    public function get_content()
    {
        return file_get_contents($this->get_partial_path('content.htm'));
    }

    public function prepare_template($template, $params=array())
    {
        extract($params);

        $user->set_notify_vars($template, 'user_');
        $template->set_vars(array(
            'password' => $user->plain_password,
            'login_link' => Phpr::$request->get_root_url().url('admin/auth/login'),
        ), false);

        $template->add_recipient($user);
    }
}
