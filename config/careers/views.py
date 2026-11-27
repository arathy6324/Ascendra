from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import CareerMilestone, AlumniEvent, Mentorship, AlumniActivationLog
from .serializers import (
    CareerMilestoneSerializer,
    AlumniEventSerializer,
    MentorshipSerializer,
    AlumniActivationLogSerializer,
)
from accounts.permissions import IsAlumniUserRole, IsAdminUserRole
from students.models import StudentProfile, ProfessionalProfile

User = get_user_model()


class CareerMilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = CareerMilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = CareerMilestone.objects.select_related("student__user")

        student_id = self.request.query_params.get("student")
        if student_id:
            qs = qs.filter(student_id=student_id)
        else:
            # Show all public milestones to the community
            qs = qs.filter(is_public=True)

        return qs.order_by("-date_achieved")

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, "student_profile", None)
        if not student:
            student, _ = StudentProfile.objects.get_or_create(user=user)
        serializer.save(student=student)


class AlumniEventViewSet(viewsets.ModelViewSet):
    serializer_class = AlumniEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = AlumniEvent.objects.select_related("created_by")

        if user.role != "ADMIN" and not user.is_superuser:
            qs = qs.filter(is_published=True)

        return qs.order_by("event_date")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MentorshipViewSet(viewsets.ModelViewSet):
    serializer_class = MentorshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Mentorship.objects.select_related("alumnus", "student__user")

        if user.role == "ALUMNI":
            qs = qs.filter(alumnus=user)
        elif user.role == "STUDENT":
            qs = qs.filter(student__user=user)
        elif user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, "student_profile", None)
        if not student:
            student, _ = StudentProfile.objects.get_or_create(user=user)
        mentorship = serializer.save(student=student)
        from common.models import Notification
        Notification.objects.create(
            recipient=mentorship.alumnus,
            title="New Mentorship Request",
            message=f"{user.get_full_name() or user.username} requested mentorship on '{mentorship.topic}'.",
            link="/alumni/mentorship",
        )

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        mentorship = self.get_object()
        new_status = request.data.get("status")
        meeting_schedule = request.data.get("meeting_schedule", "")
        notes = request.data.get("notes", "")

        if new_status in Mentorship.Status.values:
            mentorship.status = new_status
            if meeting_schedule:
                mentorship.meeting_schedule = meeting_schedule
            if notes:
                mentorship.notes = notes
            mentorship.save()
            return Response(MentorshipSerializer(mentorship).data)

        return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)


class AlumniActivationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AlumniActivationLog.objects.select_related("student__user", "activated_by").order_by("-activated_at")
    serializer_class = AlumniActivationLogSerializer
    permission_classes = [IsAdminUserRole]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def alumni_directory(request):
    """
    Searchable directory of alumni for networking and mentorship.
    """
    alumni_users = User.objects.filter(role=User.Role.ALUMNI, is_active=True).select_related(
        "student_profile__professional_profile"
    )

    search = request.query_params.get("search")
    if search:
        alumni_users = alumni_users.filter(
            Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(student_profile__professional_profile__current_company__icontains=search)
            | Q(student_profile__professional_profile__current_job_title__icontains=search)
            | Q(student_profile__college__icontains=search)
        )

    results = []
    for u in alumni_users:
        prof = getattr(getattr(u, "student_profile", None), "professional_profile", None)
        results.append({
            "user_id": u.id,
            "name": u.get_full_name() or u.username,
            "email": u.email,
            "graduation_year": getattr(getattr(u, "student_profile", None), "graduation_year", None),
            "college": getattr(getattr(u, "student_profile", None), "college", ""),
            "course_name": getattr(getattr(u, "student_profile", None), "course_name", ""),
            "current_company": prof.current_company if prof else "",
            "current_job_title": prof.current_job_title if prof else "",
            "years_of_experience": prof.years_of_experience if prof else 0,
            "industry": prof.industry if prof else "",
            "location": prof.location if prof else "",
            "linkedin_url": prof.linkedin_url if prof else (getattr(getattr(u, "student_profile", None), "linkedin_url", "")),
        })

    return Response(results)
