from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer, UserSerializer
from .models import User


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
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "token": token.key,
                    "otp_code": otp_code,
                    "message": f"تم إنشاء حساب الخريج بنجاح. رمز التفعيل: {otp_code}",
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
    يتحقق بدقة من الرمز الرقمي المشفر والمخصص للمستخدم (OTP Code) دون قبول رموز عشوائية.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        code = str(request.data.get("code") or request.data.get("token") or "").strip()
        email = request.data.get("email", "").strip()

        # التحقق من وجود مستخدم محدد
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
                    "message": "البريد الإلكتروني مؤكد بالفعل.",
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
