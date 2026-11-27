from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    BatchViewSet,
    EnrollmentViewSet,
    CourseModuleViewSet,
    LearningMaterialViewSet,
    AttendanceViewSet,
    trainer_dashboard_summary,
)

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"batches", BatchViewSet, basename="batch")
router.register(r"enrollments", EnrollmentViewSet, basename="enrollment")
router.register(r"modules", CourseModuleViewSet, basename="course-module")
router.register(r"materials", LearningMaterialViewSet, basename="learning-material")
router.register(r"attendance", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("trainer-summary/", trainer_dashboard_summary, name="trainer_dashboard_summary"),
    path("", include(router.urls)),
]
