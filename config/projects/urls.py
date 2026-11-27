from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectAttachmentViewSet

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"attachments", ProjectAttachmentViewSet, basename="project-attachment")

urlpatterns = [
    path("", include(router.urls)),
]
