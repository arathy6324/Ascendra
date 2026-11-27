from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AnnouncementViewSet, NotificationViewSet, api_status

router = DefaultRouter()
router.register(r"announcements", AnnouncementViewSet, basename="announcement")
router.register(r"notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("status/", api_status, name="api_status"),
    path("", include(router.urls)),
]
