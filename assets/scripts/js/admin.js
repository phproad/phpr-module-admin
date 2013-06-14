//
// Light loading indicator
//

var LightLoadingIndicator = function(options) { 

	var o = {},
		_options = options || {},
		_active_request_num = 0,
		_loading_indicator_element = null;

	o.show = function(message) {
		_active_request_num++;
		_create_loading_indicator(message);
	}

	o.hide = function() {
		_active_request_num--;
		if (_active_request_num == 0)
			_remove_loading_indicator();
	}

	var _create_loading_indicator = function(message) {
		if (_loading_indicator_element)
			return;

		var _body = jQuery('body');
		_loading_indicator_element = jQuery('<p />')
			.addClass('light-loading-indicator')
			.html('<span>' + message + '</span>')
			.appendTo(_body);
	}

	var _remove_loading_indicator = function() {
		if (_loading_indicator_element)
			_loading_indicator_element.remove();

		_loading_indicator_element = null;
	}

	return o;
};

//
// Initialize tips
//

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

//
// Save trigger function
//

function phprTriggerSave() {
	Admin_Page.triggerSave();
}

//
// Commmon functions
//

// @depcreated: Use Admin_Page.convertTextToCode();
function convert_text_to_url(text) {
	return Admin_Page.convertTextToCode(text);
}

jQuery.fn.extend({
	admin_hide: function(){ jQuery(this).addClass('hidden'); },
	admin_show: function(){ jQuery(this).removeClass('hidden'); }
});

function popupAjaxError(requestObj) {
	if (requestObj.errorMessage)
		alert(requestObj.errorMessage);
	else
		alert('Unknown error');
}

//
// Protected JSON stringify
//

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