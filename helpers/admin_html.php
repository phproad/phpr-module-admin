<?php

class Admin_Html
{
	public static function url($resource, $add_hostname = false, $protocol = null)
	{
		$resource = Phpr_String::normalize_uri($resource);
		$admin_url = Phpr_String::normalize_uri(Phpr::$config->get('ADMIN_URL', 'admin'));

		return Phpr_Url::root_url($admin_url.$resource, $add_hostname, $protocol);
	}

	public static function controller_url()
	{
		$module = Phpr::$router->param('module');
		$controller = str_replace($module.'_', '',  Phpr::$router->controller);

		return self::url($module.'/'.$controller);
	}

	public static function button($caption, $attributes = array(), $ajax_handler = null, $ajax_params = null, $form_element = null)
	{
        $icon = null;
		$a_attrs = array('class' => 'btn');

		if (is_array($attributes))
		{
			foreach ($attributes as $key=>$value)
			{
				if ($key === 'class')
					$value = 'btn '.$value;

                if ($key === 'icon'){
                    $icon = '<i class="icon-'.$value.'"></i> ';
                    continue;
                }
				
				$a_attrs[$key] = $value;
			}

			$ajax_request = null;
			if ($ajax_handler !== null)
			{
				if ($form_element == null)
					$form_element = '$(this).getForm()';
				else
					$form_element = "$('".$form_element."')";

				$update_flash = "update: $(this).getForm().find('div.form-flash:first')";
				if ($ajax_params !== null)
				{
					if (strpos($ajax_params, 'update') === false)
						$ajax_params .= ', '.$update_flash;
				} else
					$ajax_params = $update_flash;

				$ajax_params = $ajax_params !== null ? '{'.$ajax_params.'}' : '{}';
				$ajax_request = $form_element.".phpr().post('".$ajax_handler."', ".$ajax_params.").send();";

				if (array_key_exists('onclick', $a_attrs))
					$a_attrs['onclick'] = $ajax_request.$a_attrs['onclick'];
				else
					$a_attrs['onclick'] = $ajax_request.' return false;';
			}

			$attr_list = Phpr_Html::format_attributes($a_attrs, array('href' => 'javascript:;'));
		} else {
			$attr_list = Phpr_Html::format_attributes($a_attrs, array('href' => $attributes));
		}

		return '<a '.$attr_list.'>'.$icon.$caption.'</a>';
	}

	/**
	 * Outputs a control panel admin button
	 */
	public static function cp_button($caption, $button_icon, $attributes = array(), $ajax_handler=null, $ajax_params = null, $form_element = null)
	{
		$a_attrs = array();

		if (is_array($attributes))
		{
			foreach ($attributes as $key=>$value)
			{
				 if ($key === 'class')
				 	$value = 'cp-button '.$value;

				$a_attrs[$key] = $value;
			}

			if (!array_key_exists('class', $a_attrs))
				$a_attrs['class'] = 'cp-button';

			$ajax_request = null;
			
			if ($ajax_handler !== null) {
			
				if ($form_element == null)
					$form_element = '$(this)';
				else
					$form_element = "$('#".$form_element."')";

				$update_flash = "update: $(this).getForm().find('div.form-flash:first')";
				if ($ajax_params !== null) {

					if (strpos($ajax_params, 'update') === false)
						$ajax_params .= ', '.$update_flash;

				} else {
					$ajax_params = $update_flash;
				}

				$ajax_params = ($ajax_params !== null) ? '{ '.$ajax_params.' }' : '{}';
				$ajax_request = $form_element.".phpr().post('".$ajax_handler."', ".$ajax_params.").send();";

				if (array_key_exists('onclick', $a_attrs))
					$a_attrs['onclick'] = $ajax_request . $a_attrs['onclick'];
				else
					$a_attrs['onclick'] = $ajax_request . ' return false;';
			}

			$attr_list = Phpr_Html::format_attributes($a_attrs, array('href' => 'javascript:;'));
		} else
			$attr_list = Phpr_Html::format_attributes($a_attrs, array('href' => $attributes, 'class' => 'cp-button'));

		return '<a '.$attr_list.'><i class="icon-'.$button_icon.'"></i> '.$caption.'</a>';
	}

	public static function ajax_button($caption, $ajax_handler, $attributes = array(), $ajax_params = null)
	{
		return self::button($caption, $attributes, $ajax_handler, $ajax_params, null);
	}

	public static function flash()
	{
		$result = null;

		foreach (Phpr::$session->flash as $type=>$message)
		{
			if ($type == 'system')
				continue;

			$result .= '<div class="alert alert-'.$type.'">'.$message.'</div>';
		}

		Phpr::$session->flash->now();

		return $result;
	}

	public static function flash_message($message, $type = 'success')
	{
		return '<div class="alert alert-'.$type.'">'.h($message).'</div>';
	}

	public static function click_link($url)
	{
		$handler = "window.location.href = '".$url."'";
		return 'onclick="'.$handler.'"';
	}

	public static function alt_click_link($url, $alt_url)
	{
		return "if (new Event(event).alt) window.location.href = '".$alt_url."'; else window.location.href = '".$url."'; return false";
	}
}

