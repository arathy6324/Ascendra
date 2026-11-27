from rest_framework import serializers
from .models import Course, Batch, Enrollment, CourseModule, LearningMaterial, Attendance
from accounts.serializers import UserSerializer


class LearningMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningMaterial
        fields = [
            "id",
            "module",
            "title",
            "description",
            "material_type",
            "file",
            "external_url",
            "created_at",
        ]


class CourseModuleSerializer(serializers.ModelSerializer):
    materials = LearningMaterialSerializer(many=True, read_only=True)

    class Meta:
        model = CourseModule
        fields = [
            "id",
            "course",
            "title",
            "description",
            "order",
            "duration_weeks",
            "materials",
        ]


class CourseSerializer(serializers.ModelSerializer):
    modules = CourseModuleSerializer(many=True, read_only=True)
    batches_count = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "code",
            "description",
            "duration_months",
            "is_active",
            "modules",
            "batches_count",
            "students_count",
        ]

    def get_batches_count(self, obj):
        return obj.batches.count()

    def get_students_count(self, obj):
        return Enrollment.objects.filter(batch__course=obj, is_active=True).values("student").distinct().count()


class BatchSerializer(serializers.ModelSerializer):
    course_name = serializers.ReadOnlyField(source="course.name")
    trainer_name = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = [
            "id",
            "name",
            "course",
            "course_name",
            "trainer",
            "trainer_name",
            "start_date",
            "end_date",
            "is_active",
            "students_count",
        ]

    def get_trainer_name(self, obj):
        if obj.trainer:
            return obj.trainer.get_full_name() or obj.trainer.username
        return "Unassigned"

    def get_students_count(self, obj):
        return obj.enrollments.filter(is_active=True).count()


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")
    student_email = serializers.ReadOnlyField(source="student.user.email")
    batch_name = serializers.ReadOnlyField(source="batch.name")
    course_name = serializers.ReadOnlyField(source="batch.course.name")

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "student_name",
            "student_email",
            "batch",
            "batch_name",
            "course_name",
            "enrolled_at",
            "is_active",
            "completed",
            "completed_at",
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")
    batch_name = serializers.ReadOnlyField(source="batch.name")

    class Meta:
        model = Attendance
        fields = [
            "id",
            "batch",
            "batch_name",
            "student",
            "student_name",
            "date",
            "status",
            "remarks",
        ]
