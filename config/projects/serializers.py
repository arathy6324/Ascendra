from rest_framework import serializers
from .models import Project, ProjectTechnology, ProjectAttachment, ProjectReview


class ProjectTechnologySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTechnology
        fields = ["id", "name"]


class ProjectAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAttachment
        fields = ["id", "title", "file", "file_type", "uploaded_at"]


class ProjectReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.ReadOnlyField(source="reviewer.get_full_name")

    class Meta:
        model = ProjectReview
        fields = ["id", "reviewer", "reviewer_name", "rating", "feedback", "reviewed_at"]
        read_only_fields = ["reviewer", "reviewed_at"]


class ProjectSerializer(serializers.ModelSerializer):
    technologies = ProjectTechnologySerializer(many=True, read_only=True)
    tech_names = serializers.ListField(
        child=serializers.CharField(max_length=100),
        write_only=True,
        required=False,
    )
    attachments = ProjectAttachmentSerializer(many=True, read_only=True)
    reviews = ProjectReviewSerializer(many=True, read_only=True)
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")
    student_id = serializers.ReadOnlyField(source="student.id")
    student_college = serializers.ReadOnlyField(source="student.college")
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "student",
            "student_id",
            "student_name",
            "student_college",
            "title",
            "tagline",
            "description",
            "github_url",
            "live_url",
            "completion_date",
            "is_featured",
            "status",
            "technologies",
            "tech_names",
            "attachments",
            "reviews",
            "average_rating",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["student", "created_at", "updated_at"]

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def create(self, validated_data):
        tech_names = validated_data.pop("tech_names", [])
        project = Project.objects.create(**validated_data)
        for name in tech_names:
            if name.strip():
                ProjectTechnology.objects.create(project=project, name=name.strip())
        return project

    def update(self, instance, validated_data):
        tech_names = validated_data.pop("tech_names", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tech_names is not None:
            instance.technologies.all().delete()
            for name in tech_names:
                if name.strip():
                    ProjectTechnology.objects.create(project=instance, name=name.strip())

        return instance
