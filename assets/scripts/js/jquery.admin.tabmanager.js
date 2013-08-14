//
// Tab managers
//

window.TabManagers = [];

;(function ($, window, document, undefined) {

	$.widget("admin.tabmanager", {
		version: '1.0.0',
		options: { 
			pages: null,
			trackTab: true
		},

		tabs: [],
		pages: [],
		current_page: null,

		_init: function () { var self = this;

			this.pages = $(this.options.pages).children();
			this.tabs = this.element.children();
			this.tabs.on('click', function(event) {
				self.onTabClick.apply(self, [event, this]);
			});
			
			window.TabManagers.push(this.element);
			$(window).trigger('onTabManagerAdded', this);

			var tabClicked = false;
			if (document.location.hash && this.options.trackTab) {
				var hashValue = document.location.hash;

				this.pages.each(function(){
					if ($(this).attr('href') == hashValue) {
						$(this).trigger('click');
						tabClicked = true;
					}

				}, this);
			}
			
			if (this.tabs.length && !tabClicked)
				this.tabs.first().trigger('click');

		},

		tabClick: function(tabIndex) {

			this.tabs.removeClass('active');
			this.tabs.eq(tabIndex).addClass('active');
			
			this.pages.addClass('hidden').removeClass('active');
			this.pages.eq(tabIndex).removeClass('hidden').addClass('active');
		},
	
		onTabClick: function(event, tab) {

			if (event && !this.options.trackTab)
				event.preventDefault();

			var tabIndex = $.inArray(tab, this.tabs);
			if (tabIndex == -1)
				return;


			this.tabClick(tabIndex);
			this.element.trigger('onTabClick', [this.tabs.eq(tabIndex), this.pages.eq(tabIndex)]);

			this.pages.eq(tabIndex).trigger('onTabClick');
			this.tabs.eq(tabIndex).trigger('onTabClick');
			this.current_page = this.pages[tabIndex];

			return false;
		}, 
				
		findElement: function(elementId) {
			for (var i = 0; i < this.pages.length; i++) {
				var el = this.pages.eq(i).find('#'+elementId);
				if (el.length > 0) {
					this.onTabClick(null, this.tabs.eq(i));
					return true;
				}
			}
			return false;
		},

		destroy: function() {
			$.Widget.prototype.destroy.call(this);
		}

	});

})( jQuery, window, document );


jQuery.fn.extend({
	getTab: function(){
		var tab = jQuery(this).parents('.tab-pane:first');
		if (tab.length > 0)
			return tab;
		else
			return false;
	}
});
