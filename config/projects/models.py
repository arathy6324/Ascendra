from django.conf import settings
from django.db import models


class Project(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        ARCHIVED = "ARCHIVED", "Archived"

    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="projects",
    )
    title = models.CharField(max_length=200)
    tagline = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    completion_date = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.COMPLETED,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.student.user.username}"


class ProjectTechnology(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="technologies",
    )
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Project Technologies"

    def __str__(self):
        return f"{self.name} ({self.project.title})"


class ProjectAttachment(models.Model):
    class AttachmentType(models.TextChoices):
        IMAGE = "IMAGE", "Screenshot / Image"
        DOCUMENT = "DOCUMENT", "Document / PDF"
        VIDEO = "VIDEO", "Video Demo"

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to="project_attachments/")
    file_type = models.CharField(
        max_length=20,
        choices=AttachmentType.choices,
        default=AttachmentType.IMAGE,
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.project.title}"


class ProjectReview(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_reviews_given",
    )
    rating = models.PositiveSmallIntegerField(default=5)  # 1 to 5 scale
    feedback = models.TextField()
    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.project.title} by {self.reviewer.username}: {self.rating}/5"
