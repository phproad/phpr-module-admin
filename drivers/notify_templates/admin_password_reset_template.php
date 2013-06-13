<?php

class Admin_Password_Reset_Template extends Notify_Template_Base
{
    public $required_params = array('user', 'hash');

    public function get_info()
    {
        return array(
            'name'=> 'Admin Password Reset',
            'description' => 'Sent to administrators when they reset their own password.',
            'code' => 'admin:password_reset'
        );
    }

    public function get_subject()
    {
        return 'Password restore';
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
            'link' => Phpr::$request->get_root_url() . url('/admin/auth/restore_complete/' . $hash),
        ), false);

        $template->add_recipient($user);
    }
}
