from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Company, JobVacancy, JobEligibility, JobApplication, Interview, OfferDetails, PlacementRecord
from .serializers import (
    CompanySerializer,
    JobVacancySerializer,
    JobApplicationSerializer,
    InterviewSerializer,
    OfferDetailsSerializer,
    PlacementRecordSerializer,
)
from accounts.permissions import IsPlacementOfficerRole, IsAdminUserRole
from students.models import StudentProfile

User = get_user_model()


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Company.objects.all().prefetch_related("vacancies", "placement_records")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(industry__icontains=search) | Q(location__icontains=search))
        return qs

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsPlacementOfficerRole()]
        return [IsAuthenticated()]


class JobVacancyViewSet(viewsets.ModelViewSet):
    serializer_class = JobVacancySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = JobVacancy.objects.select_related("company", "eligibility", "created_by").prefetch_related("applications")

        if user.role in ["STUDENT", "ALUMNI"]:
            qs = qs.filter(status=JobVacancy.VacancyStatus.ACTIVE)

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param.upper())

        company_id = self.request.query_params.get("company")
        if company_id:
            qs = qs.filter(company_id=company_id)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(company__name__icontains=search)
                | Q(location__icontains=search)
            )

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsPlacementOfficerRole()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def apply(self, request, pk=None):
        vacancy = self.get_object()
        user = request.user

        if not hasattr(user, "student_profile"):
            return Response(
                {"detail": "Only student profiles can apply for job vacancies."},
                status=status.HTTP_403_FORBIDDEN,
            )

        student = user.student_profile

        if JobApplication.objects.filter(vacancy=vacancy, student=student).exists():
            return Response(
                {"detail": "You have already applied for this position."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cover_note = request.data.get("cover_note", "")
        resume_file = request.FILES.get("resume_file", student.resume)

        application = JobApplication.objects.create(
            vacancy=vacancy,
            student=student,
            cover_note=cover_note,
            resume_file=resume_file,
            status=JobApplication.ApplicationStatus.APPLIED,
        )

        serializer = JobApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = JobApplication.objects.select_related("vacancy__company", "student__user").prefetch_related("interviews", "offer")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role in ["STUDENT", "ALUMNI"]:
            qs = qs.filter(student__user=user)
        else:
            return JobApplication.objects.none()

        vacancy_id = self.request.query_params.get("vacancy")
        if vacancy_id:
            qs = qs.filter(vacancy_id=vacancy_id)

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param.upper())

        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsPlacementOfficerRole])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get("status")
        notes = request.data.get("notes", "")

        if new_status in JobApplication.ApplicationStatus.values:
            application.status = new_status
            if notes:
                application.notes = notes
            application.save()

            # If status changed to OFFERED and offer data provided
            if new_status == JobApplication.ApplicationStatus.OFFERED:
                offered_designation = request.data.get("offered_designation", application.vacancy.title)
                offered_ctc = request.data.get("offered_ctc", application.vacancy.salary_package or "Competitive")
                offer_date = request.data.get("offer_date", timezone.now().date())
                joining_date = request.data.get("joining_date", None)

                OfferDetails.objects.update_or_create(
                    application=application,
                    defaults={
                        "offered_designation": offered_designation,
                        "offered_ctc": offered_ctc,
                        "offer_date": offer_date,
                        "joining_date": joining_date,
                        "status": OfferDetails.OfferStatus.OFFERED,
                    }
                )

            serializer = JobApplicationSerializer(application)
            return Response(serializer.data)

        return Response(
            {"detail": "Invalid status value."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class InterviewViewSet(viewsets.ModelViewSet):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Interview.objects.select_related("application__vacancy__company", "application__student__user")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role in ["STUDENT", "ALUMNI"]:
            qs = qs.filter(application__student__user=user)
        else:
            return Interview.objects.none()

        application_id = self.request.query_params.get("application")
        if application_id:
            qs = qs.filter(application_id=application_id)

        return qs

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsPlacementOfficerRole()]
        return [IsAuthenticated()]


class PlacementRecordViewSet(viewsets.ModelViewSet):
    serializer_class = PlacementRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PlacementRecord.objects.select_related("student__user", "company", "vacancy").order_by("-placed_date")

    def perform_create(self, serializer):
        placement = serializer.save(created_by=self.request.user)
        # Update student profile status to PLACED
        student = placement.student
        student.status = StudentProfile.Status.PLACED
        student.save()

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsPlacementOfficerRole()]
        return [IsAuthenticated()]


@api_view(["GET"])
@permission_classes([IsPlacementOfficerRole])
def placement_analytics_summary(request):
    """
    Returns comprehensive metrics for Placement Dashboard:
    - Total eligible students, placement-ready students, active vacancies
    - Applications count, shortlisted, interviews scheduled, students placed
    - Company-wise placement distribution
    """
    total_eligible = StudentProfile.objects.filter(is_alumni_eligible=True).count()
    placement_ready = StudentProfile.objects.filter(status=StudentProfile.Status.PLACEMENT_READY).count()
    placed_count = StudentProfile.objects.filter(status=StudentProfile.Status.PLACED).count()
    awaiting_placement = StudentProfile.objects.filter(status__in=[StudentProfile.Status.LEARNING, StudentProfile.Status.PLACEMENT_READY]).count()

    active_vacancies = JobVacancy.objects.filter(status=JobVacancy.VacancyStatus.ACTIVE).count()
    total_applications = JobApplication.objects.count()
    shortlisted = JobApplication.objects.filter(status=JobApplication.ApplicationStatus.SHORTLISTED).count()
    interviews_scheduled = Interview.objects.filter(status=Interview.Status.SCHEDULED).count()

    companies_data = []
    for comp in Company.objects.annotate(p_count=Count("placement_records")).order_by("-p_count")[:10]:
        companies_data.append({
            "id": comp.id,
            "name": comp.name,
            "industry": comp.industry,
            "placements": comp.p_count,
        })

    return Response({
        "metrics": {
            "total_eligible_students": total_eligible,
            "placement_ready_students": placement_ready,
            "active_job_opportunities": active_vacancies,
            "total_applications": total_applications,
            "shortlisted_candidates": shortlisted,
            "interviews_scheduled": interviews_scheduled,
            "students_placed": placed_count,
            "students_awaiting_placement": awaiting_placement,
        },
        "company_placements": companies_data,
    })
