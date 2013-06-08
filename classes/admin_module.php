<?php

class Admin_Module extends Core_Module_Base
{

	protected function set_module_info()
	{
		return new Core_Module_Detail(
			"Admin",
			"Administration interface",
			"PHP Road",
			"http://phproad.com/"
		);
	}

}
