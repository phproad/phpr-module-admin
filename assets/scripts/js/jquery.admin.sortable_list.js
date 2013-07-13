//
// Sortable class
//

;(function ($, window, document, undefined) {

	$.widget("admin.sortableList", {
		version: '1.0.0',
		options: { 
			handler: null,
			handleClass: '.sort-handle',
			extraData: null,
			inputIds: 'item_ids',
			inputOrders: 'item_orders',
			onDragComplete: null,
			onSortComplete: null
		},

		_list_orders: [],
		_list_ids: [],
		_el_orders: null,
		_el_ids: null,

		_init: function () { var self = this;
			this._list_orders = [];

			this._el_orders = this.element
				.find('input.' + this.options.inputOrders)
				.each(function(){ self._list_orders.push($(this).val()); })

			this.element.sortable({
				axis: 'y',
				containment: 'parent',
				start: function(event, ui) {
					ui.item.addClass('drag');
				},
				stop: function(event, ui) {
					ui.item.removeClass('drag');
					self.onSortItems.apply(self);
					self.element.trigger('dragComplete', [self._list_orders]);
					self.options.onDragComplete && self.options.onDragComplete(self._list_orders);
				},
				handle: this.options.handleClass,
				tolerance: 'pointer',
				helper: function(e, tr) {
					hide_tooltips();

					var originals = tr.children(),
						helper = tr.clone();
					helper.children().each(function(index) {
						// Set helper cell sizes to match the original sizes
						$(this).width(originals.eq(index).width());
					});
					return helper;
				}
			});

		},

		onSortItems: function() { var self = this;
			this._list_ids = [];
			this._el_ids = this.element
				.find('input.' + this.options.inputIds)
				.each(function(){ self._list_ids.push($(this).val()); });

			var postData = $.extend(true, self.options.extraData, {
				item_ids: self._list_ids.join(','),
				sort_orders: self._list_orders.join(',')
			});

			this.element.closest('form').phpr().post(self.options.handler, {
				data: postData,
				loadIndicator: { show:false },
				update: 'multi',
				complete: function(requestObj) {
					self.element.trigger('sortComplete', [requestObj]);
					self.options.onSortComplete && self.options.onSortComplete();
				}
			}).send();
		},

		destroy: function() {
			$.Widget.prototype.destroy.call(this);
		}

	});

})( jQuery, window, document );