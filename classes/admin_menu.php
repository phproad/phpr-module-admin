<?php

class Admin_Menu
{
	protected $items;
	protected $module;
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

		foreach ($modules as $id=>$module)
		{
			$this->module = strtolower($id);
			$module->build_admin_menu($this);
		}

		$this->sort_items($this->items);
	}

	protected function sort_items(&$items)
	{
		uasort($items, array('Admin_Menu', 'compare_menu_positions'));

		foreach ($this->items as $item)
			$item->sort_children();
	}

	public function add($id, $name, $link=null, $position=500)
	{
		return $this->items[] = new Admin_Menu_Item($id, $name, $link, $position, $this->module);
	}

	public function get_items($include_hidden=false)
	{
		if (!count($this->items))
			return null;

		if ($include_hidden)
			return $this->items;

		return $this->apply_menu_visibility($this->items);
	}

	private function apply_menu_visibility(&$items)
	{
		foreach ($items as $key=>$item)
		{
			if (!$item->visible)
				unset($items[$key]);

			if ($item->children)
				$this->apply_menu_visibility($item->children);
		}

		return $items;
	}

	public static function compare_menu_positions($a, $b)
	{
		if ($a->position >= $b->position)
			return true;
		else
			return false;
	}
}