<?php

function url($value = '/', $add_hostname = false, $protocol = null)
{
    return Admin_Html::url($value, $add_hostname, $protocol);
}

function flash()
{
    return Admin_Html::flash();
}

function admin_button($caption, $attributes = array(), $ajax_handler=null, $ajax_params = null, $form_element = null)
{
    return Admin_Html::button($caption, $attributes, $ajax_handler, $ajax_params, $form_element);
}

function cp_button($caption, $button_class, $attributes = array(), $ajax_handler=null, $ajax_params = null, $form_element = null)
{
	return Admin_Html::cp_button($caption, $button_class, $attributes, $ajax_handler, $ajax_params, $form_element);
}

function admin_ajax_button($caption, $ajax_handler, $attributes = array(), $ajax_params = null)
{
    return Admin_Html::ajax_button($caption, $ajax_handler, $attributes, $ajax_params);
}

function click_link($url)
{
    return Admin_Html::click_link($url);
}

function alt_click_link($url, $alt_url)
{
    return Admin_Html::alt_click_link($url, $alt_url);
}
