import logging
from typing import Any
from urllib.parse import quote, unquote

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle

from .models import User
from .serializers import UserRegistrationSerializer, UserSerializer

logger = logging.getLogger(__name__)


def send_verification_email(user: User, otp: str, is_resend: bool = False) -> None:
    """
    إرسال رسالة التفعيل والتحقق إلى البريد الإلكتروني بقالب HTML منسق (FR-26).
    تجمع بين رابط التفعيل الخارجي المباشر (External Link)
    ورمز التحقق الرقمي OTP (6 أرقام) لضمان سهولة الاستخدام وتوافق جميع المتطلبات.
    """
    frontend_url = getattr(settings, "FRONTEND_URL", "https://manarah-platform.vercel.app").rstrip("/")
    if ("localhost" in frontend_url or "127.0.0.1" in frontend_url) and not settings.DEBUG:
        frontend_url = "https://manarah-platform.vercel.app"
    verify_link = f"{frontend_url}/verify-email?email={user.email}&code={otp}"
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "منصة منارة <jalalmatluq@gmail.com>")

    subject = (
        "منصة منارة - رابط تفعيل الحساب ورمز التحقق"
        if not is_resend
        else "منصة منارة - رمز ورابط تفعيل الحساب الجديد"
    )

    msg_plain = (
        f"مرحباً {user.name}،\n\n"
        f"شكراً لانضمامك إلى منصة منارة لربط الخريجين بسوق العمل.\n\n"
        f"رابط التفعيل الخارجي المباشر:\n{verify_link}\n\n"
        f"رمز التحقق الرقمي (OTP) المكون من 6 أرقام:\n[{otp}]\n\n"
        f"صلاحية هذا الرابط والرمز: 10 دقائق فقط.\n\n"
        "منصة منارة لربط الخريجين بسوق العمل"
    )

    msg_html = f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; direction: rtl; text-align: right; }}
    .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }}
    .header {{ background: #0F1E36; color: #ffffff; padding: 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: bold; color: #ffffff; }}
    .header p {{ margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }}
    .content {{ padding: 32px 24px; }}
    .greeting {{ font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #0F1E36; }}
    .desc {{ font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 20px; }}
    .btn-box {{ text-align: center; margin: 26px 0; }}
    .btn {{ display: inline-block; background-color: #0F1E36; color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 10px rgba(15, 30, 54, 0.25); }}
    .code-box {{ background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; margin: 22px 0; }}
    .code-title {{ font-size: 12px; color: #64748b; margin-bottom: 6px; font-weight: 600; }}
    .code-val {{ font-family: monospace; font-size: 30px; font-weight: 900; letter-spacing: 6px; color: #0F1E36; }}
    .link-backup {{ font-size: 12px; color: #64748b; word-break: break-all; margin-top: 18px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }}
    .footer {{ background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>منصة منارة لربط الخريجين بسوق العمل</h1>
      <p>تفعيل الحساب الأكاديمي والتحقق من الهوية</p>
    </div>
    <div class="content">
      <div class="greeting">مرحباً {user.name}،</div>
      <div class="desc">
        يسعدنا انضمامك إلى منصة منارة. يمكنك تفعيل حسابك مباشرة بنقرة واحدة عبر الرابط الخارجي التالي:
      </div>

      <div class="btn-box">
        <a href="{verify_link}" target="_blank" class="btn">تفعيل الحساب الآن ➔</a>
      </div>

      <div class="code-box">
        <div class="code-title">أو يمكنك إدخال رمز التحقق الرقمي التالي في شاشة التفعيل:</div>
        <div class="code-val">{otp}</div>
      </div>

      <div class="desc" style="font-size: 12px; color: #64748b;">
        ⏱️ تنويه: رابط التفعيل ورمز التحقق صالحان لمدة <strong>10 دقائق</strong> فقط.
      </div>

      <div class="link-backup">
        إذا لم يعمل الزر، يمكنك نسخ رابط التفعيل الخارجي التالي وفتحه في المتصفح:<br>
        <a href="{verify_link}" style="color: #2563eb; text-decoration: underline;">{verify_link}</a>
      </div>
    </div>
    <div class="footer">
      هذه رسالة آلية تم إنشاؤها عبر منصة منارة. إذا لم تكن صاحب هذا الطلب، يمكنك تجاهلها.
    </div>
  </div>
</body>
</html>"""

    try:
        send_mail(
            subject=subject,
            message=msg_plain,
            from_email=from_email,
            recipient_list=[user.email],
            html_message=msg_html,
            fail_silently=False,
        )
    except Exception as mail_err:
        logger.warning("SMTP Error while sending verification email to %s: %s", user.email, mail_err)

    if settings.DEBUG:
        print(
            f"\n=======================================================\n"
            f"📧 [MANARAH EMAIL DEV] Recipient: {user.email}\n"
            f"🔑 OTP Code: {otp}\n"
            f"🔗 Verification Link: {verify_link}\n"
            f"=======================================================\n"
        )


class RegisterView(APIView):
    """
    إنشاء حساب خريج جديد (Sprint 1 - US-01 / MNRA-12 / MNRA-46).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            otp_code = user.get_verification_code()

            try:
                send_verification_email(user, otp_code, is_resend=False)
            except Exception as mail_err:
                logger.warning("Failed to send verification email: %s", mail_err)

            return Response(
                {
                    "user": UserSerializer(user).data,
                    "token": token.key,
                    "message": "تم إنشاء حساب الخريج بنجاح. تم إرسال رمز التحقق إلى بريدك الإلكتروني.",
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    تسجيل الدخول وإصدار التوكن (Sprint 1 - US-01 / MNRA-14 / MNRA-51).
    يشترط تأكيد البريد الإلكتروني (FR-26).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")

        if not email or not password:
            return Response(
                {"error": "يرجى إدخال البريد الإلكتروني وكلمة المرور."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=email, password=password)
        if user:
            if not user.email_verified:
                return Response(
                    {
                        "error": "يرجى تأكيد بريدك الإلكتروني أولاً لتفعيل الحساب.",
                        "email_verified": False,
                        "email": user.email,
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "token": token.key,
                    "message": "تم تسجيل الدخول بنجاح",
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"error": "بيانات الاعتماد غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور."},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class LogoutView(APIView):
    """
    تسجيل الخروج وإبطال جلسة المستخدم في الخلفية (Sprint 1 - US-01 / MNRA-15 / MNRA-57 / MNRA-60).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if hasattr(request.user, "auth_token") and request.user.auth_token:
            request.user.auth_token.delete()
        return Response(
            {"message": "تم تسجيل الخروج بنجاح وإبطال الجلسة."},
            status=status.HTTP_200_OK,
        )


class VerifyEmailView(APIView):
    """
    تأكيد البريد الإلكتروني (Sprint 1 - US-01 / FR-26).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        code = str(request.data.get("code") or request.data.get("otp") or request.data.get("token") or "").strip()
        email = request.data.get("email", "").strip()

        user = None
        if email:
            user = User.objects.filter(email=email).first()
        elif request.user and request.user.is_authenticated:
            user = request.user
        else:
            return Response(
                {"error": "يرجى تزويد البريد الإلكتروني للحساب المراد تأكيده."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user:
            return Response(
                {"error": "لم يتم العثور على أي حساب مسجل بهذا البريد الإلكتروني."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.email_verified:
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "البريد الإلكتروني مؤكد بالفعل وحسابك مفعل.",
                    "email_verified": True,
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )

        expected_code = user.get_verification_code()
        if code and code == expected_code:
            user.verify_email()
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "تم تأكيد البريد الإلكتروني وتفعيل الحساب بنجاح.",
                    "email_verified": True,
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"error": "رمز التحقق المدخل غير صحيح. يرجى إدخال الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class OTPRateThrottle(AnonRateThrottle):
    """تقييد طلبات رمز التحقق OTP إلى 5 طلبات في الساعة لحماية خادم البريد ومنع الإغراق."""
    rate = '5/hour'
    scope = 'otp'


class ResendOTPView(APIView):
    """
    إعادة توليد وإرسال رمز التحقق الرقمي OTP إلى البريد (FR-26 / NFR-01).
    محدد بمعدل أقصى 5 طلبات في الساعة (Anti-Spam Throttling).
    """
    permission_classes = [AllowAny]
    throttle_classes = [OTPRateThrottle]

    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        if not email:
            return Response(
                {"error": "يرجى إدخال البريد الإلكتروني لإعادة إرسال الرمز."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()
        generic_msg = "إذا كان البريد الإلكتروني مسجلاً، فقد تم إرسال رمز تحقق جديد إلى بريدك."
        if not user:
            return Response(
                {"message": generic_msg, "email": email},
                status=status.HTTP_200_OK,
            )

        if user.email_verified:
            return Response(
                {
                    "message": "البريد الإلكتروني مؤكد بالفعل وحسابك مفعل.",
                    "email_verified": True,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp = user.get_verification_code()
        try:
            send_verification_email(user, otp, is_resend=True)
        except Exception as mail_err:
            logger.warning("Failed to resend verification email: %s", mail_err)

        resp_data = {
            "message": generic_msg,
            "email": user.email,
        }
        return Response(resp_data, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """
    طلب استعادة كلمة المرور عند نسيانها (FR-25).
    يُرسل رابط مشفر ومؤقت لمرة واحدة (TimestampSigner) مربوط بـ password hash إلى البريد المسجل.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        if not email:
            return Response(
                {"error": "يرجى إدخال البريد الإلكتروني المسجل."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()
        if user:
            signer = TimestampSigner(salt="password-reset-salt")
            pw_hash = user.password[:16]
            token = signer.sign(f"{user.id}:{user.email}:{pw_hash}")

            # قراءة رابط الواجهة الأمامية ديناميكياً من الطلب (Origin أو Referer) أو من الإعدادات
            origin = request.headers.get("Origin") or request.headers.get("Referer")
            if origin:
                from urllib.parse import urlparse
                parsed = urlparse(origin)
                frontend_url = f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
            else:
                frontend_url = getattr(settings, "FRONTEND_URL", "https://manarah-platform.vercel.app").rstrip("/")

            if ("localhost" in frontend_url or "127.0.0.1" in frontend_url) and not settings.DEBUG:
                frontend_url = "https://manarah-platform.vercel.app"

            reset_url = f"{frontend_url}/password-reset?token={quote(token)}"
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "منصة منارة <noreply@manara.edu.ye>")

            msg_body = (
                f"مرحباً {user.name}،\n\n"
                f"لقد طلبت استعادة كلمة المرور لحسابك في منصة منارة.\n"
                f"يمكنك تعيين كلمة مرور جديدة من خلال الرابط التالي:\n{reset_url}\n\n"
                "إذا لم تطلب هذا التغيير، يرجى تجاهل هذه الرسالة."
            )

            html_reset = f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; direction: rtl; text-align: right; }}
    .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }}
    .header {{ background: #0F1E36; color: #ffffff; padding: 24px; text-align: center; }}
    .content {{ padding: 32px 24px; }}
    .btn-box {{ text-align: center; margin: 26px 0; }}
    .btn {{ display: inline-block; background-color: #0F1E36; color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: bold; font-size: 15px; }}
    .footer {{ background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px; color: #fff;">منصة منارة - استعادة كلمة المرور</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; font-weight: bold; color: #0F1E36;">مرحباً {user.name}،</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        لقد تلقينا طلباً لتعيين كلمة مرور جديدة لحسابك في منصة منارة. يمكنك النقر على الزر التالي للمتابعة:
      </p>
      <div class="btn-box">
        <a href="{reset_url}" target="_blank" class="btn">إعادة تعيين كلمة المرور ➔</a>
      </div>
      <p style="font-size: 12px; color: #64748b;">
        رابط مباشر:<br>
        <a href="{reset_url}" style="color: #2563eb;">{reset_url}</a>
      </p>
    </div>
    <div class="footer">
      إذا لم تطلب استعادة كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.
    </div>
  </div>
</body>
</html>"""

            try:
                send_mail(
                    subject="استعادة كلمة المرور - منصة منارة",
                    message=msg_body,
                    from_email=from_email,
                    recipient_list=[user.email],
                    html_message=html_reset,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error("Failed to send reset email to %s: %s", user.email, e, exc_info=True)

            if settings.DEBUG:
                print(
                    f"\n=======================================================\n"
                    f"🔑 [PASSWORD RESET DEV] User: {user.email}\n"
                    f"🔗 Reset URL: {reset_url}\n"
                    f"=======================================================\n"
                )

        return Response(
            {
                "message": "إذا كان البريد الإلكتروني مسجلاً لدينا، فقد تم إرسال رابط استعادة كلمة المرور إليه بنجاح."
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    تأكيد وتعيين كلمة المرور الجديدة بعد التحقق من الرمز المشفر (FR-25).
    الرمز مخصص لمرة واحدة ومحدد الصلاحية بساعة واحدة (max_age=3600).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.data.get("token") or request.data.get("code")
        raw_password = request.data.get("new_password") or request.data.get("password")
        token = str(raw_token or "").strip()
        try:
            token = unquote(token)
        except Exception:
            pass
        new_password = str(raw_password or "")

        if not token or not new_password:
            return Response(
                {"error": "يرجى تزويد رمز الاستعادة وكلمة المرور الجديدة."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        signer = TimestampSigner(salt="password-reset-salt")
        try:
            value = signer.unsign(token, max_age=86400)
            parts = value.split(":")
            if len(parts) == 3:
                user_id, email, pw_hash = parts
            elif len(parts) == 2:
                user_id, email = parts
                pw_hash = None
            else:
                raise BadSignature()

            user = User.objects.filter(id=user_id, email=email).first()
            if not user:
                raise BadSignature()

            # التحقق من أن التوكن لم يُستخدم مسبقاً (ربط بـ password hash الحالي)
            if pw_hash and user.password[:16] != pw_hash:
                raise BadSignature()
        except SignatureExpired:
            return Response(
                {"error": "انتهت صلاحية رابط استعادة كلمة المرور. يرجى طلب رابط جديد."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except (BadSignature, ValueError, Exception):
            return Response(
                {"error": "رمز استعادة كلمة المرور غير صالح أو تم استخدامه مسبقاً."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            django_validate_password(new_password, user=user)
        except DjangoValidationError as val_err:
            return Response(
                {"error": " • ".join(val_err.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        # إبطال جميع جلسات وتوكنات المستخدم القديمة فور تغيير كلمة المرور
        Token.objects.filter(user=user).delete()

        return Response(
            {
                "message": "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
            },
            status=status.HTTP_200_OK,
        )
