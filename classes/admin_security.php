<?php

/**
 * Admin Security class
 */

class Admin_Security extends Phpr_Security
{
	public $cookie_name = "PHPRA";

	public function __construct()
	{
		$this->user_class_name = "Admin_User";
	}

	public function login($validation = null, $redirect = null, $login = null, $password = null)
	{
		if (parent::login($validation, null)) {
			Phpr::$events->fire_event('admin:on_login');
			$this->user->update_last_login();
			Phpr::$response->redirect($redirect);
		}

		return false;
	}

	public function base_authorization()
	{
		if (parent::get_user() == null) {
			$current_uri = Phpr::$request->get_current_uri();

			if ($current_uri != url('admin/auth/login'))
				$uri = urlencode(str_replace('/', '|', strtolower($current_uri)));
			else
				$uri = null;

			Phpr::$response->redirect(url('/admin/auth/login/'.$uri));

		}

		$user = parent::get_user();
		if ($user->status == Admin_User::disabled)
			$this->force_logout();

		if (!post('phpr_no_cookie_update'))
			$this->update_cookie($user->id);
	}

	public function force_logout()
	{
		Phpr::$response->redirect(url('admin/auth'));
	}

	protected function check_user($user)
	{
		if ($user && $user->status == Admin_User::disabled)
			throw new Phpr_ApplicationException('Sorry, your user account has been disabled.');
	}

	protected function after_login($user)
	{
		Db_Deferred_Binding::clean_up(3);
		Db_Record_Lock::clean_up();

		$user = $this->get_user();
		if ($user) {
			$user->clear_password_reset_hash();
		}
	}
}
