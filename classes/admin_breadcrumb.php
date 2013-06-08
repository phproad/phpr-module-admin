<?php

class Admin_Breadcrumb 
{
	
	protected static $trail = array();
	private static $instance = null;

	public static function add($name, $url=null)
	{
				if (self::$instance === null) 
						self::$instance = new self;
		
		self::$trail[] = array('name'=>$name, 'url'=>$url);
				return self::$instance;
	}

	public static function exists()
	{
		return count(self::$trail);
	}

	public static function display($params = array())
	{

		$default_options = array(
			'item_suffix' => '',
			'list_prefix' => '',
			'container_class' => 'breadcrumb',
			'active_class' => 'active'
		);

		$options = array_merge($default_options, $params);

		$str = "";
		if (count(self::$trail))
		{
			$str .= '<ul class="'.$options['container_class'].'">'.PHP_EOL;
			$str .= $options['list_prefix'];
			foreach (self::$trail as $crumb)
			{
				$url = $crumb['url'];
				$current = ($url) ? '' : $options['active_class'];
				$str .= '<li class="'.$current.'">'.PHP_EOL;
				$str .= ($url) ? '<a href="'.url($url).'">' : '';
				$str .= $crumb['name'];
				$str .= ($url) ? '</a>' : '';
				$str .= $options['item_suffix'];
				$str .= '</li>'.PHP_EOL;
			}
			$str .= "</ul>".PHP_EOL;
		}
		return $str;
	}

}