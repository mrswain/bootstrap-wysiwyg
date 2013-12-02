/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $*/
/*jslint browser:true*/
(function ($, undef) {
    'use strict';

    function initializer(editor, toolbar, options) {
        var changeId = 0;
        // dirty hack for now
        editor.on("input DOMNodeInserted DOMNodeRemoved DOMCharacterDataModified", function (e) {
            if (!changeId && options.changeThrottle)
                changeId = window.setTimeout(function () { changeId = 0; options.changeCallback(editor); }, options.changeThrottle);
            else if (!changeId)
                options.changeCallback(editor);
        });

        // return no object since this plugin has no toolbar option
        return true;
    }

    $.fn.wysiwyg.defaults = $.extend($.fn.wysiwyg.defaults, {
        changeCallback: function (editor) { editor.trigger("change"); },
        changeThrottle: 50
    });
    $.fn.wysiwyg.plugins = $.extend($.fn.wysiwyg.plugins, {
        "event.change": initializer
    });

}(window.jQuery));