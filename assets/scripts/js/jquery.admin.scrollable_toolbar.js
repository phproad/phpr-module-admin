//
// Scrollable toolbar widget
//

window.ScrollToolbars = [];
window.ScrollToolbarOffsets = [];

;(function ($, window, document, undefined) {

	$.widget("admin.scrollableToolbar", $.admin.scrollable, {

		offset_index: 0, // Used when the scrollbars need to be refreshed
		
		_init: function () {
			this.attach();
			this.initOffset();
			this.fixDropdowns();
			window.ScrollToolbars.push(this.element);
		},

		initOffset: function() {
			this.offset_index = window.ScrollToolbars.length-1;
			var initial_offset = window.ScrollToolbarOffsets[this.offset_index] 
				? window.ScrollToolbarOffsets[this.offset_index] 
				: 0;

			this.setScroll(initial_offset);				
		},
		
		getToolbarSize: function() {
			var toolbar_width,
				full_width = this.element.outerWidth();
			
			// Calculate available space for buttons
			var calculated_scroll_area = full_width - this.getSiblingsSize();

			toolbar_width = calculated_scroll_area;
			return toolbar_width;
		},

		setOffset: function(num) {
			window.ScrollToolbarOffsets[this.offset_index] = num;
		},

		getContentSize: function() {
			var width = (this.scroll_button_left.outerWidth()); // Offset

			this.scroll_content.children().each(function(){
				width += $(this).outerWidth();
			});

			return width;
		},

		getSiblingsSize: function() {
			sibling_elements_width = 0;

			// Prevent a direct parental form from being treated as a sibling
			var form_element = this.scroll_content.parent('.navbar-form');
			
			var sibling_elements = this.element.find('.nav, .navbar-form').not(this.scroll_content).not(form_element);
			sibling_elements.each(function() { 
				sibling_elements_width = sibling_elements_width + $(this).outerWidth(); 
			});
			return sibling_elements_width;
		},

		// Allow dropdown usage
		fixDropdowns: function() { var self = this;
			
			this.scroll_area.find('li.dropdown').live({
				mouseenter: function(event) { 
					event.stopPropagation();

					var _window = $(window),
						_self = $(this),
						_menu = _self.find(".dropdown-menu"),
						_position = _self.offset(),
						_top = _position.top + 30;

					_menu.css({
						top: _top - _window.scrollTop(),
						left: _position.left
					});

					self.element.bind('scrollstart.scrollable', function() {
						_self.trigger('click');
						self.element.unbind('scrollstart.scrollable');
					});

					_window.bind('scroll', function() {
						_self.trigger('click');
						_window.unbind('scroll');
					});
				},
				mouseleave: function(event) {	
					event.stopPropagation();
				}
			});
		}

	});

})( jQuery, window, document );

function init_scrollable_toolbars() {
	jQuery('.scroll-toolbar').scrollableToolbar();
}

function destroy_scrollable_toolbars() {
	jQuery.each(window.ScrollToolbars, function(key, toolbar){
		try { 
			toolbar.scrollableToolbar('destroy'); 
		} 
		catch (err) { }
	});
	window.ScrollToolbars = [];
}

function update_scrollable_toolbars() {
	destroy_scrollable_toolbars();	
	init_scrollable_toolbars();
}

jQuery(document).ready(init_scrollable_toolbars);
