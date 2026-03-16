// Markdown Editor Configuration for Django Unfold
// Uses EasyMDE with custom styling

var MARKDOWN_SELECTOR = 'textarea[data-markdown-editor]';

function getCSRFToken() {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('csrftoken='));
    if (cookie) return cookie.split('=')[1];
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute('content');
    const input = document.querySelector('[name=csrfmiddlewaretoken]');
    if (input) return input.value;
    return '';
}

function createImageUploadAction(uploadUrl) {
    return function uploadImage(editor) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function () {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            const cm = editor.codemirror;
            const pos = cm.getCursor();
            cm.replaceRange('![Uploading...]()', pos);
            const placeholderStart = { line: pos.line, ch: pos.ch };
            const placeholderEnd = { line: pos.line, ch: pos.ch + '![Uploading...]()'.length };

            fetch(uploadUrl, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCSRFToken() },
                body: formData,
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('Upload failed: ' + response.status);
                    return response.json();
                })
                .then(function (data) {
                    const url = data.url;
                    if (!url) throw new Error('No URL in response');
                    const alt = file.name.replace(/\.[^.]+$/, '');
                    cm.replaceRange('![' + alt + '](' + url + ')', placeholderStart, placeholderEnd);
                })
                .catch(function (err) {
                    cm.replaceRange('', placeholderStart, placeholderEnd);
                    alert('Image upload failed: ' + err.message);
                });
        };
        input.click();
    };
}

function initMarkdownEditor(textarea) {
    if (textarea.easymde) {
        return;
    }

    const wrapper = textarea.closest('.markdown-widget-wrapper');
    const uploadUrl = wrapper ? wrapper.dataset.imageUploadUrl : null;

    const imageAction = uploadUrl
        ? createImageUploadAction(uploadUrl)
        : EasyMDE.drawImage;
    const imageTitle = uploadUrl ? "Upload Image" : "Image";

    const easymde = new EasyMDE({
        element: textarea,
        spellChecker: false,
        autosave: {
            enabled: false,
        },
        status: ['lines', 'words', 'cursor'],
        toolbar: [
            {
                name: "bold",
                action: EasyMDE.toggleBold,
                className: "unfold-markdown-button",
                title: "Bold",
            },
            {
                name: "italic",
                action: EasyMDE.toggleItalic,
                className: "unfold-markdown-button",
                title: "Italic",
            },
            {
                name: "strikethrough",
                action: EasyMDE.toggleStrikethrough,
                className: "unfold-markdown-button",
                title: "Strikethrough",
            },
            "|",
            {
                name: "heading-1",
                action: EasyMDE.toggleHeading1,
                className: "unfold-markdown-button",
                title: "Heading 1",
            },
            {
                name: "heading-2",
                action: EasyMDE.toggleHeading2,
                className: "unfold-markdown-button",
                title: "Heading 2",
            },
            {
                name: "heading-3",
                action: EasyMDE.toggleHeading3,
                className: "unfold-markdown-button",
                title: "Heading 3",
            },
            "|",
            {
                name: "quote",
                action: EasyMDE.toggleBlockquote,
                className: "unfold-markdown-button",
                title: "Quote",
            },
            {
                name: "code",
                action: EasyMDE.toggleCodeBlock,
                className: "unfold-markdown-button",
                title: "Code",
            },
            {
                name: "unordered-list",
                action: EasyMDE.toggleUnorderedList,
                className: "unfold-markdown-button",
                title: "Unordered List",
            },
            {
                name: "ordered-list",
                action: EasyMDE.toggleOrderedList,
                className: "unfold-markdown-button",
                title: "Ordered List",
            },
            "|",
            {
                name: "link",
                action: EasyMDE.drawLink,
                className: "unfold-markdown-button",
                title: "Link",
            },
            {
                name: "image",
                action: imageAction,
                className: "unfold-markdown-button",
                title: imageTitle,
            },
            {
                name: "table",
                action: EasyMDE.drawTable,
                className: "unfold-markdown-button",
                title: "Table",
            },
            {
                name: "horizontal-rule",
                action: EasyMDE.drawHorizontalRule,
                className: "unfold-markdown-button",
                title: "Horizontal Rule",
            },
            "|",
            {
                name: "preview",
                action: EasyMDE.togglePreview,
                className: "unfold-markdown-button no-disable",
                title: "Preview",
            },
            {
                name: "side-by-side",
                action: EasyMDE.toggleSideBySide,
                className: "unfold-markdown-button no-disable no-mobile",
                title: "Side by Side",
            },
            {
                name: "fullscreen",
                action: EasyMDE.toggleFullScreen,
                className: "unfold-markdown-button no-disable no-mobile",
                title: "Fullscreen",
            },
            "|",
            {
                name: "guide",
                action: "https://www.markdownguide.org/basic-syntax/",
                className: "unfold-markdown-button",
                title: "Markdown Guide",
            }
        ],
        renderingConfig: {
            codeSyntaxHighlighting: false,
        },
        initialValue: textarea.value,
    });

    // Replace FA icons with Material Symbols
    setTimeout(function() {
        var iconMap = {
            'bold': 'format_bold',
            'italic': 'format_italic',
            'strikethrough': 'format_strikethrough',
            'heading-1': 'format_h1',
            'heading-2': 'format_h2',
            'heading-3': 'format_h3',
            'quote': 'format_quote',
            'code': 'code',
            'unordered-list': 'format_list_bulleted',
            'ordered-list': 'format_list_numbered',
            'link': 'link',
            'image': uploadUrl ? 'upload' : 'image',
            'table': 'table',
            'horizontal-rule': 'horizontal_rule',
            'preview': 'visibility',
            'side-by-side': 'view_sidebar',
            'fullscreen': 'fullscreen',
            'guide': 'help'
        };

        var toolbar = textarea.parentElement.querySelector('.editor-toolbar');
        if (toolbar) {
            Object.keys(iconMap).forEach(function(name) {
                var button = toolbar.querySelector('button.' + name);
                if (button) {
                    button.innerHTML = '';
                    var span = document.createElement('span');
                    span.className = 'material-symbols-outlined';
                    span.textContent = iconMap[name];
                    button.appendChild(span);
                }
            });
        }
    }, 50);

    textarea.easymde = easymde;

    // Force refresh CodeMirror to fix display issues
    setTimeout(function() {
        if (easymde.codemirror) {
            easymde.codemirror.refresh();
        }
    }, 100);

    // Watch for theme changes
    var themeObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                var isDark = document.documentElement.classList.contains('dark');
                var w = textarea.closest('.markdown-widget-wrapper');
                if (w) {
                    if (isDark) {
                        w.classList.add('dark');
                    } else {
                        w.classList.remove('dark');
                    }
                }
            }
        });
    });

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });
}

function initAllMarkdownEditors() {
    var markdownTextareas = document.querySelectorAll(MARKDOWN_SELECTOR);

    // Use IntersectionObserver to lazily initialize editors when they become visible.
    // This ensures editors in hidden tabs (e.g. django-modeltranslation tabbed interface)
    // are only initialized once their tab is activated and they have layout dimensions.
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var textarea = entry.target;
                if (!textarea.easymde) {
                    initMarkdownEditor(textarea);
                }
                observer.unobserve(textarea);
            }
        });
    }, { threshold: 0.1 });

    markdownTextareas.forEach(function(textarea) {
        if (textarea.easymde) return;
        // If the textarea is already visible, initialize immediately
        if (textarea.offsetParent !== null) {
            initMarkdownEditor(textarea);
            return;
        }
        // Otherwise, wait until it becomes visible
        observer.observe(textarea);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Delay initialization to run after modeltranslation's tabbed_translation_fields.js
    // has set up its jQuery UI tabs (it also runs on DOMContentLoaded/ready).
    setTimeout(function() {
        initAllMarkdownEditors();
    }, 0);

    // Listen for tab clicks to init lazy editors and refresh existing ones
    document.addEventListener('click', function(e) {
        var tab = e.target.closest('[role="tab"], .ui-tabs-anchor, .tab-navigation button, .tabbed-form-tabs button');
        if (!tab) return;
        setTimeout(function() {
            // Init any newly-visible editors
            initAllMarkdownEditors();
            // Refresh already-initialized editors
            document.querySelectorAll(MARKDOWN_SELECTOR).forEach(function(textarea) {
                if (textarea.easymde && textarea.easymde.codemirror) {
                    textarea.easymde.codemirror.refresh();
                }
            });
        }, 150);
    });

    // Refresh on window resize
    var resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            document.querySelectorAll(MARKDOWN_SELECTOR).forEach(function(textarea) {
                if (textarea.easymde && textarea.easymde.codemirror) {
                    textarea.easymde.codemirror.refresh();
                }
            });
        }, 200);
    });
});
