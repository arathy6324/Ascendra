from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    CareerMilestoneViewSet,
    AlumniEventViewSet,
    MentorshipViewSet,
    AlumniActivationLogViewSet,
    alumni_directory,
)

router = DefaultRouter()
router.register(r"milestones", CareerMilestoneViewSet, basename="career-milestone")
router.register(r"events", AlumniEventViewSet, basename="alumni-event")
router.register(r"mentorship", MentorshipViewSet, basename="mentorship")
router.register(r"activation-logs", AlumniActivationLogViewSet, basename="activation-log")

urlpatterns = [
    path("directory/", alumni_directory, name="alumni_directory"),
    path("", include(router.urls)),
]
