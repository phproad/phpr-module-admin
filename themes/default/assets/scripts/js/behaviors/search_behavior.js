var Admin_Page = (function(page, $){

	page.constructor = $(document).ready(function() { 
		_container_element = $('#admin-tray-search');
		_search_element = _container_element.find('input:first');

		_container_element.on('onTrayAfterOpen', function(){
			_search_element.focus().val('').trigger('click');
		});

		page.initAutoComplete();

	});

	var _container_element,
		_search_element;

	page.initAutoComplete = function() {

		_search_element.autocomplete({
			minLength: 0,
			appendTo: _container_element.find('>.dropdown'),
			source: function (request, response) {
				$.post(admin_url('admin/index/quicksearch'), request, response);
			},
			select: function(event, ui) {
				LightLoadingIndicator().show();
				_container_element.hide();
				setTimeout(function() { window.location = ui.item.link; }, 100);
			}
		})
		.data('ui-autocomplete')._renderItem = function(ul, item) {
			var listElement = $('<li />')
				anchor = $('<a />'),
				icon = $('<i />').addClass('icon-'+item.icon).addClass('icon'),
				desc = $('<span />').addClass('description');

			var content = item.label + '<small>' + item.item_name + '</small>';

			desc.html(content)
			anchor.append(icon).append(desc);
			listElement.append(anchor);
			return listElement.appendTo(ul);
		};

	}

	return page;
}(Admin_Page || {}, jQuery));