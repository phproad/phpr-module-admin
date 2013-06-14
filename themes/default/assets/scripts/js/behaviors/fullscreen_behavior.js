var Admin_Page = (function(page, $){

	page.constructor = $(document).ready(function() { 

		$('#admin-tray-fullscreen').on('onTrayAfterOpen', function(){
			Admin_Page.fsToggle();
		});

	});

	var _is_fullscreen = false,
		_original_offset_top = 0;


	page.fsToggle = function() {

		_is_fullscreen = (_is_fullscreen) ? false : true;
		
		if (_is_fullscreen) {
			_original_offset_top = $("#fixed-toolbar").css('top');
			$("#fixed-toolbar, #site-sidenav").css('top', 0);
		}
		else
			$("#fixed-toolbar, #site-sidenav").css('top', _original_offset_top);

		$("#site-header, #site-nav, #site-subnav").toggle();
		$('body').trigger('resize');

		// Enable or disable auto closing
		Admin_Page.trayAutoClose = !_is_fullscreen;

		if (!_is_fullscreen)
			Admin_Page.trayHide();
	}

	return page;
}(Admin_Page || {}, jQuery));