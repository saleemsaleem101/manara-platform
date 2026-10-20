"""
وحدة التحقق من صحة الملفات المرفوعة لمنصة منارة (FR-27 ومخطط الأصناف الشكل 3-10).
تتحقق من نوع الملف وحجمه وتوقيعه الرقمي (Magic Bytes) قبل الحفظ.
"""
from typing import Optional, Set, Tuple
from django.core.exceptions import ValidationError
from django.conf import settings


ALLOWED_VIDEO_TYPES: Set[str] = {
    "video/mp4",
    "video/avi",
    "video/quicktime",
    "video/x-matroska",
    "video/webm",
    "video/x-msvideo",
}

ALLOWED_IMAGE_TYPES: Set[str] = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

ALLOWED_DOCUMENT_TYPES: Set[str] = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def validate_file(
    file,
    max_size_mb: int = 50,
    allowed_content_types: Optional[Set[str]] = None,
    raise_exception: bool = False
) -> Tuple[bool, Optional[str]]:
    """
    دالة التحقق المستقلة من الملفات المرفوعة (+ validateFile في مخطط الأصناف و FR-27).
    
    :param file: كائن الملف (UploadedFile / FieldFile)
    :param max_size_mb: الحد الأقصى للحجم بالميجابايت (افتراضياً 50MB للفيديو، 5MB للصور)
    :param allowed_content_types: مجموعة أنواع MIME المسموح بها
    :param raise_exception: إذا كانت True ترفع ValidationError، وإلا ترجع (is_valid, error_msg)
    :return: (is_valid: bool, error_message: Optional[str])
    """
    if not file:
        err = "لم يتم تحديد أي ملف."
        if raise_exception:
            raise ValidationError(err)
        return False, err

    # 1. التحقق من الحجم
    max_bytes = max_size_mb * 1024 * 1024
    file_size = getattr(file, 'size', 0)
    if file_size > max_bytes:
        err = f"حجم الملف ({file_size // (1024 * 1024)} MB) يتجاوز الحد الأقصى المسموح به ({max_size_mb} MB)."
        if raise_exception:
            raise ValidationError(err)
        return False, err

    # 2. التحقق من نوع المحتوى (Content Type)
    content_type = getattr(file, 'content_type', '') or ''
    if allowed_content_types:
        if not content_type:
            err = "نوع المحتوى (Content-Type) للملف غير محدد أو فارغ."
            if raise_exception:
                raise ValidationError(err)
            return False, err
        if content_type not in allowed_content_types:
            err = f"نوع الملف غير مدعوم ({content_type}). الأنواع المسموح بها: {', '.join(allowed_content_types)}."
            if raise_exception:
                raise ValidationError(err)
            return False, err

    # 3. التحقق الصارم من التوقيع الرقمي (Magic Bytes) بدون أي تجاوز (FR-27 / NFR-01)
    if hasattr(file, 'read') and hasattr(file, 'seek'):
        try:
            file_bytes = file.read(64)
            file.seek(0)

            if len(file_bytes) == 0:
                err = "الملف فارغ ولا يحتوي على أي بيانات."
                if raise_exception:
                    raise ValidationError(err)
                return False, err

            # فحص التوقيع الرقمي حسب نوع المحتوى (Content-Type)
            if content_type in ALLOWED_VIDEO_TYPES or (not content_type and any(t in ALLOWED_VIDEO_TYPES for t in (allowed_content_types or []))):
                is_valid_video = (
                    b"ftyp" in file_bytes[:32]  # MP4 / MOV
                    or file_bytes.startswith(b"\x1a\x45\xdf\xa3")  # WebM / MKV
                    or (file_bytes.startswith(b"RIFF") and b"AVI " in file_bytes[:16])  # AVI
                )
                if not is_valid_video:
                    err = "محتوى وتوقيع الملف الرقمي لا يطابق صيغة فيديو صالحة (MP4, WebM, MKV, AVI)."
                    if raise_exception:
                        raise ValidationError(err)
                    return False, err

            elif content_type in ALLOWED_IMAGE_TYPES or (not content_type and any(t in ALLOWED_IMAGE_TYPES for t in (allowed_content_types or []))):
                is_valid_image = (
                    file_bytes.startswith(b"\xff\xd8\xff")  # JPEG
                    or file_bytes.startswith(b"\x89PNG\r\n\x1a\n")  # PNG
                    or (file_bytes.startswith(b"RIFF") and b"WEBP" in file_bytes[:16])  # WebP
                    or file_bytes.startswith(b"GIF87a") or file_bytes.startswith(b"GIF89a")  # GIF
                )
                if not is_valid_image:
                    err = "محتوى وتوقيع الملف الرقمي لا يطابق صيغة صورة صالحة (PNG, JPG, WEBP, GIF)."
                    if raise_exception:
                        raise ValidationError(err)
                    return False, err

            elif content_type in ALLOWED_DOCUMENT_TYPES or (not content_type and any(t in ALLOWED_DOCUMENT_TYPES for t in (allowed_content_types or []))):
                is_valid_doc = (
                    file_bytes.startswith(b"%PDF")  # PDF
                    or file_bytes.startswith(b"PK\x03\x04")  # DOCX (ZIP container)
                    or file_bytes.startswith(b"\xd0\xcf\x11\xe0")  # DOC (OLE2 compound)
                )
                if not is_valid_doc:
                    err = "محتوى وتوقيع الملف الرقمي لا يطابق صيغة مستند صالح (PDF, DOC, DOCX)."
                    if raise_exception:
                        raise ValidationError(err)
                    return False, err
        except ValidationError:
            raise
        except Exception:
            err = "تعذر قراءة الملف والتحقق من سلامته الرقمية."
            if raise_exception:
                raise ValidationError(err)
            return False, err

    return True, None


def validateFile(file, max_size_mb: int = 50, allowed_content_types: Optional[Set[str]] = None) -> Tuple[bool, Optional[str]]:
    """دالة مطابقة تماماً للاسم الوارد في مخطط الأصناف (Class Diagram: validateFile)."""
    return validate_file(file, max_size_mb=max_size_mb, allowed_content_types=allowed_content_types)
