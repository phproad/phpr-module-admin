/*
 * Search control
 */

;(function ($, window, document, undefined) {

	$.widget("admin.searchControl", {
		version: '1.0.0',
		options: {
			defaultText: 'search'
		},

		inputElement: null,
		cancelElement: null,

		_init: function () {			
			this.inputElement = this.element.find('input:first');
			this.cancelElement = this.element.find('.search-cancel:first');

			this.inputElement.on('click', $.proxy(this.onFieldClick, this));
			this.cancelElement.on('click', $.proxy(this.onCancelClick, this));
			this.inputElement.on('keydown', $.proxy(this.onFieldKeyDown, this));
		},

		onFieldClick: function() {
			if (this.element.hasClass('inactive')) {
				this.element.removeClass('inactive');
				this.inputElement.val('');
			}
		},
		
		onFieldKeyDown: function(event) {
			if (event.which == 13) { // ENTER
				if (!this.inputElement.val().trim().length)
					this.forceCancel(event);
				else
					this.element.trigger('send');
			}
			else if (event.which == 27) { // ESC
				this.forceCancel(event);
			} 
		},
		
		forceCancel: function(event) {
			this.onCancelClick();
			this.inputElement.val(this.options.defaultText);
			this.inputElement.blur();
			event.preventDefault();
		},
		
		onCancelClick: function() {
			if (this.element.hasClass('inactive'))
				return;
			
			this.element.addClass('inactive');
			this.inputElement.val(this.options.defaultText);
			this.element.trigger('cancel');
		}

	});

})( jQuery, window, document );
