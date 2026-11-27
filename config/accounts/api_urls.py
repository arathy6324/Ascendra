from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .api_views import (
    CustomTokenObtainPairView,
    register_student,
    current_user,
    change_password,
    UserManagementViewSet,
    admin_analytics_summary,
)

router = DefaultRouter()
router.register(r"users", UserManagementViewSet, basename="user-management")

urlpatterns = [
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/register/", register_student, name="student_register"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", current_user, name="current_user"),
    path("auth/change-password/", change_password, name="change_password"),
    path("accounts/admin-summary/", admin_analytics_summary, name="admin_analytics_summary"),
    path("accounts/", include(router.urls)),
]
