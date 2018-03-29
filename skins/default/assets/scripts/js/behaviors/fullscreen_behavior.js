var Admin_Page = (function(page, $){


	var _is_fullscreen = false,
		_original_offset_top = 0;


	page.fsToggle = function() {

		_is_fullscreen = (_is_fullscreen) ? false : true;
		if(typeof sessionStorage !== 'undefined'){
			sessionStorage.setItem("_is_fullscreen", _is_fullscreen ? 1 : 0);
		}
		
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
	};


	page.constructor = $(document).ready(function() {

		var $adminTrayFullscreen = $("#admin-tray-fullscreen");
		$adminTrayFullscreen.on('onTrayAfterOpen', function(){
			Admin_Page.fsToggle();
		});

		$('#site-header .tray-icons > ul').on('onTrayInit', function() {
			if ($adminTrayFullscreen.length && (typeof sessionStorage !== 'undefined')) {
				if(sessionStorage.getItem("_is_fullscreen") == 1 ){
					$('.tray-link').trigger('click');
					$adminTrayFullscreen.show();
				}
			}
		});

	});

	return page;
}(Admin_Page || {}, jQuery));
