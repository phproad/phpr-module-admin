
/**
 * Scrollable tabs widget
 */

;(function ($, window, document, undefined) {

	$.widget("admin.scrollableTabs", $.admin.scrollable, {

		_init: function () {
			this.attach();
		},

		getContentSize: function() {
			var width = 1; // Offset
			this.scroll_content.children().each(function(){
				width += $(this).outerWidth();
			});
			return width;
		}

	});

})( jQuery, window, document );

function init_scrollable_tabs() {
	jQuery('.scroll-tabs').scrollableTabs();
}

jQuery(document).ready(init_scrollable_tabs);
