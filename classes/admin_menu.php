<?php

class Admin_Menu
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
		return $this->items[] = new Admin_Menu_Item($id, $name, $link, $position, $this->module_id);
	}

	public function get_items($include_hidden=false)
	{
		$items = $this->items;

		if (!count($items))
			return null;

		if (!$include_hidden)
			$items = $this->apply_menu_visibility($this->items);

		$items = $this->apply_link_aliases($items);

		return $items;
	}

	public static function compare_menu_positions($a, $b)
	{
		if ($a->position >= $b->position)
			return true;
		else
			return false;
	}

	public function get_active_item($app_menu)
	{
		$active_item = null;
		foreach ($this->get_items() as $item) {
			if ($item->id == $app_menu) {
				$active_item = $item;
			}
		}
		return $active_item;
	}

	//
	// Internals
	// 

	private function apply_link_aliases(&$items)
	{
		foreach ($items as $key=>$item)
		{
			// Link to the first child menu item
			if (strpos($item->link, '@first') !== false && $item->children) {
				$first_child = Phpr_Arr::first($item->children);
				$item->link = str_replace('@first', $first_child->link, $item->link);
			}
		}

		return $items;
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

}