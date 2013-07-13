//
// Scrollable base class
//

;(function ($, window, document, undefined) {

	$.widget("admin.scrollable", {
		version: '1.0.0',
		options: { 
			areaClass:           'scroll-area',    // The visible window
			contentClass:        'scroll-content ul.nav:first', // The visible content and overflow
			leftScrollClass:     'scroll-left',
			leftScrollSelector:  'a',
			rightScrollClass:    'scroll-right',
			rightScrollSelector: 'a'
		},

		scroll_area:          null,
		scroll_content:       null,
		scroll_content_size:  null,
		scroll_button_left:   null,
		scroll_button_right:  null,
		scroll_button_width:  null,
		scroll_interval_id:   0,    // Timer to regulate scrolling
		scroll_offset:        15,   // Speed of scroll
		sibling_elements:     null,

		_init: function () {
			this.attach();			
		},

		attach: function() {
			if (this.element.hasClass('scrollable-attached')) return;
			this.element.addClass('scrollable-attached');

			this.scroll_button_left = this.element.find('.'+this.options.leftScrollClass).removeClass('hidden');
			this.scroll_button_right = this.element.find('.'+this.options.rightScrollClass).removeClass('hidden');
			this.scroll_area = this.element.find('.'+this.options.areaClass);
			this.scroll_content = this.element.find('.'+this.options.contentClass);
			this.scroll_content_size = this.getContentSize();

			this.scroll_area.css('overflow', 'hidden');

			this.scroll_button_width = this.scroll_button_right.outerWidth();
			this.sibling_elements = this.scroll_area.siblings();


			this.scroll_button_left.find(this.options.leftScrollSelector).on('mouseenter', $.proxy(this._scroll_toolbar_left, this));
			this.scroll_button_left.find(this.options.leftScrollSelector).on('mouseleave', $.proxy(this._stop_scrolling, this));
			this.scroll_button_right.find(this.options.rightScrollSelector).on('mouseenter', $.proxy(this._scroll_toolbar_right, this));
			this.scroll_button_right.find(this.options.rightScrollSelector).on('mouseleave', $.proxy(this._stop_scrolling, this));
			this.resizeToolbar();
			$(window).on('resize', $.proxy(this.resizeToolbar, this));
		},

		getContentSize: function() {
			return this.scroll_content.outerWidth();
		},

		getSiblingsSize: function() {
			sibling_elements_width = 0;
			this.sibling_elements.each(function() { 
				sibling_elements_width = sibling_elements_width + $(this).outerWidth(); 
			});
			return sibling_elements_width;
		},

		getToolbarSize: function() {
			var toolbar_width,
				full_width = this.element.outerWidth();
			
			// Calculate available space for buttons
			var calculated_scroll_area = full_width - this.getSiblingsSize();

			toolbar_width = calculated_scroll_area;
			return toolbar_width;
		},

		resizeToolbar: function() {

			var toolbar_width = this.getToolbarSize();

			// Do we have more buttons that can fit?
			var use_scroller = this.scroll_content_size > toolbar_width;

			this.scroll_area.css('width', toolbar_width + 'px');
			this.scroll_content.css('width', this.scroll_content_size + 'px');

			if (this.scroll_content_size > toolbar_width) {
				this.element.addClass('scroll-enabled').removeClass('scroll-disabled');
				this.scroll_button_left.show().removeClass('hidden');
				this.scroll_button_right.show().removeClass('hidden');
			} else {
				this.element.removeClass('scroll-enabled').addClass('scroll-disabled');
				this.scroll_button_left.hide().addClass('hidden');
				this.scroll_button_right.hide().addClass('hidden');
				this.scroll_area.scrollLeft(0);
			}

			this.updateScrollButtons();
		},

		updateScrollButtons: function() {
			if (this._scroll_button_right_visible())
				this.scroll_button_right.removeClass('disabled')
			else
				this.scroll_button_right.addClass('disabled');

			if (this._scroll_button_left_visible())
				this.scroll_button_left.removeClass('disabled')
			else
				this.scroll_button_left.addClass('disabled');
		},

		setScroll: function(scroll) {
			this.scroll_content.scrollLeft(scroll);
			this.updateScrollButtons();
			this.setOffset(this.scroll_area.scrollLeft());
		},

		setOffset: function(num) {
			return;
		},

		scroll: function(offset) {
			this.scroll_area.scrollLeft(this.scroll_area.scrollLeft() + offset);
			this.updateScrollButtons();
			this.setOffset(this.scroll_area.scrollLeft());
		},

		_scroll_button_right_visible: function() {
			var toolbar_width = this.scroll_content.width();
			var scrollarea_width = this.scroll_area.width();
			var max_scroll_offset =  toolbar_width - scrollarea_width;

			return (toolbar_width > scrollarea_width && this.scroll_area.scrollLeft() < max_scroll_offset);
		},

		_scroll_button_left_visible: function() {
			return (this.scroll_area.scrollLeft() > 0);
		},

		_scroll_toolbar_right: function() {
			this._start_scrolling(this.scroll_offset);
		},

		_scroll_toolbar_left: function() {
			this._start_scrolling(this.scroll_offset * -1);
		},

		_start_scrolling: function(offset) { var self = this;
			this.element.trigger('scrollstart.scrollable');
			this.scroll_interval_id = setInterval(function(){ self.scroll(offset); }, 30);
		},

		_stop_scrolling: function() {
			this.element.trigger('scrollstop.scrollable');
			if (this.scroll_interval_id) {
				clearInterval(this.scroll_interval_id);
				this.scroll_interval_id = 0;
			}
		},

		destroy: function() {
			this.element.removeClass('scroll-enabled').addClass('scroll-disabled');
			this.scroll_area.css('overflow', 'visible');
			this.scroll_button_left.find(this.options.leftScrollSelector).off('mouseenter', $.proxy(this._scroll_toolbar_left, this));
			this.scroll_button_left.find(this.options.leftScrollSelector).off('mouseleave', $.proxy(this._stop_scrolling, this));
			this.scroll_button_right.find(this.options.rightScrollSelector).off('mouseenter', $.proxy(this._scroll_toolbar_right, this));
			this.scroll_button_right.find(this.options.rightScrollSelector).off('mouseleave', $.proxy(this._stop_scrolling, this));
			$(window).off('resize', this.resizeToolbar);			
			$.Widget.prototype.destroy.call(this);
		}

	});

})( jQuery, window, document );