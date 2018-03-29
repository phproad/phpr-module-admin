var Admin_Page = (function(page, $){

	var _tray_delay = 200,
		_tray_zindex = 1000,
		_is_loaded = false,
		_active_item = null,
		_active_link = null;
		
	page.trayAutoClose = true;
	page.trayIconWidth = null;
	page.trayContainer = null;
	page.trayIcons = null;
	page.constructor = $(function() {
		page.trayInit();
	});

	page.trayInit = function() {
		if (_is_loaded) return;
		_is_loaded = true;

		var container = page.trayContainer = $('#site-header .tray-icons > ul');
		var icons = page.trayIcons = container.children('li');
		var first_icon = icons.first();
		var total_icons = icons.length;
		var icon_width = page.trayIconWidth = first_icon.width();
		var container_width = container.width();

		$('#site-tray > section').hide();

		icons.find('> a').tooltip({
			placement: 'bottom',
			delay: _tray_delay * 4
		}).on('click', page.trayClick);

		// Close the popup when clicking outside the popup
		$('body').click(function(e) {
			
			// Don't close the popup if the user is clicking inside the popup
			if ($(e.target).parents('#site-tray').length > 0)
				return;

			if (_active_item)
				_active_item.trigger('onTrayBeforeClose');
			
			if (page.trayAutoClose)
				page.trayHide();
		});

		first_icon.css('z-index', _tray_zindex);

		container.hover(function() {
			$(this).stop().animate({ width: icon_width * total_icons }, _tray_delay);
			page.trayIconsShow();

		}, function(){
			$(this).stop().animate({ width: container_width }, _tray_delay * 2);
			page.trayIconsHide();
		});
		container.trigger('onTrayInit');
	}

	page.trayIconsShow = function() {
		var count = 0;
		page.trayIcons.each(function() {
			$(this).css('z-index', _tray_zindex - count).stop().animate({'right': count * page.trayIconWidth }, _tray_delay);
			count++;
		});
	}

	page.trayIconsHide = function() {
		page.trayIcons.stop().animate({'right': 0 }, _tray_delay * 2);
		page.trayIcons.find('> a').tooltip('hide');
	}

	page.trayClick = function() {
		_active_link = $(this);

		var target = _active_link.data('tray-id'),
			targetElement = $('#admin-tray-'+target);

		// No content found, follow the link instead
		if (!targetElement.length)
			return true;

		if (targetElement.is(':visible')) {
			page.trayHide();
		} else {
			page.trayShow(targetElement);
		}

		return false;
	}

	page.trayShow = function(targetElement) {

		_active_item = targetElement;
		
		_active_item.trigger('onTrayBeforeOpen');

		// Toggle link
		_active_link.addClass('active').siblings().removeClass('active');

		// Toggle item container
		_active_item.show().siblings().hide();

		// Hide tooltips
		page.trayIcons.find('> a').tooltip('hide');

		_active_item.trigger('onTrayAfterOpen');
	}
	
	page.trayHide = function() {
		if (!_active_link)
			return;

		// Toggle link
		_active_link.removeClass('active').siblings().removeClass('active');

		// Toggle item container
		_active_item.hide().siblings().hide();

		// Hide tooltips
		page.trayIcons.find('> a').tooltip('hide');

		_active_item.trigger('onTrayAfterClose');
	}

	return page;
}(Admin_Page || {}, jQuery));
