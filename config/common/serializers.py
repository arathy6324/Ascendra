from rest_framework import serializers
from .models import Announcement, Notification


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source="created_by.get_full_name")
    created_by_username = serializers.ReadOnlyField(source="created_by.username")

    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "content",
            "target_role",
            "created_by",
            "created_by_name",
            "created_by_username",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "title",
            "message",
            "link",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["recipient", "created_at"]
