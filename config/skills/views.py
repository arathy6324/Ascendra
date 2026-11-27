from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from .models import SkillCategory, Skill, StudentSkill, Certification
from .serializers import (
    SkillCategorySerializer,
    SkillSerializer,
    StudentSkillSerializer,
    CertificationSerializer,
)
from accounts.permissions import IsTrainerUserRole, IsAdminUserRole


class SkillCategoryViewSet(viewsets.ModelViewSet):
    queryset = SkillCategory.objects.all().order_by("name")
    serializer_class = SkillCategorySerializer
    permission_classes = [IsAuthenticated]


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.select_related("category").all().order_by("name")
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Skill.objects.select_related("category").all().order_by("name")
        category_id = self.request.query_params.get("category")
        search = self.request.query_params.get("search")

        if category_id:
            qs = qs.filter(category_id=category_id)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(category__name__icontains=search))
        return qs


class StudentSkillViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = StudentSkill.objects.select_related("student__user", "skill__category")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role == "TRAINER":
            pass
        elif user.role in ["STUDENT", "ALUMNI"]:
            qs = qs.filter(student__user=user)

        student_id = self.request.query_params.get("student")
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, "student_profile", None)
        if not student:
            from students.models import StudentProfile
            student, _ = StudentProfile.objects.get_or_create(user=user)
        serializer.save(student=student)

    @action(detail=True, methods=["post"], permission_classes=[IsTrainerUserRole])
    def verify_skill(self, request, pk=None):
        student_skill = self.get_object()
        student_skill.verified_by_trainer = True
        student_skill.save()
        return Response({"detail": f"Skill {student_skill.skill.name} verified successfully."})


class CertificationViewSet(viewsets.ModelViewSet):
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Certification.objects.select_related("student__user")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role == "TRAINER":
            pass
        elif user.role in ["STUDENT", "ALUMNI"]:
            qs = qs.filter(student__user=user)

        student_id = self.request.query_params.get("student")
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs.order_by("-issue_date")

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, "student_profile", None)
        if not student:
            from students.models import StudentProfile
            student, _ = StudentProfile.objects.get_or_create(user=user)
        serializer.save(student=student)
