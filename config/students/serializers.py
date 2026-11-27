from rest_framework import serializers
from .models import StudentProfile, ProfessionalProfile
from accounts.serializers import UserSerializer


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalProfile
        fields = [
            "id",
            "student",
            "current_company",
            "current_job_title",
            "years_of_experience",
            "target_role",
            "career_goal",
            "industry",
            "location",
            "skills_summary",
            "linkedin_url",
            "updated_at",
        ]
        read_only_fields = ["student"]


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    professional_profile = ProfessionalProfileSerializer(read_only=True)
    active_batch_name = serializers.SerializerMethodField()
    enrolled_courses = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "user_id",
            "phone",
            "college",
            "qualification",
            "graduation_year",
            "course_name",
            "career_goal",
            "status",
            "course_completed",
            "course_completed_date",
            "is_alumni_eligible",
            "alumni_activated_at",
            "alumni_activated_by",
            "resume",
            "github_url",
            "linkedin_url",
            "portfolio_url",
            "professional_profile",
            "active_batch_name",
            "enrolled_courses",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "alumni_activated_at",
            "alumni_activated_by",
            "created_at",
            "updated_at",
        ]

    def get_active_batch_name(self, obj):
        active_enrollment = obj.enrollments.filter(is_active=True).first()
        if active_enrollment and active_enrollment.batch:
            return active_enrollment.batch.name
        return None

    def get_enrolled_courses(self, obj):
        return [
            {
                "enrollment_id": e.id,
                "course_id": e.batch.course.id,
                "course_name": e.batch.course.name,
                "batch_id": e.batch.id,
                "batch_name": e.batch.name,
                "trainer_name": e.batch.trainer.get_full_name() if e.batch.trainer else "Not Assigned",
                "is_active": e.is_active,
                "completed": e.completed,
                "enrolled_at": e.enrolled_at,
            }
            for e in obj.enrollments.select_related("batch", "batch__course", "batch__trainer").all()
        ]
