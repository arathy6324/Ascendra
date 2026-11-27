from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive. Please contact your administrator.")

        student_profile_id = None
        student_status = None
        course_completed = False
        if hasattr(user, "student_profile"):
            student_profile_id = user.student_profile.id
            student_status = user.student_profile.status
            course_completed = getattr(user.student_profile, "course_completed", False)

        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": user.get_full_name() or user.username,
            "role": user.role,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "student_profile_id": student_profile_id,
            "student_status": student_status,
            "course_completed": course_completed,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    student_profile_id = serializers.SerializerMethodField()
    student_status = serializers.SerializerMethodField()
    course_completed = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "is_active",
            "date_joined",
            "student_profile_id",
            "student_status",
            "course_completed",
        ]
        read_only_fields = ["id", "date_joined"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_student_profile_id(self, obj):
        if hasattr(obj, "student_profile"):
            return obj.student_profile.id
        return None

    def get_student_status(self, obj):
        if hasattr(obj, "student_profile"):
            return obj.student_profile.status
        return None

    def get_course_completed(self, obj):
        if hasattr(obj, "student_profile"):
            return getattr(obj.student_profile, "course_completed", False)
        return False


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    college = serializers.CharField(write_only=True, required=False, allow_blank=True)
    qualification = serializers.CharField(write_only=True, required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    course_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "role",
            "is_active",
            "phone",
            "college",
            "qualification",
            "graduation_year",
            "course_name",
        ]

    def create(self, validated_data):
        phone = validated_data.pop("phone", "")
        college = validated_data.pop("college", "")
        qualification = validated_data.pop("qualification", "")
        graduation_year = validated_data.pop("graduation_year", None)
        course_name = validated_data.pop("course_name", "")

        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # If user is STUDENT, ensure StudentProfile is created
        if user.role == User.Role.STUDENT:
            from students.models import StudentProfile
            StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    "phone": phone,
                    "college": college,
                    "qualification": qualification,
                    "graduation_year": graduation_year,
                    "course_name": course_name,
                }
            )

        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class StudentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    college = serializers.CharField(write_only=True, required=False, allow_blank=True)
    qualification = serializers.CharField(write_only=True, required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    course_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "phone",
            "college",
            "qualification",
            "graduation_year",
            "course_name",
        ]

    def create(self, validated_data):
        phone = validated_data.pop("phone", "")
        college = validated_data.pop("college", "")
        qualification = validated_data.pop("qualification", "")
        graduation_year = validated_data.pop("graduation_year", None)
        course_name = validated_data.pop("course_name", "")
        password = validated_data.pop("password")

        user = User(role=User.Role.STUDENT, **validated_data)
        user.set_password(password)
        user.save()

        from students.models import StudentProfile
        StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                "phone": phone,
                "college": college,
                "qualification": qualification,
                "graduation_year": graduation_year,
                "course_name": course_name,
            },
        )
        return user
