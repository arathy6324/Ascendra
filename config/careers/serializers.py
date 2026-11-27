from rest_framework import serializers
from .models import CareerMilestone, AlumniEvent, Mentorship, AlumniActivationLog
from accounts.serializers import UserSerializer


class CareerMilestoneSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")
    student_username = serializers.ReadOnlyField(source="student.user.username")

    class Meta:
        model = CareerMilestone
        fields = [
            "id",
            "student",
            "student_name",
            "student_username",
            "title",
            "company_name",
            "date_achieved",
            "description",
            "is_public",
            "created_at",
        ]
        read_only_fields = ["student", "created_at"]


class AlumniEventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source="created_by.get_full_name")

    class Meta:
        model = AlumniEvent
        fields = [
            "id",
            "title",
            "description",
            "event_date",
            "location_or_link",
            "event_type",
            "created_by",
            "created_by_name",
            "is_published",
            "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]


class MentorshipSerializer(serializers.ModelSerializer):
    alumnus_name = serializers.ReadOnlyField(source="alumnus.get_full_name")
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")

    class Meta:
        model = Mentorship
        fields = [
            "id",
            "alumnus",
            "alumnus_name",
            "student",
            "student_name",
            "topic",
            "status",
            "meeting_schedule",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["student", "created_at", "updated_at"]


class AlumniActivationLogSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")
    student_username = serializers.ReadOnlyField(source="student.user.username")
    activated_by_name = serializers.ReadOnlyField(source="activated_by.get_full_name")

    class Meta:
        model = AlumniActivationLog
        fields = [
            "id",
            "student",
            "student_name",
            "student_username",
            "activated_by",
            "activated_by_name",
            "activated_at",
            "notes",
        ]
