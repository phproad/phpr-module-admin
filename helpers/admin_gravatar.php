<?

class Admin_Gravatar{

        public static function get_img_url($user=null){
            if(!$user){
                $user = Phpr::$security->get_user();
            }

            if(!is_a($user,'Admin_User')){
                return Admin_Config::get_theme_id().'/assets/images/avatar-blank.png';
            }
            return 'https://www.gravatar.com/avatar/'.md5( strtolower( trim( $user->email ) ) );
        }
}
