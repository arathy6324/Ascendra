from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone

from .models import Course, Batch, Enrollment, CourseModule, LearningMaterial, Attendance
from .serializers import (
    CourseSerializer,
    BatchSerializer,
    EnrollmentSerializer,
    CourseModuleSerializer,
    LearningMaterialSerializer,
    AttendanceSerializer,
)
from accounts.permissions import IsAdminUserRole, IsTrainerUserRole


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Course.objects.all().prefetch_related("modules__materials", "batches")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(code__icontains=search))
        return qs

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUserRole()]
        return [IsAuthenticated()]


class CourseModuleViewSet(viewsets.ModelViewSet):
    serializer_class = CourseModuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get("course")
        qs = CourseModule.objects.all().prefetch_related("materials")
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsTrainerUserRole()]
        return [IsAuthenticated()]


class LearningMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = LearningMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        module_id = self.request.query_params.get("module")
        qs = LearningMaterial.objects.all()
        if module_id:
            qs = qs.filter(module_id=module_id)
        return qs

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsTrainerUserRole()]
        return [IsAuthenticated()]


class BatchViewSet(viewsets.ModelViewSet):
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Batch.objects.select_related("course", "trainer").prefetch_related("enrollments")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role == "TRAINER":
            qs = qs.filter(trainer=user)
        elif user.role in ["STUDENT", "ALUMNI"]:
            qs = qs.filter(enrollments__student__user=user)

        course_id = self.request.query_params.get("course")
        if course_id:
            qs = qs.filter(course_id=course_id)

        return qs

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUserRole()]
        return [IsAuthenticated()]


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Enrollment.objects.select_related("student__user", "batch__course")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role == "TRAINER":
            qs = qs.filter(batch__trainer=user)
        elif user.role in ["STUDENT", "ALUMNI"]:
            qs = qs.filter(student__user=user)

        batch_id = self.request.query_params.get("batch")
        if batch_id:
            qs = qs.filter(batch_id=batch_id)

        student_id = self.request.query_params.get("student")
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsAdminUserRole()]
        return [IsAuthenticated()]


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Attendance.objects.select_related("student__user", "batch")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role == "TRAINER":
            qs = qs.filter(batch__trainer=user)
        elif user.role in ["STUDENT", "ALUMNI"]:
            qs = qs.filter(student__user=user)

        batch_id = self.request.query_params.get("batch")
        if batch_id:
            qs = qs.filter(batch_id=batch_id)

        date = self.request.query_params.get("date")
        if date:
            qs = qs.filter(date=date)

        return qs.order_by("-date")

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsTrainerUserRole()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        batch_id = request.data.get("batch")
        student_id = request.data.get("student")
        date = request.data.get("date")
        att_status = request.data.get("status", Attendance.Status.PRESENT)
        remarks = request.data.get("remarks", "")

        if batch_id and student_id and date:
            obj, created = Attendance.objects.update_or_create(
                batch_id=batch_id,
                student_id=student_id,
                date=date,
                defaults={"status": att_status, "remarks": remarks},
            )
            serializer = self.get_serializer(obj)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        return super().create(request, *args, **kwargs)


@api_view(["GET"])
@permission_classes([IsTrainerUserRole])
def trainer_dashboard_summary(request):
    """
    Returns trainer's academic dashboard metrics:
    - Assigned batches & courses
    - Total students under this trainer
    - Pending assessment evaluations
    - Recent submissions
    """
    from assessments.models import Assessment, Submission

    user = request.user
    batches = Batch.objects.filter(trainer=user)
    courses = Course.objects.filter(batches__trainer=user).distinct()
    enrollments = Enrollment.objects.filter(batch__trainer=user, is_active=True)
    total_students = enrollments.values("student").distinct().count()

    assessments = Assessment.objects.filter(created_by=user)
    pending_evaluations = Submission.objects.filter(
        assessment__created_by=user,
        status=Submission.Status.PENDING,
    ).count()

    return Response({
        "assigned_batches_count": batches.count(),
        "assigned_courses_count": courses.count(),
        "total_students": total_students,
        "pending_evaluations": pending_evaluations,
        "total_assessments_created": assessments.count(),
    })
