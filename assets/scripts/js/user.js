var checkbox_states = { };

jQuery(document).ready(function($){

	// Permissions
	update_permissions();
	jQuery('#form_field_container_rightsAdmin_User input.checkbox').click(update_permissions);

});

function update_permissions() {

	var is_admin_checkbox = jQuery('#form_field_container_rightsAdmin_User input.checkbox');
	var is_admin = is_admin_checkbox.is(':checked');

	if (is_admin)
		reset_permissions();

	jQuery('#form_pagesAdmin_User li.permission_field input').each(function(){

		var el = jQuery(this);
		var id = el.attr('id');

		el.cb_update_enabled_state(!is_admin);

		if (id && el.hasClass('checkbox')) {
			if (is_admin)
				el.cb_check();
			else if (checkbox_states[id] !== undefined)
				el.cb_update_state(checkbox_states[id]);
		}

	});

}

function reset_permissions() {
	checkbox_states = { };

	jQuery('#form_pagesAdmin_User li.permission_field input').each(function() {

		var el = jQuery(this);
		var id = el.attr('id');

		if (id && el.hasClass('checkbox'))
			checkbox_states[id] = el.is(':checked');
	});
}
