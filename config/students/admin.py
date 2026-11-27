
from django.contrib import admin
from .models import StudentProfile, ProfessionalProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "course_name",
        "graduation_year",
        "status",
    )
    list_filter = ("status", "course_name")
    search_fields = ("user__username", "user__email")


@admin.register(ProfessionalProfile)
class ProfessionalProfileAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "current_company",
        "current_job_title",
        "years_of_experience",
    )
