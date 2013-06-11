// Admin page object
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

	return page;
}(Admin_Page || {}, jQuery));

/*
 * Initialize tips
 */

jQuery(document).ready(function($) { 
	init_tooltips();
});

function init_tooltips() {
	(function($){
		if ($.fn.tooltip !== undefined) {
			$('a.has-tooltip, span.has-tooltip, li.has-tooltip').tooltip({
				delay: 500,
				html: true
			});
		}
	})(jQuery);
}

function update_tooltips() {
	init_tooltips();
}

function hide_tooltips() {
	(function($){
		$('a.has-tooltip, span.has-tooltip').each(function(index, e){
			$(this).tooltip('hide');
		});
	})(jQuery);
}

/*
 * Save trigger function
 */

// @depcreated: Use Admin_Page.triggerSave();
function phprTriggerSave() {
	Admin_Page.triggerSave();
}

/*
 * Commmon functions
 */

// @depcreated: Use Admin_Page.convertTextToCode();
function convert_text_to_url(text) {
	return Admin_Page.convertTextToCode(text);
}

function hide_hint(hint_name, close_element, hint_element) {
	if (hint_element === undefined)
		hint_element = $(close_element).selectParent('div.hint_container');

	if (hint_element)
		hint_element.hide();

	var form = hint_element.getForm();

	return $(form).sendPhpr('hint_hide', {
		extraFields: {
			'name': hint_name
		},
		loadIndicator: {show: false}
	});
}

jQuery.fn.extend({
	admin_hide: function(){ jQuery(this).addClass('hidden'); },
	admin_show: function(){ jQuery(this).removeClass('hidden'); }
});

/*
 * Protected JSON stringify
 */

jQuery.extend({
	stringify : function stringify(obj) {
		var t = typeof (obj);
		if (t != "object" || obj === null) {
			// Simple data type
			if (t == "string") obj = '"' + obj + '"';
			return String(obj);
		} else {
			// Recurse array or object
			var n, v, json = [], arr = (obj && obj.constructor == Array);

			for (n in obj) {
				v = obj[n];
				t = typeof(v);
				if (obj.hasOwnProperty(n)) {
					if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.stringify(v);
					json.push((arr ? "" : '"' + n + '":') + String(v));
				}
			}
			return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
	}
});