/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $, FileReader*/
/*jslint browser:true*/
(function ($) {
	'use strict';

	function initializer(editor, toolbar, options) {
		var container = $("<DIV/>"),
			$body = $("BODY"),
			$window = $(window),
			parent,
			modal,
			editorCss,
			bodyCss,
			scrollTop;

		function resize(button) {
			modal = parent.closest(".modal");
			if (maximized(button)) {
				parent.append(container.children());
				editor.css(editorCss);
				$body.css(bodyCss);
				$window.scrollTop(scrollTop);
				modal.show();
				container.detach();
			} else {
				container.detach().appendTo("BODY").css({ top: 0, left: 0 });
				container.css("z-index", modal.css("z-index"));
				modal.hide();
				container.append(toolbar, editor);
				var pos = editor.position();
				editorCss = { position: editor.css("position"), top: editor.css("top"), left: editor.css("left"), left: editor.css("bottom"), right: editor.css("right") };
				bodyCss = { overflow: $body.css("overflow"), "overflow-x": $body.css("overflow-x"), "overflow-y": $body.css("overflow-y") };
				$body.css({ overflow: "hidden", "overflow-x": "hidden", "overflow-y": "hidden" });
				scrollTop = $window.scrollTop();
				$window.scrollTop(0);
				editor.css({
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					top: pos.top
				});
			}
			editor.focus();
		}

		function maximized(button) {
			return container.children().size() > 0;
		}

		container.css({
			position: "absolute",
			left: 0,
			top: 0,
			bottom: 0,
			right: 0,
			"background-color": options.fullscreenBackground || "white"
		});

		parent = editor.parent();

		return {
			exec: resize,
			active: maximized
		};
	}

	$.fn.wysiwyg.plugins = $.extend($.fn.wysiwyg.plugins, {
		fullscreen: initializer
	});
} (window.jQuery));
