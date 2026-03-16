# Django Unfold Markdown Widget

Markdown editor widget for [Django Unfold](https://github.com/unfoldadmin/django-unfold) admin using [EasyMDE](https://github.com/Ionaru/easy-markdown-editor).

## Screenshots

### Editor with Preview
![Markdown Editor](https://github.com/sergei-vasilev-dev/django-unfold-markdown/raw/main/docs/screenshots/editor-preview.png)

### Fullscreen Mode
![Fullscreen Mode](https://github.com/sergei-vasilev-dev/django-unfold-markdown/raw/main/docs/screenshots/editor-fullscreen.png)


### Editor inside tab and Dark theme
![Editor tab and dark theme](https://github.com/sergei-vasilev-dev/django-unfold-markdown/raw/main/docs/screenshots/editor-tab-dark-theme.png)


## Features

- **Plain text editor** with monospace font
- **Side-by-side preview** and fullscreen modes
- **Dark/light theme** integration with Unfold
- **Material Symbols icons** matching Unfold design
- **Toolbar**: bold, italic, strikethrough, headings, lists, links, images, tables, horizontal rules
- **Image upload**: upload images directly from the editor toolbar
- **No autosave** (saves on form submit)
- **Responsive** design

## Installation

```bash
pip install django-unfold-markdown
```

## Configuration

Add to your `INSTALLED_APPS`:

```python
# settings.py
INSTALLED_APPS = [
    "unfold",
    "unfold_markdown",  # Add this
    # ...
]
```

## Usage

### For all TextField fields

```python
# admin.py
from django.db import models
from unfold.admin import ModelAdmin
from unfold_markdown.widgets import MarkdownWidget

@admin.register(Article)
class ArticleAdmin(ModelAdmin):
    formfield_overrides = {
        models.TextField: {"widget": MarkdownWidget}
    }
```

### For specific fields

```python
from django import forms
from unfold_markdown.widgets import MarkdownWidget

class ArticleForm(forms.ModelForm):
    content = forms.CharField(widget=MarkdownWidget())

    class Meta:
        model = Article
        fields = '__all__'

@admin.register(Article)
class ArticleAdmin(ModelAdmin):
    form = ArticleForm
```

## Image Upload

By default, the image toolbar button prompts for a URL. To enable direct image uploads, configure an upload endpoint.

### Using the built-in upload view

1. Add the URL to your project:

```python
# urls.py
from django.urls import path, include

urlpatterns = [
    # ...
    path("unfold-markdown/", include("unfold_markdown.urls")),
]
```

2. Set the upload URL in settings:

```python
# settings.py
UNFOLD_MARKDOWN = {
    "image_upload_url": "/unfold-markdown/image-upload/",
}
```

The built-in view:
- Requires staff user authentication
- Accepts `png`, `jpg`, `jpeg`, `gif`, `webp`, `svg`, `bmp`, `ico`, `avif`
- Saves files using Django's default storage backend
- Returns `{"url": "..."}` as JSON

### Optional settings

```python
UNFOLD_MARKDOWN = {
    "image_upload_url": "/unfold-markdown/image-upload/",
    "image_upload_dir": "markdown-images",  # default: "markdown-images"
    "image_max_size": 10 * 1024 * 1024,     # default: 10MB
}
```

### Using a custom endpoint

You can point to any endpoint that accepts a `POST` with a `file` field in `multipart/form-data` and returns JSON with a `url` key:

```python
UNFOLD_MARKDOWN = {
    "image_upload_url": "/api/my-custom-upload/",
}
```

### Per-widget override

You can also set the upload URL per widget instance:

```python
class ArticleForm(forms.ModelForm):
    content = forms.CharField(
        widget=MarkdownWidget(upload_url="/api/my-upload/")
    )
```

## Storage and Rendering

The widget stores pure Markdown text in your database. To render Markdown as HTML, use a Python library:

```python
# Using markdown
from markdown import markdown
html = markdown(article.content)

# Using mistune
import mistune
html = mistune.html(article.content)
```

## Requirements

- Python >= 3.10
- Django >= 4.2
- django-unfold >= 0.70.0

## License

MIT License

## Repository

https://github.com/sergei-vasilev-dev/django-unfold-markdown

## Credits

- **EasyMDE**: [Ionaru/easy-markdown-editor](https://github.com/Ionaru/easy-markdown-editor) (MIT License)
- **Django Unfold**: [unfoldadmin/django-unfold](https://github.com/unfoldadmin/django-unfold) (MIT License)
