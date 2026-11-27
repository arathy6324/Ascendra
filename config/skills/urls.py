from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    SkillCategoryViewSet,
    SkillViewSet,
    StudentSkillViewSet,
    CertificationViewSet,
)

router = DefaultRouter()
router.register(r"categories", SkillCategoryViewSet, basename="skill-category")
router.register(r"items", SkillViewSet, basename="skill-item")
router.register(r"student-skills", StudentSkillViewSet, basename="student-skill")
router.register(r"certifications", CertificationViewSet, basename="certification")

urlpatterns = [
    path("", include(router.urls)),
]
