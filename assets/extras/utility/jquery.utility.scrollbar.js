;(function ($, window, document, undefined) {

    $.widget("utility.scrollbar", {
        version: '1.0.5',
        options: {
            axis:           'vertical', // Vertical or horizontal scrollbar?
            wheel:          40,         // How many pixels to scroll at a time
            scroll:         true,       // Enable or disable the mousewheel
            lockscroll:     true,       // Return scrollwheel to browser if there is no more content
            size:           'auto',     // Set the size of the scrollbar to auto or a fixed number
            sizethumb:      'auto',     // Set the size of the thumb to auto or a fixed number
            invertscroll:   true,       // Enable mobile invert style scrolling
            start_position: null        // bottom|relative
        },

        _viewport: { obj: null },
        _content: { obj: null },
        _scrollbar: { obj: null },
        _track: { obj: null },
        _thumb: { obj: null },
        _scroll_is_horizontal: null,
        _scroll_direction: null,
        _scroll_size_name: null,
        _scroll_position: 0,
        _position_obj: { start: 0, now: 0 },
        _mouse_obj: {},
        _is_visible: false,
        _is_hovered: false,
        _is_loaded: false,
        _is_touch: false,
        _drag_locked: false,

        _init: function () { var _this = this;
            //@todo use _create
            if (this._is_loaded) return;
            this._is_loaded = true;
            this._is_touch = Modernizr.touch;

            this._build_elements();
            
            this._scroll_is_horizontal = (this.options.axis === 'horizontal');
            this._scroll_direction = this._scroll_is_horizontal ? 'left' : 'top';
            this._scroll_size_name = this._scroll_is_horizontal ? 'Width' : 'Height';

            this.update(this.options.start_position);            
            this._bind_events();
        },

        destroy: function () { 
            $.Widget.prototype.destroy.call(this);
        },

        update: function(scroll) {
            
            if (this._scroll_is_horizontal) {
                // Horizontal scroll
                this._content.obj.css({ 
                    height: (this.element.outerHeight() - 20) + "px" 
                });
                this._viewport.obj.css({
                    top: 20 + "px",
                    width: this.element.outerWidth() + "px", 
                    height: (this.element.outerHeight() - 20) + "px"                     
                });
            } else {
                // Vertical scroll
                this._content.obj.css({ 
                    width: this.element.outerWidth() + "px" 
                });
                this._viewport.obj.css({ 
                    width: this.element.outerWidth() + "px", 
                    height: this.element.outerHeight() + "px" 
                });
            }

            this._viewport[this.options.axis] = this._viewport.obj[0]['offset'+ this._scroll_size_name];
            this._content[this.options.axis] = this._content.obj[0]['scroll'+ this._scroll_size_name];
            this._content.ratio = this._viewport[this.options.axis] / this._content[this.options.axis];

            this._scrollbar.obj.toggleClass('disable', this._content.ratio >= 1);

            this._track[this.options.axis] = this.options.size === 'auto' 
                ? this._viewport[this.options.axis] 
                : this.options.size;

            this._thumb[this.options.axis] = Math.min(this._track[this.options.axis], 
                Math.max(0, 
                    (this.options.sizethumb === 'auto' 
                        ? (this._track[this.options.axis] * this._content.ratio) 
                        : this.options.sizethumb
                    )
                )
            );
        
            this._scrollbar.ratio = this.options.sizethumb === 'auto' 
                ? (this._content[this.options.axis] / this._track[this.options.axis]) 
                : (this._content[this.options.axis] - this._viewport[this.options.axis]) / (this._track[this.options.axis] - this._thumb[this.options.axis]);
            
            // Scroll relative to old content
            this._scroll_position = (scroll === 'relative' && this._content.ratio <= 1) 
                ? Math.min((this._content[this.options.axis] - this._viewport[this.options.axis]), Math.max(0, this._scroll_position)) 
                : 0;
            
            // Scroll to bottom
            this._scroll_position = (scroll === 'bottom' && this._content.ratio <= 1) 
                ? (this._content[this.options.axis] - this._viewport[this.options.axis]) 
                : isNaN( parseInt(scroll, 10)) ? this._scroll_position : parseInt(scroll, 10);
            
            this.setSize();

            // Prevent visible scrollbar onload
            if (!this._is_visible) {
                this._scrollbar.obj.fadeOut(0);
            }            
        },

        isVisible: function() {
            return this._is_visible;
        },

        setSize: function() {
            var css_size = this._scroll_size_name.toLowerCase();

            this._thumb.obj.css(this._scroll_direction, this._scroll_position / this._scrollbar.ratio);
            this._content.obj.css(this._scroll_direction, -this._scroll_position );
            this._mouse_obj.start = this._thumb.obj.offset()[this._scroll_direction];

            this._scrollbar.obj.css(css_size, this._track[this.options.axis]);
            this._track.obj.css(css_size, this._track[this.options.axis]);
            this._thumb.obj.css(css_size, this._thumb[this.options.axis]);

            this._is_visible = (this.getScrollSize() > this.getPanelSize());            
        },

        setPosition: function(scroll_legnth) {
            var allowableLength = this.getScrollSize() - this.getPanelSize();
            if (scroll_legnth < allowableLength)
                this.update(scroll_legnth);
            else
                this.update('bottom');

        },

        getScrollPosition: function() {
            return this._scroll_position;
        },

        getScrollSize: function() {
            return this._content[this.options.axis];
        },

        getPanelSize: function() {
            return this._viewport[this.options.axis];
        },

        _build_elements: function() {
            var viewport = $('<div />').addClass('viewport');
            var overview = $('<div />').addClass('overview');
            var scrollbar = $('<div />').addClass('scrollbar');
            var track = $('<div />').addClass('track').appendTo(scrollbar);
            var thumb = $('<div />').addClass('thumb').appendTo(track);
            var end = $('<div />').addClass('end').appendTo(thumb);            

            this.element
                .addClass('scroll-bar')
                .addClass(this.options.axis)
                .wrapInner(overview)
                .wrapInner(viewport);

            this.element.css('position', 'relative').prepend(scrollbar);

            this._viewport = { obj: $('.viewport', this.element) };
            this._content = { obj: $('.overview', this.element) };
            this._scrollbar = { obj: scrollbar };
            this._track = { obj: track };
            this._thumb = { obj: thumb };

            this._scrollbar.obj.hide();
        },

        _bind_events: function() { var self = this;
            if (!this._is_touch) {
                this._thumb.obj.on('mousedown.utility.scrollbar', $.proxy(this._start_bar, this));
                this._track.obj.on('mouseup.utility.scrollbar', $.proxy(this._drag_event, this));
            }
            else {
                this._viewport.obj.on('touchstart.utility.scrollbar', function(event) {
                    var tEvent = event.originalEvent;
                    if (tEvent.touches.length === 1) {
                        self._start_bar.apply(self, [tEvent.touches[0]]);
                        event.stopPropagation();
                    }
                });
            }

            if (this.options.scroll && window.addEventListener) {
                this.element.get(0).addEventListener('DOMMouseScroll', $.proxy(this._wheel_event, this), false);
                this.element.get(0).addEventListener('mousewheel', $.proxy(this._wheel_event, this), false);
                this.element.get(0).addEventListener('MozMousePixelScroll', function(event){ event.preventDefault(); }, false);
            }
            else if (this.options.scroll) {
                this.element.get(0).onmousewheel = this._wheel_event;
            }

            this.element.hover(
                $.proxy(this._show_scroll_thumb, this), 
                $.proxy(this._hide_scroll_thumb, this)
            );

            this._thumb.obj.on('mouseleave', function() {
                self._drag_locked = false;
            });
        },

        _show_scroll_thumb: function() {
            if (this._is_touch)
                return;
            
            if (this._is_visible)
                this._scrollbar.obj.fadeIn('fast');

            this._is_hovered = true;
        },

        _hide_scroll_thumb: function() {
            this._is_hovered = false;
            if (!this._drag_locked && this._is_visible)
                this._scrollbar.obj.stop().fadeOut('fast'); 
        },

        _start_bar: function(event) { var self = this;
            $('body').addClass('scroll-bar-noselect');

            var _thumb_dir = parseInt(this._thumb.obj.css(this._scroll_direction), 10);
            this._mouse_obj.start = this._scroll_is_horizontal ? event.pageX : event.pageY;
            this._position_obj.start = _thumb_dir == 'auto' ? 0 : _thumb_dir;            
            
            if (!this._is_touch) {
                
                $(document).on('mousemove.utility.scrollbar', $.proxy(this._drag_event, this));
                $(document).on('mouseup.utility.scrollbar', $.proxy(function() { 
                    this._stop_bar();
                    if (!this._is_hovered && this._is_visible)
                        this._scrollbar.obj.stop().fadeOut('fast'); 
                }, this));
                this._thumb.obj.on('mouseup.utility.scrollbar', $.proxy(this._stop_bar, this));

            } else {
                $(document).on('touchmove.utility.scrollbar', function(event) {
                    var tEvent = event.originalEvent;
                    event.preventDefault();
                    self._drag_event.apply(self, [tEvent.touches[0]]);
                });
                $(document).on('touchend.utility.scrollbar', $.proxy(this._stop_bar, this));
            }
        },
        
        _stop_bar: function() { 
            this._drag_locked = false;
            $('body').removeClass('scroll-bar-noselect');
            this._thumb.obj.off('mouseup.utility.scrollbar');
            $(document).off('mousemove.utility.scrollbar');
            $(document).off('mouseup.utility.scrollbar');
            $(document).off('touchmove.utility.scrollbar');
            $(document).off('touchend.utility.scrollbar');
        },

        _wheel_event: function(event) {
            this._drag_locked = false;
            if (this._content.ratio < 1) {
                var oEvent = (event) ? event : window.event;
                var iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3;

                this._scroll_position -= iDelta * this.options.wheel;
                this._scroll_position = Math.min(
                    (this._content[this.options.axis] - this._viewport[this.options.axis]), 
                    Math.max(0, this._scroll_position)
                );

                this._thumb.obj.css(this._scroll_direction, this._scroll_position / this._scrollbar.ratio);
                this._content.obj.css(this._scroll_direction, -(this._scroll_position));

                if (this.options.lockscroll 
                    || (this._scroll_position !== (this._content[this.options.axis] - this._viewport[this.options.axis]) 
                    && this._scroll_position !== 0) 
                ) {
                    oEvent = $.event.fix(oEvent);
                    oEvent.preventDefault();
                }
            }            
        },

        _drag_event: function(event) {
            this._drag_locked = true;
            if (this._content.ratio < 1) {
                if (this.options.invertscroll && this._is_touch) {
                    this._position_obj.now = Math.min(
                        (this._track[this.options.axis] - this._thumb[this.options.axis]),
                        Math.max(0, 
                            (this._position_obj.start 
                                + (this._mouse_obj.start 
                                - (this._scroll_is_horizontal ? event.pageX : event.pageY)))
                        )
                    );
                } else {
                     this._position_obj.now = Math.min(
                        (this._track[this.options.axis] - this._thumb[this.options.axis]),
                        Math.max(0, 
                            (this._position_obj.start 
                                + ((this._scroll_is_horizontal ? event.pageX : event.pageY) 
                                - this._mouse_obj.start))
                        )
                    );
                }

                this._scroll_position = this._position_obj.now * this._scrollbar.ratio;
                this._content.obj.css(this._scroll_direction, -this._scroll_position);
                this._thumb.obj.css(this._scroll_direction, this._position_obj.now);
            }
        }

    });

})( jQuery, window, document );