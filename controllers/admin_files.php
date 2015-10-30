<?
class Admin_Files extends Admin_Controller
{
    public function get($id){

        $this->suppress_view();
        try
        {
            $file = Db_File::create()->find($id);
            if ($file)
                $file->output();
        } catch (exception $ex)
        {
            echo $ex->getMessage();
        }
    }
}
