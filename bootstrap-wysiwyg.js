/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $, FileReader*/
/*jslint browser:true*/
(function ($) {
    'use strict';
    var readFileIntoDataUrl = function (fileInfo) {
        var loader = $.Deferred(),
			fReader = new FileReader();
        fReader.onload = function (e) {
            loader.resolve(e.target.result);
        };
        fReader.onerror = loader.reject;
        fReader.onprogress = loader.notify;
        fReader.readAsDataURL(fileInfo);
        return loader.promise();
    };
    $.fn.cleanHtml = function () {
        var html = $(this).html();
        return html && html.replace(/(<br>|\s|<div><br><\/div>|&nbsp;)*$/, '');
    };
    $.fn.wysiwyg = function (userOptions) {
        var editor = this,
			selectedRange,
			plugins,
			options,
			toolbarBtnSelector,
			pluginBtnSelector,
            enableSelector,
			updateToolbar = function () {
			    if (options.activeToolbarClass) {
			        $(options.toolbarSelector).find(toolbarBtnSelector).each(function () {
			            var command = $(this).data(options.commandRole);
			            if (queryCommand(command)) {
			                $(this).addClass(options.activeToolbarClass);
			            } else {
			                $(this).removeClass(options.activeToolbarClass);
			            }
			        });
			        $(options.toolbarSelector).find(pluginBtnSelector).each(function () {
			            var command = $(this).data(options.pluginRole);
			            var plugin = plugins[command];
			            if (plugin && plugin.enabled && !plugin.enabled(this, selectedRange)) {
			                $(this).addClass(options.disabledToolbarClass);
			            } else {
			                $(this).removeClass(options.disabledToolbarClass);
			            }
			            if (plugin && plugin.active && plugin.active(this, selectedRange)) {
			                $(this).addClass(options.activeToolbarClass);
			            } else {
			                $(this).removeClass(options.activeToolbarClass);
			            }
			        });
			    }
			},
			queryCommand = function (commandWithArgs, valueArg) {
			    var commandArr = commandWithArgs.split(' '),
					command = commandArr.shift(),
					args = commandArr.join(' ') + (valueArg || '');
			    return document.queryCommandState(command, args);
			},
			execCommand = function (commandWithArgs, valueArg) {
			    var commandArr = commandWithArgs.split(' '),
					command = commandArr.shift(),
					args = commandArr.join(' ') + (valueArg || '');
			    document.execCommand(command, 0, args);
			    updateToolbar();
			},
			bindHotkeys = function (hotKeys) {
			    $.each(hotKeys, function (hotkey, command) {
			        var keydown = 'keydown.' + hotkey.replace('+', '_').split(' ').join(' keydown.');
			        var keyup = 'keyup.' + hotkey.replace('+', '_').split(' ').join(' keyup.');
			        editor.on('keydown', null, hotkey, function (e) {
			            if (editor.attr('contenteditable') && editor.is(':visible')) {
			                e.preventDefault();
			                e.stopPropagation();
			                execCommand(command);
			            }
			        }).on('keyup', null, hotkey, function (e) {
			            if (editor.attr('contenteditable') && editor.is(':visible')) {
			                e.preventDefault();
			                e.stopPropagation();
			            }
			        });
			    });
			},
			getCurrentRange = function () {
			    var sel = window.getSelection();
			    if (sel.getRangeAt && sel.rangeCount) {
			        return sel.getRangeAt(0);
			    }
			},
			saveSelection = function () {
			    selectedRange = getCurrentRange();
			},
			restoreSelection = function () {
			    var selection = window.getSelection();
			    if (selectedRange) {
			        try {
			            selection.removeAllRanges();
			        } catch (ex) {
			            document.body.createTextRange().select();
			            document.selection.empty();
			        }

			        selection.addRange(selectedRange);
			    }
			},
			insertFiles = function (files) {
			    editor.focus();
			    $.each(files, function (idx, fileInfo) {
			        if (/^image\//.test(fileInfo.type)) {
			            $.when(readFileIntoDataUrl(fileInfo)).done(function (dataUrl) {
			                execCommand('insertimage', dataUrl);
			            }).fail(function (e) {
			                options.fileUploadError("file-reader", e);
			            });
			        } else {
			            options.fileUploadError("unsupported-file-type", fileInfo.type);
			        }
			    });
			},
			markSelection = function (input, color) {
			    restoreSelection();
			    if (document.queryCommandSupported('hiliteColor')) {
			        document.execCommand('hiliteColor', 0, color || 'transparent');
			    }
			    saveSelection();
			    input.data(options.selectionMarker, color);
			},
			bindToolbar = function (toolbar, options, plugins) {
			    toolbar.find(toolbarBtnSelector).click(function () {
			        restoreSelection();
			        editor.focus();
			        execCommand($(this).data(options.commandRole));
			        saveSelection();
			    });
			    toolbar.find(pluginBtnSelector).click(function () {
			        restoreSelection();
			        editor.focus();
			        var plugin = plugins[$(this).data(options.pluginRole)];
			        if (typeof (plugin) === "function")
			            plugin.call(plugin, this);
			        else if (plugin && plugin.exec)
			            plugin.exec(this);
			        updateToolbar();
			        saveSelection();
			    });
			    toolbar.find(enableSelector).each(function () {
			        var plugin = plugins[$(this).data(options.enableRole)];
			        if (!plugin)
			            $(this).remove();
			    });
			    toolbar.find('[data-toggle=dropdown]').click(restoreSelection);

			    toolbar.find('input[type=text][data-' + options.commandRole + ']').on('webkitspeechchange change', function () {
			        var newValue = this.value; /* ugly but prevents fake double-calls due to selection restoration */
			        this.value = '';
			        restoreSelection();
			        if (newValue) {
			            editor.focus();
			            execCommand($(this).data(options.commandRole), newValue);
			        }
			        saveSelection();
			    }).on('focus', function () {
			        var input = $(this);
			        if (!input.data(options.selectionMarker)) {
			            markSelection(input, options.selectionColor);
			            input.focus();
			        }
			    }).on('blur', function () {
			        var input = $(this);
			        if (input.data(options.selectionMarker)) {
			            markSelection(input, false);
			        }
			    });
			    toolbar.find('input[type=file][data-' + options.commandRole + ']').change(function () {
			        restoreSelection();
			        if (this.type === 'file' && this.files && this.files.length > 0) {
			            insertFiles(this.files);
			        }
			        saveSelection();
			        this.value = '';
			    });
			},
			initFileDrops = function () {
			    editor.on('dragenter dragover', false)
					.on('drop', function (e) {
					    var dataTransfer = e.originalEvent.dataTransfer;
					    e.stopPropagation();
					    e.preventDefault();
					    if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
					        insertFiles(dataTransfer.files);
					    }
					});
			};
        options = $.extend({}, $.fn.wysiwyg.defaults, userOptions);
        toolbarBtnSelector = 'a[data-' + options.commandRole + '],button[data-' + options.commandRole + '],input[type=button][data-' + options.commandRole + ']';
        pluginBtnSelector = 'a[data-' + options.pluginRole + '],button[data-' + options.pluginRole + '],input[type=button][data-' + options.pluginRole + ']';
        enableSelector = '[data-' + options.enableRole + ']';
        bindHotkeys(options.hotKeys);
        if (options.dragAndDropImages) {
            initFileDrops();
        }
        plugins = {};
        for (var i = 0, l = options.plugins.length; i < l; i++) {
            var name = options.plugins[i];
            var plugin = $.fn.wysiwyg.plugins[name];
            if (typeof (plugin) === "function") {
                plugins[name] = plugin(editor, $(options.toolbarSelector), options);
            }
        }
        bindToolbar($(options.toolbarSelector), options, plugins);
        editor.attr('contenteditable', true)
			.on('mouseup keyup mouseout', function () {
			    saveSelection();
			    updateToolbar();
			});
        $(window).bind('touchend', function (e) {
            var isInside = (editor.is(e.target) || editor.has(e.target).length > 0),
				currentRange = getCurrentRange(),
				clear = currentRange && (currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset);
            if (!clear || isInside) {
                saveSelection();
                updateToolbar();
            }
        });
        return this;
    };
    $.fn.wysiwyg.defaults = {
        hotKeys: {
            'ctrl+b meta+b': 'bold',
            'ctrl+i meta+i': 'italic',
            'ctrl+u meta+u': 'underline',
            'ctrl+z meta+z': 'undo',
            'ctrl+y meta+y meta+shift+z': 'redo',
            'ctrl+l meta+l': 'justifyleft',
            'ctrl+r meta+r': 'justifyright',
            'ctrl+e meta+e': 'justifycenter',
            'ctrl+j meta+j': 'justifyfull',
            'shift+tab': 'outdent',
            'tab': 'indent'
        },
        toolbarSelector: '[data-role=editor-toolbar]',
        commandRole: 'edit',
        activeToolbarClass: 'btn-info',
        disabledToolbarClass: 'disabled',
        selectionMarker: 'edit-focus-marker',
        selectionColor: 'darkgrey',
        dragAndDropImages: true,
        fileUploadError: function (reason, detail) { console.log("File upload error", reason, detail); },
        pluginRole: 'command',
        plugins: [],
        enableRole: 'plugin'
    };
    $.fn.wysiwyg.plugins = {
    };
}(window.jQuery));
