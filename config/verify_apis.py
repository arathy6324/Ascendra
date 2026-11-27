import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from students.models import StudentProfile

User = get_user_model()
client = APIClient()

print("--- 1. Testing API Status Endpoint ---")
res = client.get("/api/status/status/")
print(f"Status: {res.status_code}, DB: {res.data.get('database')}, Platform: {res.data.get('platform')}")
assert res.status_code == 200
assert res.data.get("database") == "connected"

print("\n--- 2. Testing JWT Login for All Roles ---")
roles_creds = [
    ("admin", "AdminPassword123!", "ADMIN"),
    ("trainer_alex", "TrainerPassword123!", "TRAINER"),
    ("placement_sarah", "PlacementPassword123!", "PLACEMENT"),
    ("student_rahul", "StudentPassword123!", "STUDENT"),
    ("student_priya", "StudentPassword123!", "STUDENT"),
    ("alumni_david", "AlumniPassword123!", "ALUMNI"),
]

for username, pwd, role in roles_creds:
    res = client.post("/api/auth/login/", {"username": username, "password": pwd})
    assert res.status_code == 200, f"Login failed for {username}: {res.data}"
    user_info = res.data.get("user")
    assert user_info["role"] == role
    print(f"  ✓ {username} ({role}) authenticated successfully. Profile ID: {user_info.get('student_profile_id')}")

print("\n--- 3. Testing Admin Analytics Endpoint ---")
admin_user = User.objects.get(username="admin")
client.force_authenticate(user=admin_user)
res = client.get("/api/accounts/admin-summary/")
print(f"Admin summary metrics: {res.data.get('metrics')}")
assert res.status_code == 200
assert res.data["metrics"]["total_students"] >= 2

print("\n--- 4. Testing Placement Officer Summary ---")
placement_user = User.objects.get(username="placement_sarah")
client.force_authenticate(user=placement_user)
res = client.get("/api/placements/summary/")
print(f"Placement summary metrics: {res.data.get('metrics')}")
assert res.status_code == 200

print("\n--- 5. Testing Student Progress & Assessments ---")
student_priya = User.objects.get(username="student_priya")
client.force_authenticate(user=student_priya)
res = client.get("/api/assessments/assessments/")
assert res.status_code == 200
print(f"Assessments available to Priya: {len(res.data.get('results', res.data))}")

print("\n--- 6. Testing Student-to-Alumni Activation Workflow ---")
# Let's test completing course and activating alumni for a student
client.force_authenticate(user=admin_user)
student_rahul_profile = StudentProfile.objects.get(user__username="student_rahul")
# Mark course complete
res = client.post(f"/api/students/profiles/{student_rahul_profile.id}/complete_course/")
assert res.status_code == 200
student_rahul_profile.refresh_from_db()
assert student_rahul_profile.course_completed == True
print(f"  ✓ Course marked complete. is_alumni_eligible: {student_rahul_profile.is_alumni_eligible}")

# Activate alumni
res = client.post(f"/api/students/profiles/{student_rahul_profile.id}/activate_alumni/", {"notes": "Top student"})
assert res.status_code == 200
student_rahul_user = User.objects.get(username="student_rahul")
assert student_rahul_user.role == "ALUMNI"
student_rahul_profile.refresh_from_db()
assert student_rahul_profile.college != "" # Profile preserved
print(f"  ✓ Alumni activated! User role: {student_rahul_user.role}, Student Profile preserved: {student_rahul_profile}")

# Reset Rahul back to STUDENT for continued demo testing
student_rahul_user.role = User.Role.STUDENT
student_rahul_user.save()
student_rahul_profile.course_completed = False
student_rahul_profile.is_alumni_eligible = False
student_rahul_profile.save()

print("\nALL BACKEND API AND WORKFLOW VERIFICATIONS PASSED SUCCESSFULLY!")
