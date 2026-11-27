from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet,
    JobVacancyViewSet,
    JobApplicationViewSet,
    InterviewViewSet,
    PlacementRecordViewSet,
    placement_analytics_summary,
)

router = DefaultRouter()
router.register(r"companies", CompanyViewSet, basename="company")
router.register(r"vacancies", JobVacancyViewSet, basename="vacancy")
router.register(r"applications", JobApplicationViewSet, basename="application")
router.register(r"interviews", InterviewViewSet, basename="interview")
router.register(r"records", PlacementRecordViewSet, basename="placement-record")

urlpatterns = [
    path("summary/", placement_analytics_summary, name="placement_summary"),
    path("", include(router.urls)),
]
