/**
 * PHPR Admin
 */

(function($) {

	PHPR.adminDefaults = {
		formFlashClass: '.form-flash',
		errorHighlight: {
			element: null,
			backgroundFromColor: '#f00',
			backgroundToColor: '#ffffcc'
		}
	}

	PHPR.admin = function() {
		var o = {},
			_options;

		o.setDefaultOptions = function(defaultOptions) {
			PHPR.adminDefaults = $.extend(true, PHPR.adminDefaults, defaultOptions);
		}

		o.highlightError = function(requestObj) {

			var element = null,
				options = PHPR.adminDefaults;

			if (options.errorHighlight.element != null) { 
				element = $(this.options.errorHighlight.element);
			}
			else if (requestObj.postObj) {
				var postForm = requestObj.postObj.getFormElement();
				if (postForm)
					element = postForm.find('.form-flash:first');
			}

			if (!element.length)
				return;

			element.html('');
			
			var pElement = $('<div />').addClass('alert alert-error');
			pElement.html(requestObj.error);
			element.prepend(pElement);

			if (options.errorHighlight.backgroundFromColor) {
				pElement
					.css(backgroundColor, options.errorHighlight.backgroundFromColor).animate({
						backgroundColor: options.errorHighlight.backgroundToColor
					}, 500);
			}
			
			/*
			 * Re-align popup forms
			 */
			realignPopups();
		}

		return o;
	}

	//
	// Loading indicator defaults
	// 

	PHPR.indicator.setDefaultOptions({
		element: 'FormElement',
		show: true,
		hideOnSuccess: false,
		overlayClass: 'loading-overlay',
		pos_x: 'center',
		pos_y: 'center',
		src: phpr_url('/assets/images/loading_70.gif'),
		injectInElement: false,
		noImage: false,
		z_index: 9999,
		absolutePosition: true,
		injectPosition: 'bottom',
		hideElement: true
	});

	//
	// Post defaults
	// 

	PHPR.postDefaults.popupError = function(requestObj) {
		PHPR.admin.highlightError(requestObj);
	}

	alert(PHPR.postDefaults.loadingIndicator.show);
	PHPR.postDefaults.loadingIndicator.show = false;
	alert(PHPR.postDefaults.loadingIndicator.show);
}



