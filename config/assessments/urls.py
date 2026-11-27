from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AssessmentViewSet, QuestionViewSet, SubmissionViewSet

router = DefaultRouter()
router.register(r"assessments", AssessmentViewSet, basename="assessment")
router.register(r"questions", QuestionViewSet, basename="question")
router.register(r"submissions", SubmissionViewSet, basename="submission")

urlpatterns = [
    path("", include(router.urls)),
]
