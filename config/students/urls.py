from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import StudentProfileViewSet, ProfessionalProfileViewSet

router = DefaultRouter()
router.register(r"profiles", StudentProfileViewSet, basename="student-profile")
router.register(r"professionals", ProfessionalProfileViewSet, basename="professional-profile")

urlpatterns = [
    path("", include(router.urls)),
]
