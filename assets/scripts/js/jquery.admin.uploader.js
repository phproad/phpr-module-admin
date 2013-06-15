
/**
 * Sortable class
 */

;(function ($, window, document, undefined) {

	$.widget("admin.uploader", {
		version: '1.0.0',
		options: { 
			url: null,
			fieldName: 'phpr_file[]',
			trigger: null,
			extraData: null,
			embedProgressTo: null,
			instantStart: true,
			allowDuplicates: true,
			processResponse: true,
			onUploadComplete: null,
			onUploadStart: null,
			onUploadFail: null
		},

		files: [],
		formData: null,
		progressBar: null,
		inputField: null,
		triggerElement: null,

		_init: function () { var self = this;
			this.progressBar = this.element.find('.progress > .bar:first');
			this.inputField = this._create_input_field();
			this.triggerElement = $(this.options.trigger);

			this._bind_trigger();
			this._bind_uploader();

			this.progressBar.parent().hide();
		},

		_bind_uploader: function() { var self = this;
			var uploaderOptions = {
				start: $.proxy(self.onUploadStart, self),
				done: $.proxy(self.onUploadComplete, self),
				progressall: $.proxy(self.onUploadProgress, self),
				fail: $.proxy(self.onUploadFail, self),
				dataType: 'json',
				type: 'POST',
				url: this.options.url,
				paramName: this.options.fieldName
			};

			// Splice in extraData with form data
			if (this.options.extraData) {
				uploaderOptions.formData = function(form) {
					if (self.formData)
						return self.formData;

					data = form.serializeArray();
					$.each(self.options.extraData, function (name, value) {
						data.push({name: name, value: value});
					});

					return self.formData = data;
				}
			}
			
			this.inputField.fileupload(uploaderOptions);
		},

		_bind_trigger: function() { var self = this;
			self.inputField = self.element.find('input[type="file"]:first');			
			if (self.triggerElement.length > 0) {
				self.triggerElement.off('click').on('click', function() { 
					self.inputField.trigger('click'); 
				});
			}
		},

		_create_input_field: function() {
			var field = $('<input />').attr({
				type: 'file',
				multiple: true,
				name: this.options.fieldName
			}).css({
				position: 'absolute',
				visibility: 'hidden',
				width: '1px'
			});
			field.appendTo(this.element);
			return field;
		},

		_toggle_progress_bar: function(is_show) { var self = this;
			if (is_show) {
				self.progressBar.css('width', '0%').parent().fadeTo(500, 1);
				self.triggerElement.fadeTo(250, 0);
			} else {
				self.progressBar.css('width', '100%').parent().fadeTo(500, 0, function() {
					self.progressBar.css('width', '1%');
				});
				self.triggerElement.fadeTo(1000, 1);
			}
		},

		onUploadStart: function(event, data) {
			this._toggle_progress_bar(true);
			this.options.onUploadStart && this.options.onUploadStart();
		},

		onUploadFail: function(event, data) {
			this._toggle_progress_bar(false);
			alert('Error uploading file: ' + data.errorThrown);
			this.options.onUploadFail && this.options.onUploadFail();
		},
		
		onUploadComplete: function(event, data) {
			this._toggle_progress_bar(false);
			this._bind_trigger();
			this.options.onUploadComplete && this.options.onUploadComplete();
		},

		onUploadProgress: function(event, data) {
    		var progress = parseInt(data.loaded / data.total * 100, 10);
    		this.progressBar.css('width', progress + '%');
		},

		destroy: function() {
			$.Widget.prototype.destroy.call(this);
		}

	});

})( jQuery, window, document );
