var Admin_Page = (function(page, $){

	// Elements
	var _window = null,
		_header = null,
		_content = null,
		_mainnav = null,
		_subnav = null,
		_sidenav = null,
		_footer = null,
		_fixed_toolbar = null;

	var _is_loaded = false,
		_top_offset = 0,
		_top_offset_with_content = 0,
		_left_offset = 0,
		_right_offset = 0,
		_window_width = 0,
		_window_height = 0;

	var _mainnav_offset_cache = 0,
		_subnav_offset_cache = 0;

	// Poll for dom changes
	var _attributes = {
			body_height: 0,
			body_width: 0,
			poll_interval: 500
		},
		_poll_object = null;

 
	var _breakpoint_menu_visible = false;
	
	// Public
	page.breakpointSize = 979;

	// Constructor
	page.constructor = $(function() {
		_window = $(window);
		_header = $('#site-header');
		_content = $('#site-content');
		_mainnav = $('#site-nav');
		_subnav = $('#site-subnav');
		_sidenav = $('#site-sidenav');
		_footer = $('#site-footer');
		_fixed_toolbar = $('#fixed-toolbar');
		
		page.asSetCanvas();
		page.asSetScrollbars();
		page.asUpdateBreakpoint();

		_window.on('resize', function(){
			page.asSetCanvas();
			page.asUpdateScrollbars();
			page.asUpdateBreakpoint();
		}); 

		page.asInitScrollbars();

		// Polling
		_poll_object = setInterval(_is_dom_resized, _attributes.poll_interval);

		// Chrome fix...zzz
		if ($.browser.webkit)
			_webkit_fix();
	});

	// Canvas
	// 

	page.asCalculateSize = function() {
		_top_offset = 0;
		if (_header.is(':visible'))
			  _top_offset += _header.outerHeight();

		if (_footer.is(':visible'))
			  _top_offset += _footer.outerHeight();

		_top_offset_with_content = _top_offset;

		if (_fixed_toolbar.length > 0)
			_top_offset_with_content += _fixed_toolbar.outerHeight();

		_left_offset = 0;
		_right_offset = 0;

		if (_mainnav.is(':visible'))
			_left_offset += _mainnav.outerWidth();

		if (_subnav.is(':visible') || page.checkBreakpoint())
			_left_offset += _subnav.outerWidth();
		
		if (_sidenav.is(':visible'))
			_right_offset += _sidenav.outerWidth();

		_window_width = _window.width();
		_window_height = _window.height();
	}

	page.asSetCanvas = function() {
		page.asCalculateSize();

		// Content
		if (!page.checkBreakpoint()) {
			_content.css({
				'padding-left': _left_offset + "px",
				'padding-right': _right_offset + "px",
				'padding-top': _top_offset_with_content + "px"
			});

			// Fixed toolbar
			_fixed_toolbar.css({ 
				width: (_window_width - _left_offset - _right_offset) + "px",
				left: _left_offset + "px"
			});
		}

		// Navigation
		_mainnav.css({ height: (_window_height - _top_offset) + "px" });
		_subnav.css({ height: (_window_height - _top_offset) + "px" });
		_sidenav.css({ height: (_window_height - _top_offset) + "px" });

		_set_loaded_state();
	}

	// Scrollbars
	// 

	page.asInitScrollbars = function() {
		// Nav scrollbars
		$('#site-subnav-scroll-area').scrollbar();
		$('#site-nav-scroll-area').scrollbar();
	}

	page.asSetScrollbars = function() {
		$("#site-nav-scroll-area").css("height", (_window_height - _top_offset) + "px");
		var titleHeight = $("#site-subnav > .title").outerHeight();
		$("#site-subnav-scroll-area").css("height", (_window_height - _top_offset - titleHeight) + "px");
	}
	
	page.asUpdateScrollbars = function() {
		page.asSetScrollbars();
		// Nav scrollbars
		var scrollSubnav = $('#site-subnav-scroll-area');
		var scrollMainnav = $('#site-nav-scroll-area');
		subnavVisible = scrollSubnav.scrollbar('isVisible');
		mainnavVisible = scrollMainnav.scrollbar('isVisible');

		_subnav_offset_cache =  subnavVisible ? scrollSubnav.scrollbar('getScrollPosition') : 0;
		_mainnav_offset_cache = mainnavVisible ? scrollMainnav.scrollbar('getScrollPosition') : 0;

		scrollSubnav.scrollbar('update', _subnav_offset_cache);
		scrollMainnav.scrollbar('update', _mainnav_offset_cache);
	}

	// Breakpoint
	// 
	 
	page.asUpdateBreakpoint = function() {
		if (!page.checkBreakpoint()) {
			page.asToggleMenu(true);
			_breakpoint_menu_visible = false;
			return;
		}

		_content.css({ 'padding-left':0, 'padding-top': _top_offset_with_content + "px" });
		_fixed_toolbar.css({ left: 0, width: '100%' });

		if (!_breakpoint_menu_visible) {
			_mainnav.css({ 'visibility': 'hidden' });
			_subnav.css({ 'visibility': 'hidden' });
		}
	}

	page.asToggleMenu = function(force) {
		if (_mainnav.css('visibility') == 'visible' && !force) {
			_mainnav.css({ 'visibility': 'hidden' });
			_subnav.css({ 'visibility': 'hidden' });        
			_breakpoint_menu_visible = false;
		} else {
			_mainnav.css({ 'visibility': 'visible' });
			_subnav.css({ 'visibility': 'visible' });
			_breakpoint_menu_visible = true;
		}
	}

	// Returns true for tablet and mobile device
	page.checkBreakpoint = function() {
		return _window.width() < page.breakpointSize;
	}
	
	// Internals
	// 

	var _is_dom_resized = function() {
		height = jQuery('body').height();
		if(_attributes.body_height != height) {
			_attributes.body_height = height;
			jQuery(window).trigger('resize');
		}
	}

	// Webkit browsers like to load CSS and JS at the same time,
	// so this throws off some calculations and produces scrollbars
	// if we pump up our content, then release it, Chrome catches up
	var _webkit_fix = function() {
		_content.css({ 
			overflow: 'hidden', 
			height: _window_height + 'px'
		});

		setTimeout(function(){
			_content.css({ 
				height: 'auto',
				overflow: 'visible' 
			});
		}, 100);
	}    

	var _set_loaded_state = function() {
		if (_is_loaded)
			return;

		_is_loaded = true;
		_fixed_toolbar.addClass('is-loaded');
		_content.addClass('is-loaded');
	}

	return page;
}(Admin_Page || {}, jQuery));


