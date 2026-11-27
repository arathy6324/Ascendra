from django.conf import settings
from django.db import models


class Announcement(models.Model):
    class TargetRole(models.TextChoices):
        ALL = "ALL", "All Users"
        STUDENT = "STUDENT", "Students"
        TRAINER = "TRAINER", "Trainers"
        PLACEMENT = "PLACEMENT", "Placement Officers"
        ALUMNI = "ALUMNI", "Alumni"

    title = models.CharField(max_length=255)
    content = models.TextField()
    target_role = models.CharField(
        max_length=20,
        choices=TargetRole.choices,
        default=TargetRole.ALL,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="announcements_created",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_target_role_display()})"


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title}"
