from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Count, Q

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserCreateSerializer,
    ChangePasswordSerializer,
    StudentRegisterSerializer,
)
from .permissions import IsAdminUserRole

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register_student(request):
    serializer = StudentRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    if request.method == "PATCH":
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"old_password": ["Wrong password."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password updated successfully."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    permission_classes = [IsAdminUserRole]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        qs = User.objects.all().order_by("-date_joined")
        role = self.request.query_params.get("role")
        search = self.request.query_params.get("search")
        is_active = self.request.query_params.get("is_active")

        if role:
            qs = qs.filter(role=role.upper())
        if is_active is not None and is_active != "":
            qs = qs.filter(is_active=is_active.lower() == "true")
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )
        return qs


@api_view(["GET"])
@permission_classes([IsAdminUserRole])
def admin_analytics_summary(request):
    """
    Returns platform-wide metrics for the Admin Dashboard:
    - Total students, active students, trainers, courses, batches
    - Placement-ready students, students placed, not placed
    - Total alumni
    - Course-wise distribution
    """
    from students.models import StudentProfile
    from academics.models import Course, Batch

    total_students = StudentProfile.objects.count()
    active_students = StudentProfile.objects.filter(user__is_active=True).count()
    placement_ready = StudentProfile.objects.filter(status=StudentProfile.Status.PLACEMENT_READY).count()
    placed_students = StudentProfile.objects.filter(status=StudentProfile.Status.PLACED).count()
    not_placed_students = StudentProfile.objects.filter(status=StudentProfile.Status.NOT_PLACED).count()
    learning_students = StudentProfile.objects.filter(status=StudentProfile.Status.LEARNING).count()

    total_trainers = User.objects.filter(role=User.Role.TRAINER).count()
    total_alumni = User.objects.filter(role=User.Role.ALUMNI).count()
    total_placement_officers = User.objects.filter(role=User.Role.PLACEMENT).count()

    active_courses = Course.objects.filter(is_active=True).count()
    total_courses = Course.objects.count()
    total_batches = Batch.objects.count()

    # Course-wise student enrollment distribution
    courses_data = []
    for c in Course.objects.all():
        student_count = StudentProfile.objects.filter(enrollments__batch__course=c).distinct().count()
        courses_data.append({
            "id": c.id,
            "name": c.name,
            "student_count": student_count,
        })

    return Response({
        "metrics": {
            "total_students": total_students,
            "active_students": active_students,
            "total_trainers": total_trainers,
            "total_alumni": total_alumni,
            "total_placement_officers": total_placement_officers,
            "active_courses": active_courses,
            "total_courses": total_courses,
            "total_batches": total_batches,
            "placement_ready": placement_ready,
            "placed_students": placed_students,
            "not_placed_students": not_placed_students,
            "learning_students": learning_students,
        },
        "courses_distribution": courses_data,
        "placement_rate": (
            round((placed_students / (placed_students + not_placed_students)) * 100, 1)
            if (placed_students + not_placed_students) > 0 else 0
        )
    })
