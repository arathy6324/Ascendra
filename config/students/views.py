from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import StudentProfile, ProfessionalProfile
from .serializers import StudentProfileSerializer, ProfessionalProfileSerializer
from accounts.permissions import IsAdminUserRole, IsPlacementOfficerRole

User = get_user_model()


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = StudentProfile.objects.select_related("user", "professional_profile").prefetch_related("enrollments__batch__course")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            # Full institution access
            pass
        elif user.role == "TRAINER":
            # Students enrolled in batches taught by this trainer
            qs = qs.filter(enrollments__batch__trainer=user).distinct()
        elif user.role in ["STUDENT", "ALUMNI"]:
            # Only own profile
            qs = qs.filter(user=user)
        else:
            return StudentProfile.objects.none()

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param.upper())

        course_completed = self.request.query_params.get("course_completed")
        if course_completed is not None and course_completed != "":
            qs = qs.filter(course_completed=course_completed.lower() == "true")

        is_alumni_eligible = self.request.query_params.get("is_alumni_eligible")
        if is_alumni_eligible is not None and is_alumni_eligible != "":
            qs = qs.filter(is_alumni_eligible=is_alumni_eligible.lower() == "true")

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(college__icontains=search)
                | Q(course_name__icontains=search)
            )

        return qs.order_by("-created_at")

    @action(detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        try:
            profile = StudentProfile.objects.select_related("user", "professional_profile").get(user=user)
        except StudentProfile.DoesNotExist:
            if user.role in ["STUDENT", "ALUMNI"]:
                profile = StudentProfile.objects.create(user=user)
            else:
                return Response(
                    {"detail": "No student profile found for this user."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        if request.method == "PATCH":
            serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUserRole])
    def activate_alumni(self, request, pk=None):
        """
        ADMIN CONFIRMATION WORKFLOW:
        Converts a student to ALUMNI role while preserving all student records,
        academic history, enrollments, assessments and projects.
        """
        profile = self.get_object()
        user = profile.user

        notes = request.data.get("notes", "Alumni status activated by administrator.")
        profile.is_alumni_eligible = True
        profile.alumni_activated_at = timezone.now()
        profile.alumni_activated_by = request.user
        profile.save()

        # Update role on User model
        user.role = User.Role.ALUMNI
        user.save()

        # Ensure professional profile exists
        ProfessionalProfile.objects.get_or_create(student=profile)

        # Log activation
        from careers.models import AlumniActivationLog
        AlumniActivationLog.objects.create(
            student=profile,
            activated_by=request.user,
            notes=notes,
        )

        serializer = StudentProfileSerializer(profile)
        return Response({
            "detail": f"Alumni access activated successfully for {user.get_full_name() or user.username}.",
            "profile": serializer.data,
        })

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUserRole])
    def complete_course(self, request, pk=None):
        """
        Marks student as completed the course, distinct from placement status.
        Makes student eligible for alumni activation.
        """
        profile = self.get_object()
        profile.course_completed = True
        profile.course_completed_date = timezone.now().date()
        profile.is_alumni_eligible = True
        profile.save()

        # Also update enrollment record
        for enrollment in profile.enrollments.filter(is_active=True):
            enrollment.completed = True
            enrollment.completed_at = timezone.now().date()
            enrollment.save()

        serializer = StudentProfileSerializer(profile)
        return Response({
            "detail": "Course marked as completed. Student is now eligible for alumni activation.",
            "profile": serializer.data,
        })


class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfessionalProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            return ProfessionalProfile.objects.all()
        return ProfessionalProfile.objects.filter(student__user=user)

    def perform_create(self, serializer):
        user = self.request.user
        student_profile = user.student_profile
        serializer.save(student=student_profile)
