/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $, FileReader*/
/*jslint browser:true*/
(function ($) {
    'use strict';

    function getHtml(range) {
        if (range.cloneContents) {
            return $("<DIV/>").append(range.cloneContents()).html();
        }
        if (range.htmlText) {
            return range.htmlText;
        }
        return null;
    }

    function setHtml(range, html) {
        if (range.deleteContents) {
            range.deleteContents();
            html = $.parseHTML(html);
            for (var i = html.length - 1; i >= 0; i--) {
                range.insertNode(html[i]);
            }
            return;
        }
        range.text = html;
    }

    function setText(range, text) {
        if (range.deleteContents) {
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            return;
        }
        range.text = text;
    }

    function initializer(editor, toolbar, options) {
        function canDeFormat(button, range) {
            return range && !!(range.text || range.endOffset);
        }

        function deformat(button, range) {
            if (button.data("keepBreaks")) {
                var html = getHtml(range);
                var text = $($.parseHTML(html.replace(/(<p.*?\/?>)|(<br.*?\/>)|(<\/p>)/g, '\n'))).text();
                html = '<p>' + text.replace(/\r/g, '').replace(/^\n+/, '').replace(/\n+$/, '').replace(/\n+/g, '</p><p>') + '</p>';
                setHtml(range, html);
            } else {
                setText(range, $(getHtml(range)).text());
            }
        }

        return {
            exec: deformat,
            enabled: canDeFormat
        };
    }

    $.fn.wysiwyg.plugins = $.extend($.fn.wysiwyg.plugins, {
        deformatter: initializer
    });
} (window.jQuery));
