from django.conf import settings
from django.db import models


class CareerMilestone(models.Model):
    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="career_milestones",
    )
    title = models.CharField(max_length=200)  # e.g., "Promoted to Tech Lead", "Launched AI Startup"
    company_name = models.CharField(max_length=200, blank=True)
    date_achieved = models.DateField()
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_achieved"]

    def __str__(self):
        return f"{self.title} - {self.student.user.username}"


class AlumniEvent(models.Model):
    class EventType(models.TextChoices):
        WEBINAR = "WEBINAR", "Webinar"
        NETWORKING = "NETWORKING", "Networking Session"
        WORKSHOP = "WORKSHOP", "Skill Workshop"
        REUNION = "REUNION", "Alumni Meetup / Reunion"

    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateTimeField()
    location_or_link = models.CharField(max_length=300)
    event_type = models.CharField(
        max_length=20,
        choices=EventType.choices,
        default=EventType.NETWORKING,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="alumni_events_created",
    )
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-event_date"]

    def __str__(self):
        return f"{self.title} ({self.get_event_type_display()})"


class Mentorship(models.Model):
    class Status(models.TextChoices):
        REQUESTED = "REQUESTED", "Requested"
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"
        DECLINED = "DECLINED", "Declined"

    alumnus = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mentorships_given",
        limit_choices_to={"role": "ALUMNI"},
    )
    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="mentorships_received",
    )
    topic = models.CharField(max_length=200)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.REQUESTED,
    )
    meeting_schedule = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Mentorship: {self.alumnus.username} mentoring {self.student.user.username} on {self.topic}"


class AlumniActivationLog(models.Model):
    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="activation_logs",
    )
    activated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="activations_logged",
    )
    activated_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Activation for {self.student.user.username} by {self.activated_by.username} at {self.activated_at}"
