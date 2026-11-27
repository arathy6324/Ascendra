from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
import datetime

from students.models import StudentProfile, ProfessionalProfile
from academics.models import Course, Batch, Enrollment
from placements.models import Company, JobVacancy, JobApplication

User = get_user_model()


class AscendraCoreWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_user(
            username="test_admin",
            password="AdminPassword123!",
            email="admin@test.com",
            role=User.Role.ADMIN,
        )

        # Trainer user
        self.trainer = User.objects.create_user(
            username="test_trainer",
            password="TrainerPassword123!",
            email="trainer@test.com",
            role=User.Role.TRAINER,
        )

        # Placement user
        self.placement = User.objects.create_user(
            username="test_placement",
            password="PlacementPassword123!",
            email="placement@test.com",
            role=User.Role.PLACEMENT,
        )

        # Student user
        self.student_user = User.objects.create_user(
            username="test_student",
            password="StudentPassword123!",
            email="student@test.com",
            role=User.Role.STUDENT,
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            phone="1234567890",
            college="Test College",
            qualification="B.Tech",
            graduation_year=2026,
            status=StudentProfile.Status.LEARNING,
        )

        # Course & Batch
        self.course = Course.objects.create(
            name="Test Cloud Course",
            code="TCC-101",
            duration_months=6,
        )
        self.batch = Batch.objects.create(
            name="Batch Alpha",
            course=self.course,
            trainer=self.trainer,
            start_date=datetime.date(2026, 1, 1),
        )
        self.enrollment = Enrollment.objects.create(
            student=self.student_profile,
            batch=self.batch,
        )

    def test_jwt_login_success(self):
        """Verify JWT login returns access, refresh, and user role info."""
        response = self.client.post("/api/auth/login/", {
            "username": "test_student",
            "password": "StudentPassword123!",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["role"], "STUDENT")
        self.assertEqual(response.data["user"]["student_profile_id"], self.student_profile.id)

    def test_student_to_alumni_transition(self):
        """
        Verify the non-negotiable student-to-alumni activation workflow:
        1. Course is marked completed.
        2. Admin activates alumni access.
        3. User role changes from STUDENT to ALUMNI.
        4. StudentProfile & academic records remain completely intact.
        5. ProfessionalProfile is created/maintained.
        """
        self.client.force_authenticate(user=self.admin)

        # 1. Complete course
        complete_resp = self.client.post(f"/api/students/profiles/{self.student_profile.id}/complete_course/")
        self.assertEqual(complete_resp.status_code, status.HTTP_200_OK)
        self.student_profile.refresh_from_db()
        self.assertTrue(self.student_profile.course_completed)
        self.assertTrue(self.student_profile.is_alumni_eligible)

        # 2. Activate Alumni
        activate_resp = self.client.post(
            f"/api/students/profiles/{self.student_profile.id}/activate_alumni/",
            {"notes": "Completed with distinction"}
        )
        self.assertEqual(activate_resp.status_code, status.HTTP_200_OK)

        self.student_user.refresh_from_db()
        self.student_profile.refresh_from_db()

        # Role must be ALUMNI now
        self.assertEqual(self.student_user.role, User.Role.ALUMNI)
        # StudentProfile must still exist and be intact
        self.assertEqual(self.student_profile.college, "Test College")
        self.assertEqual(self.student_profile.enrollments.count(), 1)
        # ProfessionalProfile must exist
        self.assertTrue(hasattr(self.student_profile, "professional_profile"))

    def test_role_authorization_restriction(self):
        """Verify students cannot perform admin-only operations like creating users."""
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post("/api/accounts/users/", {
            "username": "unauthorized_user",
            "password": "Password123!",
            "role": "STUDENT",
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_job_application_flow(self):
        """Verify placement officer creates vacancy and student can apply."""
        self.client.force_authenticate(user=self.placement)
        company = Company.objects.create(name="TechCorp Solutions")
        vacancy = JobVacancy.objects.create(
            company=company,
            title="Junior Software Engineer",
            job_description="Great role",
            location="Bengaluru",
            application_deadline=datetime.date(2026, 12, 31),
            created_by=self.placement,
        )

        # Student applies
        self.client.force_authenticate(user=self.student_user)
        apply_resp = self.client.post(f"/api/placements/vacancies/{vacancy.id}/apply/", {
            "cover_note": "I would love to join TechCorp!"
        })
        self.assertEqual(apply_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(JobApplication.objects.filter(vacancy=vacancy, student=self.student_profile).count(), 1)

    def test_student_registration_and_mentorship_request(self):
        """Verify public student registration and mentorship request flow."""
        reg_resp = self.client.post("/api/auth/register/", {
            "username": "new_learner",
            "email": "new@learner.com",
            "first_name": "New",
            "last_name": "Learner",
            "password": "StrongPassword123!",
            "college": "State Tech",
            "graduation_year": 2027,
        })
        self.assertEqual(reg_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", reg_resp.data)
        self.assertEqual(reg_resp.data["user"]["role"], "STUDENT")

        alumnus = User.objects.create_user(
            username="mentor_alum",
            password="MentorPassword123!",
            email="mentor@test.com",
            role=User.Role.ALUMNI,
        )
        self.client.force_authenticate(user=self.student_user)
        m_resp = self.client.post("/api/careers/mentorship/", {
            "alumnus": alumnus.id,
            "topic": "System Design Review",
            "notes": "Looking for architecture guidance",
        })
        self.assertEqual(m_resp.status_code, status.HTTP_201_CREATED)
