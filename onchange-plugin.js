/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $*/
/*jslint browser:true*/
(function ($, undef) {
    'use strict';

    function initializer(editor, toolbar, options) {
        // dirty hack for now
        editor.on("input DOMNodeInserted DOMNodeRemoved DOMCharacterDataModified", function (e) { options.changeCallback(editor); });

        // return no object since this plugin has no toolbar option
        return undef;
    }

    $.fn.wysiwyg.defaults = $.extend($.fn.wysiwyg.defaults, {
        changeCallback: function (editor) { editor.trigger("change"); }
    });
    $.fn.wysiwyg.plugins = $.extend($.fn.wysiwyg.plugins, {
        "event.change": initializer
    });

} (window.jQuery));