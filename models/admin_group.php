<?php

class Admin_Group extends Db_ActiveRecord
{
	const admin = 'administrator';
	
	public $table_name = 'admin_groups';
	
	public static function create($values = null)
	{
		return new self($values);
	}
}
