<?php

class Admin_Menu_Item
{

	public $id;
	public $name;
	public $link;
	public $icon;
	public $position;
	public $module;
	public $label;
	public $permission;
	public $visible;

	public $children;

	public function __construct($id, $name, $link, $position, $module)
	{
		$this->id = $id;
		$this->name = $name;
		$this->link = $link;
		$this->position = $position;
		$this->module = $module;
		$this->children = array();
		$this->visible = $this->check_permission();
	}

	public function add_child($id, $name, $link, $position=500)
	{
		return $this->children[] = new self($id, $name, $link, $position, $this->module);
	}

	public function sort_children()
	{
		if (!count($this->children))
			return;

		uasort($this->children, array('Admin_Menu', 'compare_menu_positions'));

		foreach ($this->children as $item)
			$item->sort_children();
	}

	public function print_children($selected_id=null, $show_nested=true, $params=array())
	{

		$default_options = array(
			'wrap_tag' => 'ul',
			'active_class' => 'active'
		);

		$options = array_merge($default_options, $params);

		$str = "";
		$children = $this->children;
		if ($children)
		{
			if ($options['wrap_tag'])
				$str .= "<".$options['wrap_tag'].">".PHP_EOL;

			foreach ($children as $child)
			{
				$current = ($selected_id == $child->id) ? $options['active_class'] : '';
				$str .= '<li class="'. $current .'"><a href="'.url($child->link).'">'.$child->name.'</a>';
				if ($show_nested && $child->children)
				{
					$str .= $child->print_children();
				}
				$str .= '</li>'.PHP_EOL;
			}
			
			if ($options['wrap_tag'])
				$str .= "</".$options['wrap_tag'].">".PHP_EOL;
		}
		return $str;
	}

	public function check_permission()
	{
		if (!$this->permission)
			return true;

		if (!is_array($this->permission))
			$this->permission = array($this->permission);

		$user = Phpr::$security->get_user();

		foreach ($this->permission as $permission)
		{
			if ($user->get_permission($this->module, $permission))
				return true;
		}

		return false;
	}

	// Setters
	//

	public function set_id($value) 
	{ 
		$this->id = $value; return $this; 
	}

	public function name($value) 
	{ 
		$this->name = $value; return $this; 
	}

	public function position($value) 
	{ 
		$this->position = $value; return $this; 
	}

	public function link($value) 
	{ 
		$this->link = $value; return $this; 
	}

	public function label($value) 
	{ 
		$this->label = $value; return $this; 
	}

	public function permission($value) 
	{ 
		$this->permission = $value; 
		$this->visible = $this->check_permission();
		return $this; 
	}

	public function icon($value)
	{
		$this->icon = $value;
		return $this;
	}

}