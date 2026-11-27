from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from .models import Project, ProjectTechnology, ProjectAttachment, ProjectReview
from .serializers import (
    ProjectSerializer,
    ProjectAttachmentSerializer,
    ProjectReviewSerializer,
)
from accounts.permissions import IsTrainerUserRole, IsAdminUserRole


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.select_related("student__user").prefetch_related("technologies", "attachments", "reviews__reviewer")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role == "TRAINER":
            pass
        elif user.role in ["STUDENT", "ALUMNI"]:
            # Students can see their own projects, or view all completed/public projects for inspiration
            pass

        student_id = self.request.query_params.get("student")
        if student_id:
            qs = qs.filter(student_id=student_id)

        featured = self.request.query_params.get("featured")
        if featured is not None:
            qs = qs.filter(is_featured=featured.lower() == "true")

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(technologies__name__icontains=search)
            ).distinct()

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, "student_profile", None)
        if not student:
            from students.models import StudentProfile
            student, _ = StudentProfile.objects.get_or_create(user=user)
        serializer.save(student=student)

    @action(detail=True, methods=["post"], permission_classes=[IsTrainerUserRole])
    def review(self, request, pk=None):
        project = self.get_object()
        rating = request.data.get("rating", 5)
        feedback = request.data.get("feedback", "")

        review, _ = ProjectReview.objects.update_or_create(
            project=project,
            reviewer=request.user,
            defaults={
                "rating": rating,
                "feedback": feedback,
            }
        )
        serializer = ProjectReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectAttachmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get("project")
        qs = ProjectAttachment.objects.all()
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs
