from typing import Any, Optional

from django.conf import settings
from django.forms import Widget


def get_markdown_setting(key: str, default: Any = None) -> Any:
    config = getattr(settings, "UNFOLD_MARKDOWN", {})
    return config.get(key, default)


class MarkdownWidget(Widget):
    template_name = "unfold_markdown/markdown.html"

    class Media:
        css = {
            "all": (
                "unfold_markdown/css/easymde.min.css",
                "unfold_markdown/css/markdown.css",
            )
        }
        js = (
            "unfold_markdown/js/easymde.min.js",
            "unfold_markdown/js/markdown.config.js",
        )

    def __init__(
        self, attrs: Optional[dict[str, Any]] = None, upload_url: Optional[str] = None
    ) -> None:
        super().__init__(attrs)
        self.upload_url = upload_url

    def get_context(self, name: str, value: Any, attrs: Any) -> dict[str, Any]:
        context = super().get_context(name, value, attrs)
        upload_url = self.upload_url or get_markdown_setting("image_upload_url")
        if upload_url:
            context["image_upload_url"] = upload_url
        return context
