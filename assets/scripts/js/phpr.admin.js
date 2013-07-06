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
		},
		hideErrorOnSuccess: true,
		loadIndicator: {
			element: '#form-element',
			show: true,
			hideOnSuccess: false,
			overlayClass: 'loading-overlay',
			posX: 'center',
			posY: 'center',
			src: phpr_url('/assets/images/loading_70.gif'),
			injectInElement: false,
			noImage: false,
			zIndex: 9999,
			absolutePosition: true,
			injectPosition: 'bottom'
		}	
	}

	PHPR.admin = function() {
		var o = {},
			_options;

		o.setDefaultOptions = function(defaultOptions) {
			PHPR.adminDefaults = $.extend(true, PHPR.adminDefaults, defaultOptions);
		}

		o.buildOptions = function() {
			var options = $.extend(true, {}, PHPR.adminDefaults, _options);
			return _options = options;
		}		

		o.highlightError = function(requestObj) {
			o.buildOptions();

			var element = null;

			//
			// Find an element to inject the error
			// 
			
			if (_options.errorHighlight.element != null) { 
				element = $(_options.errorHighlight.element);
			}
			else if (requestObj.postObj) {
				var postForm = requestObj.postObj.getFormElement(),
					updateObj = requestObj.postObj.getOption('update');
				
				if (postForm)
					element = postForm.find('.form-flash:first');
				else if (updateObj instanceof jQuery)
					element = updateObj;
			}

			// Last resort, find anything to use
			if (!element.length)
				element = $('body').find('.form-flash:first');

			if (!element || !element.length)
				return;

			//
			// Handle popup
			// 
			
			var isPopup = element.hasClass('popupForm');
			if (isPopup) {
				element
					.wrapInner('<div class="content" />')
					.wrapInner('<div class="form-600" />');

				element = element.find('>*>*');
			}

			//
			// Generate an error alert
			// 
			
			if (!isPopup)
				element.html('');
			
			var pElement = $('<div />').addClass('alert alert-error');
			pElement.html(requestObj.errorMessage);
			element.prepend(pElement);

			if (_options.errorHighlight.backgroundFromColor) {
				pElement
					.css({ backgroundColor: _options.errorHighlight.backgroundFromColor }).animate({
						backgroundColor: _options.errorHighlight.backgroundToColor
					}, 500, 'easeOutSine');
			}

			// Re-align popup forms
			realignPopups();
		}

		o.hideError = function(requestObj) {
			o.buildOptions();
			if (!_options.hideErrorOnSuccess)
				return;

			if (!_options.loadIndicator.hideOnSuccess)
				return;

			var element = null;

			if (_options.errorHighlight.element != null)
				element = $(_options.errorHighlight.element);
			else if (requestObj.postObj) {
				var postForm = requestObj.postObj.getFormElement();
				if (postForm)
					element = postForm.find('.form-flash:first');
			}

			if (!element.length)
				return;

			element.html('');

			var parent_form = element.closest('form');
			if (parent_form.length) {
				$(parent_form).find('fieldset.form_elements div.control-group').each(function(el){
					el.removeClass('error');
				});
			}
		}

		return o;
	}

	//
	// Loading indicator defaults
	// 
	
	PHPR.indicator().setDefaultOptions(PHPR.adminDefaults.loadIndicator);

	//
	// Post defaults
	// 


	PHPR.requestDefaults.cmsMode = false;

	PHPR.post.popupError = function(requestObj) {
		PHPR.admin().highlightError(requestObj);
	}

	$(PHPR).on('success.post', function(event, requestObj) { 
		PHPR.admin().hideError(requestObj);
	});

})(jQuery);




