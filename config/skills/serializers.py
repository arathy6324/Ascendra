from rest_framework import serializers
from .models import SkillCategory, Skill, StudentSkill, Certification


class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ["id", "name", "description"]


class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.name")

    class Meta:
        model = Skill
        fields = ["id", "category", "category_name", "name", "description"]


class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.ReadOnlyField(source="skill.name")
    category_name = serializers.ReadOnlyField(source="skill.category.name")
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")

    class Meta:
        model = StudentSkill
        fields = [
            "id",
            "student",
            "student_name",
            "skill",
            "skill_name",
            "category_name",
            "proficiency_level",
            "verified_by_trainer",
            "created_at",
        ]
        read_only_fields = ["student", "created_at"]


class CertificationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")

    class Meta:
        model = Certification
        fields = [
            "id",
            "student",
            "student_name",
            "title",
            "issuing_organization",
            "issue_date",
            "expiration_date",
            "credential_id",
            "credential_url",
            "certificate_file",
            "created_at",
        ]
        read_only_fields = ["student", "created_at"]
