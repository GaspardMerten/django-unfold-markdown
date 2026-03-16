import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .widgets import get_markdown_setting

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "avif"}


@require_POST
def image_upload(request):
    if not request.user or not request.user.is_staff:
        return JsonResponse({"error": "Forbidden"}, status=403)

    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "No file provided"}, status=400)

    ext = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else ""
    if ext not in ALLOWED_EXTENSIONS:
        return JsonResponse(
            {"error": f"File type not allowed. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"},
            status=400,
        )

    max_size = get_markdown_setting("image_max_size", 10 * 1024 * 1024)
    if file.size > max_size:
        return JsonResponse(
            {"error": f"File too large. Maximum size: {max_size // (1024 * 1024)}MB"},
            status=400,
        )

    upload_dir = get_markdown_setting("image_upload_dir", "markdown-images")
    filename = f"{uuid.uuid4().hex}.{ext}"
    path = default_storage.save(f"{upload_dir}/{filename}", file)
    url = default_storage.url(path)

    return JsonResponse({"url": url})
