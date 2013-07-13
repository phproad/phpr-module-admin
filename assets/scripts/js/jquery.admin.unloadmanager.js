//
// Page Unload Manager
// 

UnloadManager = function() {

	var o = {
		dataChangedFlag: false,
		unloadMessage: 'Form data was changed.',
		debug: false,
	
		initialize: function() {
			
			$(document).ready(function() { 
				o.bindInputs();
			});

			$(window).on('phprCodeeditorChanged', function(){
				o.dataChanged(this);
			});

			$(window).on('phprEditorAdded', function() {
				o.bindHtmlEditors(this);
			});
			$(window).on('phprEditorReloaded', function() {
				o.bindHtmlEditors(this);
			});

			$(document).on('keypress', o.handleKeypress);

			window.onbeforeunload = o.handleUnload;
		},
		
		handleKeypress: function(event) {
			var which = event.which;

			if (!(((which >= 65 && which <= 90) || (which >= 48 && which <= 57)) && !event.control && !event.meta && !event.alt))
				return true;

			if (event.target) {
				if (event.target.tagName != 'TEXTAREA' && event.target.tagName != 'INPUT' && event.target.tagName != 'SELECT')
					return true;
			}

			if (o.debug) {
				console.log('Key pressed...' + which);
				console.log(event.target.tagName);
			}

			o.dataChanged();
			
			return true;
		},
		
		bindInputs: function() {
			$('input').each(function(){
				var input = $(this);
				if (input.is('radio') || input.is('checkbox'))
					input.on('click', function(){ o.dataChanged(this); });
			});

			$('select').on('change', function() { o.dataChanged(this); });
		},
		
		bindHtmlEditors: function(editorId) {
			// @todo
		},
		
		dataChanged: function(src) {
			if (o.debug)
				console.log('Something changed...');

			o.dataChangedFlag = true;
		},
		
		handleUnload: function() {
			if ($('#phpr_lock_mode').length)
				return;

			if (unloadManager.dataChangedFlag)
				return unloadManager.unloadMessage;
		},
		
		resetChanges: function() {
			if (o.debug)
				console.log('Changes cancelled...');

			o.dataChangedFlag = false;
		}
		
	}

	return o;
	
};

unloadManager = new UnloadManager();