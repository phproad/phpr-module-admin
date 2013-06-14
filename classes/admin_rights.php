<?php

class Admin_Rights
{
	public $table_name = 'admin_rights';

	protected static $permission_cache = array();

	public static function save_permissions($user_id, $module_id, $name, $value)
	{
		$bind = array(
			'user_id'=>$user_id,
			'module_id'=>$module_id,
			'name'=>$name,
			'value'=>$value);

		Db_Helper::query('delete from admin_rights where user_id=:user_id and module_id=:module_id and name=:name', $bind );

		Db_Helper::query('insert into admin_rights (user_id, module_id, name, value) values(:user_id, :module_id, :name, :value)', $bind);
	}

	public static function get_permission($user_id, $module_id, $name)
	{
		if (!array_key_exists($user_id, self::$permission_cache))
		{
			$permissions = Db_Helper::object_array(
				'select * from admin_rights where user_id=:user_id',
				array('user_id'=>$user_id));

			$user_permissions = array();
			foreach ($permissions as $permission)
			{
				if (!array_key_exists($permission->module_id, $user_permissions))
					$user_permissions[$permission->module_id] = array();

				$user_permissions[$permission->module_id][$permission->name] = $permission->value;
			}

			self::$permission_cache[$user_id] = $user_permissions;
		}

		if (!array_key_exists($user_id, self::$permission_cache))
			return null;

		if (!array_key_exists($module_id, self::$permission_cache[$user_id]))
			return null;

		if (!array_key_exists($name, self::$permission_cache[$user_id][$module_id]))
			return null;

		return self::$permission_cache[$user_id][$module_id][$name];
	}

	public static function get_permissions($user_id)
	{
		return Db_Helper::object_array('select * from admin_rights where user_id=:user_id',
			array('user_id'=>$user_id)
		);
	}
}

