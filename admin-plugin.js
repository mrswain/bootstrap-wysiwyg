/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $*/
/*jslint browser:true*/
!function ($) {
    'use strict';

    function initializer(editor, toolbar, options) {
        // this plugin is just a marker for toolbar functions
        return true;
    }

    $.fn.wysiwyg.plugins = $.extend($.fn.wysiwyg.plugins, {
        "admin.support": initializer
    });

}(window.jQuery);