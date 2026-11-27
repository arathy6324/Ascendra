from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    class Status(models.TextChoices):
        LEARNING = "LEARNING", "Learning"
        PLACEMENT_READY = "PLACEMENT_READY", "Placement Ready"
        PLACED = "PLACED", "Placed"
        NOT_PLACED = "NOT_PLACED", "Not Placed"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )

    phone = models.CharField(max_length=20, blank=True)
    college = models.CharField(max_length=200, blank=True)
    qualification = models.CharField(max_length=100, blank=True)
    graduation_year = models.PositiveIntegerField(
        null=True, blank=True
    )
    course_name = models.CharField(max_length=150, blank=True)
    career_goal = models.CharField(max_length=200, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.LEARNING,
    )

    # Academic course completion vs. Placement status
    course_completed = models.BooleanField(default=False)
    course_completed_date = models.DateField(null=True, blank=True)

    # Alumni transition workflow
    is_alumni_eligible = models.BooleanField(default=False)
    alumni_activated_at = models.DateTimeField(null=True, blank=True)
    alumni_activated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alumni_activations_performed",
    )

    resume = models.FileField(upload_to="resumes/", null=True, blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Student: {self.user.username}"


class ProfessionalProfile(models.Model):
    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="professional_profile",
    )

    current_company = models.CharField(
        max_length=200, blank=True
    )
    current_job_title = models.CharField(
        max_length=200, blank=True
    )
    years_of_experience = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=0,
    )
    target_role = models.CharField(
        max_length=200, blank=True
    )
    career_goal = models.TextField(blank=True)
    industry = models.CharField(max_length=150, blank=True)
    location = models.CharField(max_length=150, blank=True)
    skills_summary = models.TextField(blank=True)
    linkedin_url = models.URLField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"Professional profile: "
            f"{self.student.user.username}"
        )
