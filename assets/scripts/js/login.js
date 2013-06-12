jQuery(document).ready(function($) {

    if ($('#login').length > 0)
        $('#login').focus(); 

    $(".fieldContainer input").focus(function(){ $(this).addClass('active'); });
    $(".fieldContainer input").blur(function(){ $(this).removeClass('active'); });

});