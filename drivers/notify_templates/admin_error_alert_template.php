<?php

class Admin_Error_Alert_Template extends Notify_Template_Base
{
    public $required_params = array('user','error');

    public function get_info()
    {
        return array(
            'name'=> 'Admin Error Alert',
            'description' => 'Sent to administrators when the system encounters a significant issue.',
            'code' => 'admin:error_alert'
        );
    }

    public function get_internal_subject()
    {
        return "Error Alert";
    }

    public function get_internal_content()
    {
        return file_get_contents($this->get_partial_path('internal_content.htm'));
    }

    public function prepare_template($template, $params=array())
    {
        extract($params);
        if(is_object($error)){
            $error_message = $error->getMessage();
        } else {
            $error_message = $error;
        }
        $user->set_notify_vars($template, 'user_');
        $template->set_vars(array(
            'error_msg' => $error_message,
            'link' => Phpr::$request->get_root_url() . url('/admin/error_log/'),
        ), false);

        $template->add_recipient($user);
    }
}
