from django.conf import settings
from django.db import models


class Company(models.Model):
    name = models.CharField(max_length=200, unique=True)
    industry = models.CharField(max_length=150, blank=True)
    website = models.URLField(blank=True)
    contact_person = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ["name"]

    def __str__(self):
        return self.name


class JobVacancy(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = "FULL_TIME", "Full Time"
        PART_TIME = "PART_TIME", "Part Time"
        INTERNSHIP = "INTERNSHIP", "Internship"
        CONTRACT = "CONTRACT", "Contract"

    class VacancyStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        CLOSED = "CLOSED", "Closed"
        DRAFT = "DRAFT", "Draft"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="vacancies",
    )
    title = models.CharField(max_length=200)
    job_description = models.TextField()
    job_type = models.CharField(
        max_length=30,
        choices=JobType.choices,
        default=JobType.FULL_TIME,
    )
    location = models.CharField(max_length=150)
    salary_package = models.CharField(max_length=100, blank=True)  # e.g. "6 - 8 LPA"
    openings = models.PositiveIntegerField(default=1)
    application_deadline = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=VacancyStatus.choices,
        default=VacancyStatus.ACTIVE,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vacancies_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Job Vacancies"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} at {self.company.name}"


class JobEligibility(models.Model):
    vacancy = models.OneToOneField(
        JobVacancy,
        on_delete=models.CASCADE,
        related_name="eligibility",
    )
    minimum_qualification = models.CharField(max_length=150, blank=True)
    required_skills = models.CharField(max_length=255, blank=True)
    min_graduation_year = models.PositiveIntegerField(null=True, blank=True)
    max_graduation_year = models.PositiveIntegerField(null=True, blank=True)
    must_be_placement_ready = models.BooleanField(default=True)
    additional_criteria = models.TextField(blank=True)

    def __str__(self):
        return f"Eligibility for {self.vacancy.title}"


class JobApplication(models.Model):
    class ApplicationStatus(models.TextChoices):
        APPLIED = "APPLIED", "Applied"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"
        INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED", "Interview Scheduled"
        OFFERED = "OFFERED", "Offered"
        REJECTED = "REJECTED", "Rejected"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    vacancy = models.ForeignKey(
        JobVacancy,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="job_applications",
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=30,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.APPLIED,
    )
    cover_note = models.TextField(blank=True)
    resume_file = models.FileField(upload_to="application_resumes/", null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["vacancy", "student"],
                name="unique_student_job_application",
            )
        ]
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.student.user.username} -> {self.vacancy.title} ({self.status})"


class Interview(models.Model):
    class Mode(models.TextChoices):
        ONLINE = "ONLINE", "Online Video / Call"
        IN_PERSON = "IN_PERSON", "In-Person Office"
        TELEPHONIC = "TELEPHONIC", "Telephonic"

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        COMPLETED = "COMPLETED", "Completed"
        RESCHEDULED = "RESCHEDULED", "Rescheduled"
        CANCELLED = "CANCELLED", "Cancelled"

    class Result(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PASSED = "PASSED", "Passed"
        FAILED = "FAILED", "Failed"

    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="interviews",
    )
    round_name = models.CharField(max_length=150)  # e.g., "Round 1: Technical Screening"
    scheduled_date = models.DateTimeField()
    mode = models.CharField(
        max_length=20,
        choices=Mode.choices,
        default=Mode.ONLINE,
    )
    meeting_link = models.CharField(max_length=500, blank=True)
    location_details = models.CharField(max_length=255, blank=True)
    interviewer_name = models.CharField(max_length=150, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )
    feedback = models.TextField(blank=True)
    result = models.CharField(
        max_length=20,
        choices=Result.choices,
        default=Result.PENDING,
    )

    class Meta:
        ordering = ["scheduled_date"]

    def __str__(self):
        return f"{self.round_name} for {self.application.student.user.username} ({self.status})"


class OfferDetails(models.Model):
    class OfferStatus(models.TextChoices):
        OFFERED = "OFFERED", "Offered"
        ACCEPTED = "ACCEPTED", "Accepted"
        DECLINED = "DECLINED", "Declined"

    application = models.OneToOneField(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="offer",
    )
    offered_designation = models.CharField(max_length=150)
    offered_ctc = models.CharField(max_length=100)
    offer_letter = models.FileField(upload_to="offer_letters/", null=True, blank=True)
    offer_date = models.DateField()
    joining_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=OfferStatus.choices,
        default=OfferStatus.OFFERED,
    )

    def __str__(self):
        return f"Offer: {self.offered_designation} ({self.offered_ctc}) to {self.application.student.user.username}"


class PlacementRecord(models.Model):
    class JoiningStatus(models.TextChoices):
        JOINED = "JOINED", "Joined"
        YET_TO_JOIN = "YET_TO_JOIN", "Yet to Join"
        OPTED_OUT = "OPTED_OUT", "Opted Out"

    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="placement_records",
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="placement_records",
    )
    vacancy = models.ForeignKey(
        JobVacancy,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="placement_records",
    )
    role_offered = models.CharField(max_length=150)
    ctc = models.CharField(max_length=100)
    placed_date = models.DateField()
    joining_status = models.CharField(
        max_length=20,
        choices=JoiningStatus.choices,
        default=JoiningStatus.YET_TO_JOIN,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="placements_recorded",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-placed_date"]

    def __str__(self):
        return f"{self.student.user.username} placed at {self.company.name} as {self.role_offered}"
