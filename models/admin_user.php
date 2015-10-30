<?php

class Admin_User extends Phpr_User
{
    const disabled = -1;

    public $table_name = "admin_users";
    protected $added_fields = array();

    public $calculated_columns = array(
        'short_name'=>"trim(concat(ifnull(first_name, ''), ' ', ifnull(concat(substring(last_name, 1, 1), '. '), ''), ifnull(concat(substring(middle_name, 1, 1), '. '), '')))",
        'name'=>"trim(concat(ifnull(first_name, ''), ' ', ifnull(last_name, ' '), ' ', ifnull(middle_name, '')))",
        'state'=>'if(status is null or status = 0, "Active", if (status=-1, "Disabled", "Active"))'
    );

    public $has_and_belongs_to_many = array(
        'rights'=>array('class_name'=>'Admin_Group', 'join_table'=>'admin_groups_users')
    );

    public $custom_columns = array('password_confirm'=>db_text, 'send_invitation'=>db_bool);
    protected $plain_password = null;
    protected $is_super_administrator_cache = null;
    protected $is_super_administrator_on_load = null;

    public $password_reset_mode = false;

    public static function create($values = null)
    {
        return new self($values);
    }

    public function define_columns($context = null)
    {
        $this->define_column('name', 'Full Name')->order('asc');
        $this->define_column('first_name', 'First Name')->default_invisible()->validation()->fn('trim')->required();
        $this->define_column('last_name', 'Last Name')->default_invisible()->validation()->fn('trim')->required();
        $this->define_column('middle_name', 'Middle Name')->default_invisible()->validation()->fn('trim');
        $this->define_column('email', 'Email')->validation()->fn('trim')->required()->email();
        $this->define_column('phone', 'Phone Number')->default_invisible()->list_title('Phone')->validation()->fn('trim');
        $this->define_column('mobile', 'Mobile Number')->default_invisible()->list_title('Mobile')->validation()->fn('trim');
        $this->define_column('login', 'Login')->validation()->fn('trim')->required()->unique('Login name "%s" already in use. Please choose another login name.');
        $this->define_column('password', 'Password')->invisible()->validation();
        $this->define_column('password_confirm', 'Password Confirmation')->invisible()->validation();
        $this->define_column('status', 'Status')->invisible();
        $this->define_column('last_login', 'Last Login')->date_format('%x %H:%M');

        $this->define_column('time_zone', 'Time Zone')->default_invisible()->validation()->fn('trim');

        $this->define_column('send_invitation', 'Send invitation by email')->invisible();

        $this->define_multi_relation_column('rights', 'rights', 'Super Admin Rights', '@name')->default_invisible()->validation();

        // Extensibility
        $this->defined_column_list = array();
        Phpr::$events->fire_event('admin:on_extend_user_model', $this, $context);
        $this->api_added_columns = array_keys($this->defined_column_list);

    }

    public function define_form_fields($context = null)
    {
        if (!$this->is_new_record())
            $this->is_super_administrator_on_load = $this->is_super_administrator();

        if ($context != 'mysettings')
        {
            $this->add_form_field('first_name', 'left')->tab('Contacts');
            $this->add_form_field('last_name', 'right')->tab('Contacts');
            $this->add_form_field('middle_name')->tab('Contacts');
            $this->add_form_field('email')->tab('Contacts');

            $this->add_form_field('phone', 'left')->tab('Contacts');
            $this->add_form_field('mobile', 'right')->tab('Contacts');

            $this->add_form_field('status')->tab('Account')->display_as(frm_dropdown);
            $this->add_form_field('login')->tab('Account');
            $this->add_form_field('password', 'left')->tab('Account')->display_as(frm_password)->no_preview();
            $this->add_form_field('password_confirm', 'right')->tab('Account')->display_as(frm_password)->no_preview();
            $this->add_form_field('rights')->tab('Account')->display_as(frm_checkboxlist)->reference_description_field('concat(@description)')->preview_no_options_message('Rights are not set.')->preview_no_relation();

            if ($this->is_new_record())
            {
                $field = $this->add_form_field('send_invitation')->tab('Contacts');

                if (!Phpr_Module_Manager::module_exists('user'))
                    $field->comment('The message cannot be send because email system is not installed.')->disabled();
                else
                    $field->comment('Use this checkbox to send an invitation to the user by email.');
            }

            $this->load_permissions_ui();

            if (!$this->is_new_record())
                $this->load_user_permissions();
        }
        else
        {
            $this->add_form_field('first_name', 'left')->tab('My Settings');
            $this->add_form_field('last_name', 'right')->tab('My Settings');
            $this->add_form_field('middle_name')->tab('My Settings');

            $this->add_form_field('email')->tab('My Settings');

            $this->add_form_field('phone', 'left')->tab('My Settings');
            $this->add_form_field('mobile', 'right')->tab('My Settings');

            $this->add_form_field('password', 'left')->display_as(frm_password)->no_preview()->tab('My Settings');
            $this->add_form_field('password_confirm', 'right')->display_as(frm_password)->no_preview()->tab('My Settings');

            $this->add_form_field('time_zone', 'left')->display_as(frm_dropdown)->tab('Time Zone');
        }

        $tab = $context == 'mysettings' ? 'My Settings' : 'Contacts';

        // Extensibility
        Phpr::$events->fire_event('admin:on_extend_user_form', $this, $context);
        foreach ($this->api_added_columns as $column_name){
            $form_field = $this->find_form_field($column_name);
            if ($form_field)
                $form_field->options_method('get_added_field_options');
        }

    }

    //
    // Extensibility
    //

    public function get_added_field_options($db_name, $current_key_value = -1) {
        $result = Phpr::$events->fire_event('admin:on_get_added_field_options', $db_name, $current_key_value);
        foreach ($result as $options) {
            if (is_array($options) || (strlen($options && $current_key_value != -1)))
                return $options;
        }

        return false;
    }



    //
    // Events
    //

    public function before_save($session_key = null)
    {

        $current_user = Phpr::$security->get_user();

        //only super users can edit super user accounts
        if($this->is_super_administrator_on_load && !$current_user->is_super_administrator()){
            $this->validation->set_error('You cannot edit a super admin account, if you are not a super admin', 'rights', true);
        }

        //check user is allowed to grant super user status.
        if ($this->is_saving_a_super_admin() && !$current_user->is_super_administrator()){
            $this->validation->set_error('You cannot grant super admin rights unless you are super admin', 'rights', true);
        }

        //check current user is not removing their own super admin status
        if (!$this->is_new_record()){
            if ($current_user && $current_user->id == $this->id && $this->is_super_administrator_on_load && !$this->rights)
                $this->validation->set_error('You cannot cancel super admin rights for your own user account.', 'rights', true);
        }


        //passwords
        $this->plain_password = $this->password;

        if (strlen($this->password) || strlen($this->password_confirm))
        {
            if ($this->password != $this->password_confirm)
                $this->validation->set_error('Password and confirmation password do not match', 'password', true);
        }

        if (!strlen($this->password))
        {
            if ($this->is_new_record() || $this->password_reset_mode)
                $this->validation->set_error('Please provide a password', 'password', true);
            else
                $this->password = $this->fetched['password'];
        } else
        {
            $this->password = Phpr_SecurityFramework::create()->salted_hash($this->password);
        }


        if(empty($this->time_zone)){
            $this->time_zone = Phpr::$config->get('TIMEZONE');
        }


    }

    public function after_save()
    {
        if ($this->rights)
            return;

        if ($this->added_fields)
        {
            $current_user = Phpr::$security->get_user();

            foreach ($this->added_fields as $code=>$info)
            {
                $module = $info[0];
                if(self::restrict_permission_edits($module->get_id(), $current_user )){
                    continue;
                }
                Admin_Rights::save_permissions($this->id, $module->get_id(), $info[1], $this->$code);
            }
        }
    }

    public function after_create()
    {
        if (!$this->send_invitation)
            return;

        Notify::trigger('admin:user_invite', array('user'=>$this));
    }

    public function before_delete($id = null)
    {
        $current_user = Phpr::$security->get_user();

        //no delete super user account
        if($this->is_super_administrator_on_load){
            throw new Phpr_ApplicationException("You cannot delete a super user account.");
        }

        //no delete own account
        if ($current_user && $current_user->id == $this->id)
            throw new Phpr_ApplicationException("You cannot delete your own user account.");

        //no delete if logged in before
        if ($this->last_login)
            throw new Phpr_ApplicationException("Users cannot be deleted after first login. You may disable the user account instead of deleting.");

    }

    //
    // Options
    //

    public function get_status_options($key_value = -1)
    {
        $result = array();
        $result[0] = 'Active';
        $result[-1] = 'Disabled';

        return $result;
    }

    public function get_time_zone_options($key_value = -1)
    {
        $time_zones = Phpr\TimeZone::get_timezone_list();

        if ($key_value != -1) {
            if (!strlen($key_value))
                return null;

            return $time_zones[$key_value];
        }

        $time_zones[null] = 'Undefined';
        return $time_zones;
    }

    //
    // Service methods
    //

    public function create_password_reset_hash()
    {
        $this->password_reset_hash = Phpr_SecurityFramework::create()->salted_hash(rand(1,400));
        $this->password = null;
        $this->save();

        return $this->password_reset_hash;
    }

    public function clear_password_reset_hash()
    {
        $this->password_reset_hash = null;
        $this->password = null;
        $this->save();
    }

    public function belongs_to_groups($groups)
    {
        $groups = Phpr_Util::splat($groups);

        $rights = $this->rights;
        foreach ($rights as $right)
        {
            if (in_array($right->code, $groups))
                return true;
        }

        return false;
    }

    public function update_last_login()
    {
        Db_Helper::query(
            "update admin_users set last_login=:last_login where id=:id",
            array('id'=>$this->id, 'last_login'=>Phpr_DateTime::now())
        );
    }

    public function set_notify_vars(&$template, $prefix='')
    {
        $template->set_vars(array(
            $prefix.'name'         => $this->name,
            $prefix.'first_name'   => $this->first_name,
            $prefix.'middle_name'  => $this->middle_name,
            $prefix.'last_name'    => $this->last_name,
            $prefix.'email'        => $this->email,
            $prefix.'login'        => $this->login,
            $prefix.'password'     => $this->plain_password,
            $prefix.'phone'        => $this->phone,
            $prefix.'mobile'       => $this->mobile,
        ));
    }


    //
    // Custom fields
    //

    public function add_permission_field($module, $code, $title, $side = 'full', $type = db_text)
    {
        $module_id = $module->get_id();

        $original_code = $code;
        $code = $module_id.'_'.$code;

        $this->define_custom_column($code, $title, $type)->validation();
        $form_field = $this->add_form_field($code, $side)->options_method('get_added_permission_field_options')->tab($module->get_module_info()->name)->css_class_name('permission_field');

        $this->added_fields[$code] = array($module, $original_code);

        return $form_field;
    }

    public function get_added_permission_field_options($db_name, $current_key_value = -1)
    {
        if (!isset($db_name, $this->added_fields))
            return array();

        $module = $this->added_fields[$db_name][0];
        $code = $this->added_fields[$db_name][1];
        $class_name = get_class($module);

        $method_name = "get_".$code."_options";
        if (!method_exists($module, $method_name))
            throw new Phpr_SystemException("Method ".$method_name." is not defined in ".$class_name." class.");

        return $module->$method_name($current_key_value);
    }

    //
    // Permissions
    //

    public function is_super_administrator()
    {
        if ($this->is_super_administrator_cache !== null)
            return $this->is_super_administrator_cache;

        return $this->is_super_administrator_cache = $this->belongs_to_groups(Admin_Group::super_admin);
    }

    protected function is_saving_a_super_admin(){
        //when saving rights, they are presented as an array.
        $super_admin_group = Admin_Group::create()->find_by_code(Admin_Group::super_admin);
        if(is_array($this->rights)){
            foreach($this->rights as $right_id){
                if($right_id == $super_admin_group->id){
                    return true;
                }
            }
        }
        return false;
    }

    protected function load_user_permissions()
    {
        $permissions = Admin_Rights::get_permissions($this->id);
        foreach ($permissions as $permission)
        {
            $field_code = $permission->module_id.'_'.$permission->name;
            if (array_key_exists($field_code, $this->added_fields))
            {
                $this->$field_code = $permission->value;
            }
        }
    }

    public function get_permission($module_id, $name)
    {
        if ($this->is_super_administrator())
            return true;

        if (!is_array($name))
            return Admin_Rights::get_permission($this->id, $module_id, $name);
        else
        {
            foreach ($name as $permission)
            {
                if (Admin_Rights::get_permission($this->id, $module_id, $permission))
                    return true;
            }

            return false;
        }
    }

    public static function list_users_having_permission($module_id, $name)
    {
        $users = self::create()->find_all();
        $result = array();

        foreach ($users as $user)
        {
            if ($user->status == self::disabled)
                continue;

            if ($user->get_permission($module_id, $name))
                $result[] = $user;
        }

        return $result;
    }

    public static function get_super_administrators()
    {
        $users = self::create()->find_all();
        $result = array();

        foreach ($users as $user) {
            if ($user->status == self::disabled)
                continue;

            if ($user->is_super_administrator())
                $result[] = $user;
        }

        return $result;
    }

    private function load_permissions_ui()
    {
        $modules = Core_Module_Manager::get_modules();
        $current_user = Phpr::$security->get_user();

        foreach ($modules as $id=>$module)
        {
            if(self::restrict_permission_edits($module->get_id(), $current_user )){
                continue;
            }

            $module->build_admin_permissions($this);
        }
    }

    public static function restrict_permission_edits($module_id, Admin_User $user){

        $block_permission_edit = (Phpr::$config != null)
            ? Phpr::$config->get("RESTRICT_MODULE_PERMISSION_EDIT", array())
            : array();

        if(in_array($module_id,$block_permission_edit) && !$user->is_super_administrator()){
            return true;
        }

        return false;
    }

    // Required by PHPR
    public function find_user($login, $password)
    {
        return $this->where('login = lower(?)', $login)->where('password = ?', Phpr_SecurityFramework::create()->salted_hash($password))->find();
    }
}

