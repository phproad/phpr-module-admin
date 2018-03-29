<?

	class Admin_HideDisabledAccountsSwitcher extends Db_Data_Filter_Switcher
	{
		public $model_class_name = 'Admin_User';
		
		public function apply_to_model($model, $enabled, $context = null){
			if ($enabled){
				$model->where('status != -1', '-1');
            }
			return $model;
		}
	}

?>