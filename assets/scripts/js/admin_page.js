
var Admin_Page = (function(page, $){

	// Keep tabs on what elements have loaded
	page.phprFieldInitialized = {},
	page.phprFieldLoaded = {};

	page.triggerSave = function() {
		jQuery(window).trigger('phprformsave');
	}

	// Common form functionality:
	// auto populates a code field based on plain text/name/label field
	// Name: My Name
	// Code: my-name

	var _text_to_code_modified = {};
	page.bindTextToCode = function(text_id, code_id, options) {

		var defaults = {
			codePrefix: '',
			codeSuffix: '',
			newFlagElement: '#new_flag',
			forceNewRecord: false
		}

		options = jQuery.extend(true, defaults, options);
		var text_element = jQuery(text_id),
			code_element = jQuery(code_id),
			is_new_record = (jQuery(options.newFlagElement).length > 0 || options.forceNewRecord);

		if (text_element.length > 0 && is_new_record) {
			text_element.on('keyup', update_url_title);      
			text_element.on('change', update_url_title);
			text_element.on('paste', update_url_title);
		}
		
		if (is_new_record) {
			code_element.on('change', function(){ 
				_text_to_code_modified[code_id] = true;
			});
		}

		function update_url_title() {
			if (!_text_to_code_modified[code_id]) {
				var code_value = options.codePrefix + page.convertTextToCode(text_element.val()) + options.codeSuffix;
				code_element.val(code_value).trigger('modified');
			}
		}
	}

	page.convertTextToCode = function(text) {
		var url_separator_char = '-';
		var url_ampersand_replace = 'and';

		// Remove everything except alphanumeric, slashes, underscores, spaces, dots
		var value = text.replace(/&/g, url_ampersand_replace);
		value = value.replace(/[^\s\-\._a-z0-9]/gi, '');

		// Replace everything with dashes except alphanumeric and dots
		value = value.replace(/[^a-z0-9\.]/gi, url_separator_char);
		
		// Remove duplicate dashes
		var p = new RegExp(url_separator_char+'+', 'g');
		value = value.replace(p, url_separator_char);
		
		p = new RegExp(url_separator_char+'$', 'g');

		if (value.match(p))
			value = value.substr(0, value.length-1);

		return value.toLowerCase();
	}

	page.hideHint = function(hintName, closeElement, hintElement) {
		if (hintElement === undefined)
			hintElement = jQuery(closeElement).closest('div.hint-container');

		if (hintElement.length > 0)
			hintElement.hide();

		var form = hintElement.getForm();

		return $(form).phpr().post('hint_hide', {
			data: {
				'name': hintName
			},
			loadIndicator: { show: false }
		}).send();
	}

	page.formCollapseToggle = function(el) { 
		var el = $(el),
			container = el.closest('.form-collapse')
			icon = el.find('>i');

		if (container.hasClass('collapsed')) {
			el.attr('title', 'Hide');
		}
		else {
			el.attr('title', 'Show');
		}

		icon.toggleClass('icon-caret-down icon-caret-up');
		container.toggleClass('collapsed');
	}

	page.listCheckAll = function(el) {
		el = $(el);
		var checked = el.is(':checked');
		el.closest('table').find('tbody input.checkbox').cb_update_state(checked);
	}
	
	page.listCheckSingle = function(el) {
		el = $(el);
		var checked = el.is(':checked');
		if (!checked)
			el.closest('table').find('thead input.checkbox').cb_uncheck();
	}	

	return page;
}(Admin_Page || {}, jQuery));