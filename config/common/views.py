from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets
from django.utils import timezone
from django.db import connection
from .models import Announcement, Notification
from .serializers import AnnouncementSerializer, NotificationSerializer
from accounts.permissions import IsAdminUserRole


@api_view(["GET"])
@permission_classes([AllowAny])
def api_status(request):
    db_status = "connected"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_status = f"error: {str(e)}"

    return Response({
        "status": "operational",
        "platform": "Ascendra — Intelligent Career Lifecycle Management Platform",
        "tagline": "Your career. Your next level.",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": timezone.now().isoformat(),
    })


class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Announcement.objects.none()
        if user.role == "ADMIN":
            return Announcement.objects.all().order_by("-created_at")
        return Announcement.objects.filter(
            is_active=True,
            target_role__in=["ALL", user.role]
        ).order_by("-created_at")

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUserRole()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Notification.objects.none()
        return Notification.objects.filter(recipient=user).order_by("-created_at")

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."})
