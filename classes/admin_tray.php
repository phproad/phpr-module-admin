<?php

/**
 * Admin System Tray
 */

class Admin_Tray
{
	protected $items;
	protected $module_id;
	protected static $self = null;

	public function __construct()
	{
		$this->items = array();
		$this->load_items();
	}

	public static function create()
	{
		if (!self::$self)
			self::$self = new self();

		return self::$self;
	}

	protected function load_items()
	{
		$modules = Core_Module_Manager::get_modules();

		foreach ($modules as $id => $module)
		{
			$this->module_id = strtolower($id);
			$module->build_admin_tray($this);
		}

		uasort($this->items, array('Admin_Tray', 'compare_tray_positions'));
	}

	public static function compare_tray_positions($a, $b)
	{
		if ($a->position >= $b->position)
			return true;
		else
			return false;
	}

	public function add($id, $name, $position=500)
	{
		return $this->items[] = new Admin_Tray_Item($id, $name, $position, $this->module_id);
	}

	public function get_items()
	{
		if (!count($this->items))
			return null;

		return $this->items;
	}	
}