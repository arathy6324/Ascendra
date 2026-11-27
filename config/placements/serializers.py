from rest_framework import serializers
from .models import Company, JobVacancy, JobEligibility, JobApplication, Interview, OfferDetails, PlacementRecord


class CompanySerializer(serializers.ModelSerializer):
    vacancies_count = serializers.SerializerMethodField()
    placements_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "industry",
            "website",
            "contact_person",
            "email",
            "phone",
            "location",
            "description",
            "vacancies_count",
            "placements_count",
            "created_at",
        ]

    def get_vacancies_count(self, obj):
        return obj.vacancies.count()

    def get_placements_count(self, obj):
        return obj.placement_records.count()


class JobEligibilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobEligibility
        fields = [
            "id",
            "minimum_qualification",
            "required_skills",
            "min_graduation_year",
            "max_graduation_year",
            "must_be_placement_ready",
            "additional_criteria",
        ]


class JobVacancySerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source="company.name")
    company_location = serializers.ReadOnlyField(source="company.location")
    company_industry = serializers.ReadOnlyField(source="company.industry")
    eligibility = JobEligibilitySerializer(required=False)
    applications_count = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = JobVacancy
        fields = [
            "id",
            "company",
            "company_name",
            "company_location",
            "company_industry",
            "title",
            "job_description",
            "job_type",
            "location",
            "salary_package",
            "openings",
            "application_deadline",
            "status",
            "eligibility",
            "applications_count",
            "has_applied",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def get_applications_count(self, obj):
        return obj.applications.count()

    def get_has_applied(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated and hasattr(request.user, "student_profile"):
            return obj.applications.filter(student=request.user.student_profile).exists()
        return False

    def create(self, validated_data):
        eligibility_data = validated_data.pop("eligibility", None)
        vacancy = JobVacancy.objects.create(**validated_data)
        if eligibility_data:
            JobEligibility.objects.create(vacancy=vacancy, **eligibility_data)
        else:
            JobEligibility.objects.create(vacancy=vacancy)
        return vacancy

    def update(self, instance, validated_data):
        eligibility_data = validated_data.pop("eligibility", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if eligibility_data:
            eligibility, _ = JobEligibility.objects.get_or_create(vacancy=instance)
            for attr, value in eligibility_data.items():
                setattr(eligibility, attr, value)
            eligibility.save()

        return instance


class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.ReadOnlyField(source="application.student.user.get_full_name")
    candidate_email = serializers.ReadOnlyField(source="application.student.user.email")
    job_title = serializers.ReadOnlyField(source="application.vacancy.title")
    company_name = serializers.ReadOnlyField(source="application.vacancy.company.name")

    class Meta:
        model = Interview
        fields = [
            "id",
            "application",
            "candidate_name",
            "candidate_email",
            "job_title",
            "company_name",
            "round_name",
            "scheduled_date",
            "mode",
            "meeting_link",
            "location_details",
            "interviewer_name",
            "status",
            "feedback",
            "result",
        ]


class OfferDetailsSerializer(serializers.ModelSerializer):
    candidate_name = serializers.ReadOnlyField(source="application.student.user.get_full_name")

    class Meta:
        model = OfferDetails
        fields = [
            "id",
            "application",
            "candidate_name",
            "offered_designation",
            "offered_ctc",
            "offer_letter",
            "offer_date",
            "joining_date",
            "status",
        ]


class JobApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.ReadOnlyField(source="student.user.get_full_name")
    candidate_email = serializers.ReadOnlyField(source="student.user.email")
    candidate_phone = serializers.ReadOnlyField(source="student.phone")
    candidate_college = serializers.ReadOnlyField(source="student.college")
    candidate_status = serializers.ReadOnlyField(source="student.status")
    job_title = serializers.ReadOnlyField(source="vacancy.title")
    company_name = serializers.ReadOnlyField(source="vacancy.company.name")
    salary_package = serializers.ReadOnlyField(source="vacancy.salary_package")
    interviews = InterviewSerializer(many=True, read_only=True)
    offer = OfferDetailsSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "vacancy",
            "job_title",
            "company_name",
            "salary_package",
            "student",
            "candidate_name",
            "candidate_email",
            "candidate_phone",
            "candidate_college",
            "candidate_status",
            "applied_at",
            "status",
            "cover_note",
            "resume_file",
            "notes",
            "interviews",
            "offer",
        ]
        read_only_fields = ["student", "applied_at"]


class PlacementRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")
    student_email = serializers.ReadOnlyField(source="student.user.email")
    student_college = serializers.ReadOnlyField(source="student.college")
    company_name = serializers.ReadOnlyField(source="company.name")

    class Meta:
        model = PlacementRecord
        fields = [
            "id",
            "student",
            "student_name",
            "student_email",
            "student_college",
            "company",
            "company_name",
            "vacancy",
            "role_offered",
            "ctc",
            "placed_date",
            "joining_status",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]
