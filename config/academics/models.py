from django.conf import settings
from django.db import models


class Course(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    duration_months = models.PositiveIntegerField(default=6)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Batch(models.Model):
    name = models.CharField(max_length=100)

    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name="batches",
    )

    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="teaching_batches",
        limit_choices_to={"role": "TRAINER"},
    )

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.course.name}"


class Enrollment(models.Model):
    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.PROTECT,
        related_name="enrollments",
    )

    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name="enrollments",
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "batch"],
                name="unique_student_batch_enrollment",
            )
        ]

    def __str__(self):
        return f"{self.student} - {self.batch}"


class CourseModule(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="modules",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)
    duration_weeks = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.name} - {self.order}. {self.title}"


class LearningMaterial(models.Model):
    class MaterialType(models.TextChoices):
        DOCUMENT = "DOCUMENT", "Document"
        VIDEO = "VIDEO", "Video Link"
        CODE = "CODE", "Code Sample / Repo"
        SLIDES = "SLIDES", "Presentation Slides"
        NOTES = "NOTES", "Lecture Notes"

    module = models.ForeignKey(
        CourseModule,
        on_delete=models.CASCADE,
        related_name="materials",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    material_type = models.CharField(
        max_length=20,
        choices=MaterialType.choices,
        default=MaterialType.DOCUMENT,
    )
    file = models.FileField(upload_to="learning_materials/", null=True, blank=True)
    external_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.module.title} - {self.title}"


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"
        LATE = "LATE", "Late"
        EXCUSED = "EXCUSED", "Excused"

    batch = models.ForeignKey(
        Batch,
        on_delete=models.CASCADE,
        related_name="attendances",
    )
    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="attendances",
    )
    date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PRESENT,
    )
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "batch", "date"],
                name="unique_student_batch_attendance",
            )
        ]

    def __str__(self):
        return f"{self.student.user.username} - {self.date}: {self.status}"
