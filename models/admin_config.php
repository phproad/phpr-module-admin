<?php

class Admin_Config extends Core_Settings_Base
{
	public $record_code = 'admin_config';

	const default_theme = 'default';

	public static function create()
	{
		$config = new self();
		return $config->load();
	}   
	
	protected function build_form()
	{
		// Add logo to our model
		$this->add_relation('has_many', 'logo', array('class_name'=>'Db_File', 'foreign_key'=>'master_object_id', 'conditions'=>"master_object_class='Admin_Config' and field='logo'", 'order'=>'id', 'delete'=>true));
		$this->define_multi_relation_column('logo', 'logo', 'Admin Logo', '@name')->invisible();
		$this->add_form_field('logo', 'left')->display_as(frm_file_attachments)
			->display_files_as('single_image')
			->add_document_label('Upload admin logo')            
			->no_attachments_label('Admin Logo is not uploaded')
			->image_thumb_size(170)
			->no_label()            
			->tab('General')
			->comment('Maximum image dimensions 85px height by 450px width');


		$this->add_field('theme_id', 'Admin Theme', 'full', db_varchar)->tab('General')->no_form();

	}

	public function before_save($session_key = null)
	{
		if (Phpr::$config->get('DEMO_MODE'))
			throw new Phpr_ApplicationException('Sorry you cannot modify the admin settings while site is in demonstration mode.');
	}

	public static function get_theme_id()
	{
		$config = self::create();
		return ($config->theme_id) ? $config->theme_id : self::default_theme;
	}

	protected function init_config_data()
	{
		$this->theme_id = self::default_theme;
	}

	public function is_configured()
	{
		$config = self::create();
		if (!$config)
			return false;

		return $this->logo->count ? true : false;
	}

	public static function get_logo()
	{
		$settings = self::create();
		if ($settings->logo->count > 0)
			return root_url($settings->logo->first()->get_path());
		else
			return null;
	}
}