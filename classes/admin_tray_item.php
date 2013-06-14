<?php

class Admin_Tray_Item
{
	public $id;
	public $name;
	public $link;
	public $icon;
	public $position;
	public $module_id;
	
	public $partial_name;
	public $partial_path;
	public $use_partial;

	public function __construct($id, $name, $position, $module_id)
	{
		$this->id = $id;
		$this->name = $name;
		$this->position = $position;
		$this->module_id = $module_id;

		$this->link = 'javascript:;';
		$this->partial_name = null;
		$this->use_partial = false;
	}

	//
	// Setters
	// 

	public function icon($value)
	{
		$this->icon = $value;
		return $this;
	}

	public function partial($value)
	{
		$this->partial_name = $value;

		if (!$this->validate_partial())
			throw new Phpr_SystemException('The system tray partial file "'.$this->partial_name.'" does not exist.');

		$this->use_partial = true;
		return $this;
	}
	
	public function link($value)
	{
		$this->link = $value;
		return $this;
	}

	private function validate_partial()
	{
		if (!$this->partial_name)
			return false;

		$default_path = PATH_APP.'/'.PHPR_MODULES.'/'.$this->module_id.'/'.'partials';

		$test_paths = array(
			$this->partial_name,
			$default_path . '/' . $this->partial_name,
			$default_path . '/' . $this->partial_name.'.htm'
		);

		foreach ($test_paths as $path) {
			if (!file_exists($path))
				continue;
			
			$this->partial_path = $path;
			return true;
		}

		return false;
	}

}