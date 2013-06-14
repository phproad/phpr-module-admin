<?php

class Admin_Auth extends Admin_Controller
{
	protected $public_actions = array('index', 'login', 'redirect', 'logout', 'restore', 'restore_complete');

	public function __construct()
	{
		parent::__construct(true);
		$this->layout = 'login';
	}

	public function index()
	{
		Phpr::$response->redirect(url('admin/auth/login'));
	}

	public function login($path)
	{
		$this->app_page_title = 'Login';
		$this->view_data['redirect'] = $path;

		$agent = Phpr::$request->get_user_agent();
		$is_ie = !preg_match('/opera|webtv/i', $agent) && preg_match('/msie\s(\d)/i', $agent);
		$this->view_data['is_ie'] = $is_ie;
		$this->view_data['app_name'] = Phpr::$config->get('APP_NAME');

		if (post('postback')) {
			try {
				$this->do_login($path);
			}
			catch (Exception $ex) {
				Phpr::$session->flash['error'] = $ex->getMessage();
			}
		}
	}

	private function do_login($path = null)
	{
		Db_Update_Manager::update();
		Phpr::$session->reset();

		$redirect = post('redirect', $path);

		Phpr::$security->login($this->validation, url('/admin/auth/redirect/' . $redirect));
	}

	public function logout()
	{
		Phpr::$security->logout();
		Phpr::$response->redirect(url('admin/auth'));
	}

	public function redirect($path)
	{
		if (strlen($path))
			Phpr::$response->redirect(root_url(str_replace("|", "/", urldecode($path))));

		Phpr::$response->redirect(url('/'));
	}

	public function restore()
	{
		$this->app_page_title = 'Password restore';
	}

	protected function restore_on_send()
	{
		try
		{
			$validation = new Phpr_Validation();
			$validation->add('login');
			$login = trim(post('login'));

			if (!strlen($login))
				$validation->set_error('Please specify your user name', 'login', true);

			$obj = Admin_User::create()->find_user_by_login($login);
			if (!$obj)
				$validation->set_error('User with specified name is not found', 'login', true);

			$hash = $obj->create_password_reset_hash();

			if (!Notify::trigger('admin:password_reset', array('user'=>$obj, 'hash'=>$hash)))
				throw new Phpr_ApplicationException('Cannot send email message. Please see the error log for details.');

			$this->display_partial('restore_success');
		}
		catch (Exception $ex)
		{
			Phpr::$response->ajax_report_exception($ex, true, true);
		}
	}

	public function restore_complete($hash)
	{
		$this->app_page_title = 'Password restore';

		try
		{
			$user = Admin_User::create()->find_by_password_reset_hash($hash);
			if (!$user)
				throw new Phpr_ApplicationException('Sorry but the Password Restore link you provided is not valid');
		}
		catch (Exception $ex)
		{
			$this->view_data['error'] = $ex->getMessage();
		}
	}

	protected function restore_complete_onRestore($hash)
	{
		try
		{
			$user = Admin_User::create()->find_by_password_reset_hash($hash);
			if (!$user)
				throw new Phpr_ApplicationException('Sorry but the Password Restore link you provided is not valid');
			
			$user->init_columns();
			$user->init_form_fields();
			$user->password_reset_mode = true;
			
			$user->save(array('password' => post('password'), 'password_confirm' => post('password_confirm')));
			$this->display_partial('restore_complete_success');
		}
		catch (Exception $ex)
		{
			Phpr::$response->ajax_report_exception($ex, true, true);
		}
	}
}