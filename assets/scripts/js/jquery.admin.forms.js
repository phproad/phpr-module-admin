/*
 * Form styling
 */

function admin_style_forms() {
	var $ = jQuery;
	$('select').each(function(){
		if (!$(this).hasClass('no-styling')) {
			var options = {},
				self = this,
				select = $(this);

			if (this.options.length > 0 && this.options[0].value == "") {
				var placeholder = $(this.options[0]).text();
				placeholder = placeholder.replace('<', '- ').replace('>', ' -').replace("'", "\'");
				select.attr('data-placeholder', placeholder);
				$(this.options[0]).text('');
				options.allow_single_deselect = true;
			}

			// select.off('.chosen-handler');
			// select.on('change.chosen-handler', function(){
			// 	$(this).trigger('change');
			// });

			select.chosen(options);
		}
	});

	$('input[type=checkbox].checkbox').each(function(){
		$(this).customCheckbox();
	});

	$('input[type=radio].radio').each(function(){
		$(this).customRadio();
	});	
};

jQuery(document).ready(function($) { 
	admin_style_forms();
	$(window).bind('onAfterAjaxUpdateGlobal', admin_style_forms);
});

jQuery.fn.extend({
	cb_check: function() {
		this.cb_update_state(true);
	},

	cb_uncheck: function() {
		this.cb_update_state(false);
	},

	cb_update_state: function(state) {
		jQuery(this).attr('checked', state);
		jQuery(this).trigger('change_status');
		jQuery(this).trigger('change');
	},

	cb_enable: function() {
		this.trigger('enable');
	},

	cb_disable: function() {
		this.trigger('disable');
	},

	cb_update_enabled_state: function(state) {
		if (state)
			this.cb_enable();
		else
			this.cb_disable();
	},

	select_update: function() {
		jQuery(this).trigger("list:updated");
	},

	select_focus: function() {
		var el = jQuery(this).parent().find('a.chzn-single');
		if (el.length > 0) 
			el[0].focus();
	}
});


/**
 * Custom checkbox widget
 */

;(function ($, window, document, undefined) {

	$.widget("admin.customCheckbox", {
		version: '1.0.0',
		options: { },

		replacement: null,		

		_init: function () { var self = this;

			if (!this.element.hasClass('checkbox-styled')) {

				this.element.addClass('checkbox-styled');

				self.replacement = $('<div />').addClass('custom-checkbox').attr('tabindex', 0);

				this.element.hide();
				if (this.element.is(':checked'))
					self.replacement.addClass('checked');

				if (this.element.is(':disabled'))
					self.replacement.addClass('disabled');

				self.replacement.bind('keydown', function(event){
					if (!self.replacement.hasClass('disabled')) {					
						var code = event.keyCode ? event.keyCode : event.which;
						if (code  == 32 || code  == 13) {
							if (!event.ctrlKey) {
								self.handle_click();
								event.stopPropagation();
								return false;
							}
						}
					}
				});

				this.element.bind('click', function(event, loop){
					if (loop)
						event.preventDefault();
				});

				this.element.bind('change', function(event, loop){
					if (self.replacement.hasClass('disabled'))
						return;

					self.update_replacement_status();
				});

				this.element.bind('change_status', function(){
					self.update_replacement_status();
				});

				this.element.bind('enable', function(){
					self.replacement.removeClass('disabled');
				});

				this.element.bind('disable', function(){
					self.replacement.addClass('disabled');
				});

				this.replacement.bind('click', function(event) {
					if (!self.replacement.hasClass('disabled')) {
						self.handle_click();

						event.stopPropagation();
						return false;
					}
				});

				this.replacement.bind('dblclick', function(event){
					event.stopPropagation();
					return false;
				});

				this.element.before(self.replacement);
			}
		},

		handle_click: function() {
			this.element.attr('checked', !this.element.is(':checked'));

			this.element.trigger('change', true);
			this.element.trigger('click', true);
		},

		update_replacement_status: function() {
			if (this.element.is(':checked'))
				this.replacement.addClass('checked');
			else
				this.replacement.removeClass('checked');
		},

		destroy: function() {
			$.Widget.prototype.destroy.call(this);
		}

	});

})( jQuery, window, document );		



/**
 * Custom radio widget
 */

;(function ($, window, document, undefined) {

	$.widget("admin.customRadio", {
		version: '1.0.0',
		options: { },

		replacement: null,		

		_init: function () { var self = this;

			if (!this.element.hasClass('radio-styled')) {

				this.element.addClass('radio-styled');

				self.replacement = $('<div />').addClass('custom-radio').attr('tabindex', 0);

				this.element.hide();
				if (this.element.is(':checked'))
					self.replacement.addClass('checked');

				if (this.element.is(':disabled'))
					self.replacement.addClass('disabled');

				self.replacement.bind('keydown', function(event){
					if (!self.replacement.hasClass('disabled')) {					
						var code = event.keyCode ? event.keyCode : event.which;
						if (code  == 32 || code  == 13) {
							if (!event.ctrlKey) {
								self.handle_click();
								event.stopPropagation();
								return false;
							}
						}
					}
				});

				this.element.bind('click', function(event, loop){
					if (loop)
						event.preventDefault();
				});

				this.element.bind('change', function(event, loop){
					if (self.replacement.hasClass('disabled'))
						return;

					self.update_replacement_status();
				});

				this.element.bind('change_status', function(){
					self.update_replacement_status();
				});

				this.element.bind('enable', function(){
					self.replacement.removeClass('disabled');
				});

				this.element.bind('disable', function(){
					self.replacement.addClass('disabled');
				});

				this.replacement.bind('click', function(event) {
					if (!self.replacement.hasClass('disabled')) {
						self.handle_click();

						event.stopPropagation();
						return false;
					}
				});

				this.replacement.bind('dblclick', function(event){
					event.stopPropagation();
					return false;
				});

				this.element.before(self.replacement);
			}
		},

		handle_click: function() {
			this.element.attr('checked', !this.element.is(':checked'));
			this.element.trigger('change', true);
			this.element.trigger('click', true);
		},

		update_replacement_status: function() {
			this.replacement.addClass('checked')
				.closest('.option').siblings()
				.children('.custom-radio').removeClass('checked');
		},

		destroy: function() {
			$.Widget.prototype.destroy.call(this);
		}

	});

})( jQuery, window, document );		


