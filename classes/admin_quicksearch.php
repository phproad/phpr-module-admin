<?php

class Admin_Quicksearch 
{
	protected $feed;
	protected $items;
	protected $query;
	protected $module_id;

	public static function create($query)
	{
		$obj = new self();
		$obj->feed = Db_Data_Feed::create();
		$obj->items = array();
		$obj->query = $query;
		$obj->load_items();		
		return $obj;
	}

	public static function process_search($params) 
	{
		$query = post('term', 'home');
		$obj = self::create($query);
		echo $obj->get_results();
	}

	public function get_results() 
	{
		header('Content-type: application/json');

		$results = array();

		try {
			$this->feed->limit(10);

			if (count($this->items)) {

				$records = $this->feed->find_all();
				foreach ($records as $record) {

					$tag = $record->context_name;
					$info = $this->items[$tag];
					$field = $info['label_field'];
					$link = str_replace('%s', $record->id, $info['link']);

					$results[] = array(
						'icon' => $info['icon'],
						'label' => $record->{$field},
						'item_name' => $info['item_name'],
						'link' => $link
					);
				}

			}
			
		} 
		catch (Exception $ex) 
		{
			$results[] = array(
				'icon' => 'warning',
				'label' => $ex->getMessage(),
				'item_name' => 'Feed error',
				'link' => 'javascript:;'
			);
		}
		
		echo json_encode($results);
	}

	protected function load_items()
	{
		$modules = Core_Module_Manager::get_modules();

		foreach ($modules as $id => $module)
		{
			$this->module_id = strtolower($id);

			if (method_exists($module, 'build_quicksearch_feed'))
				$module->build_quicksearch_feed($this, $this->query);
		}
	}

	public function add($tag, $model, $params)
	{
		$tag = $this->module_id . '_' . $tag;
		$search_fields = $params['search_fields'];
		$search_sql = Db_Helper::format_search_query($this->query, $search_fields);

		if ($search_sql == '1=1')
			return;
		
		$model->where($search_sql);

		$this->feed->add($model, $tag);
		$this->items[$tag] = $params;
		return $this;
	}
}