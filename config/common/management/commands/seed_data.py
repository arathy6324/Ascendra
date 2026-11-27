import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from students.models import StudentProfile, ProfessionalProfile
from academics.models import Course, Batch, Enrollment, CourseModule, LearningMaterial, Attendance
from assessments.models import Assessment, Question, Submission, StudentAnswer
from skills.models import SkillCategory, Skill, StudentSkill, Certification
from projects.models import Project, ProjectTechnology, ProjectReview
from placements.models import Company, JobVacancy, JobEligibility, JobApplication, Interview, PlacementRecord, OfferDetails
from careers.models import CareerMilestone, AlumniEvent, Mentorship, AlumniActivationLog
from common.models import Announcement, Notification

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with abundant, realistic Ascendra development data across all 5 dashboards"

    def handle(self, *args, **options):
        self.stdout.write("Starting rich Ascendra database seeding...")

        # 1. CORE DEMO USERS & EXTRA FACULTY/STUDENTS/ALUMNI
        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@ascendra.edu",
                "first_name": "Marcus",
                "last_name": "Vance",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("AdminPassword123!")
        admin_user.is_active = True
        admin_user.save()

        trainer_specs = [
            ("trainer_alex", "alex.rivers@ascendra.edu", "Alex", "Rivers"),
            ("trainer_maya", "maya.kapoor@ascendra.edu", "Maya", "Kapoor"),
            ("trainer_liam", "liam.oconnor@ascendra.edu", "Liam", "O'Connor"),
        ]
        trainers = {}
        for uname, email, fn, ln in trainer_specs:
            t, _ = User.objects.get_or_create(
                username=uname,
                defaults={"email": email, "first_name": fn, "last_name": ln, "role": User.Role.TRAINER},
            )
            t.set_password("TrainerPassword123!")
            t.is_active = True
            t.save()
            trainers[uname] = t
        trainer_user = trainers["trainer_alex"]

        placement_user, _ = User.objects.get_or_create(
            username="placement_sarah",
            defaults={
                "email": "sarah.jenkins@ascendra.edu",
                "first_name": "Sarah",
                "last_name": "Jenkins",
                "role": User.Role.PLACEMENT,
            },
        )
        placement_user.set_password("PlacementPassword123!")
        placement_user.is_active = True
        placement_user.save()

        placement_2, _ = User.objects.get_or_create(
            username="placement_rohan",
            defaults={
                "email": "rohan.mehta@ascendra.edu",
                "first_name": "Rohan",
                "last_name": "Mehta",
                "role": User.Role.PLACEMENT,
            },
        )
        placement_2.set_password("PlacementPassword123!")
        placement_2.is_active = True
        placement_2.save()

        # Students (16 diverse learners across stages)
        student_specs = [
            ("student_rahul", "rahul.sharma@example.com", "Rahul", "Sharma", "National Institute of Technology", "B.Tech Computer Science", 2026, "Full Stack Cloud Architecture", "Cloud Solutions Architect", StudentProfile.Status.LEARNING, False),
            ("student_priya", "priya.patel@example.com", "Priya", "Patel", "St. Xavier's Engineering College", "B.E. Information Technology", 2026, "Full Stack Cloud Architecture", "Senior Full Stack Engineer", StudentProfile.Status.PLACEMENT_READY, True),
            ("student_aarav", "aarav.nair@example.com", "Aarav", "Nair", "PES University", "B.Tech CS & AI", 2026, "AI & Machine Learning Engineering", "ML Platform Engineer", StudentProfile.Status.PLACEMENT_READY, True),
            ("student_ananya", "ananya.iyer@example.com", "Ananya", "Iyer", "RV College of Engineering", "B.E. Computer Science", 2026, "Full Stack Cloud Architecture", "Frontend Systems Lead", StudentProfile.Status.PLACED, True),
            ("student_kabir", "kabir.verma@example.com", "Kabir", "Verma", "VIT Vellore", "B.Tech Software Engineering", 2026, "DevOps & SRE Mastery", "Site Reliability Engineer", StudentProfile.Status.PLACEMENT_READY, True),
            ("student_sneha", "sneha.kulkarni@example.com", "Sneha", "Kulkarni", "COEP Technological University", "B.Tech IT", 2026, "Data Engineering & Analytics", "Data Platform Engineer", StudentProfile.Status.LEARNING, False),
            ("student_vikram", "vikram.reddy@example.com", "Vikram", "Reddy", "IIIT Hyderabad", "B.Tech CSE", 2026, "AI & Machine Learning Engineering", "Applied AI Scientist", StudentProfile.Status.PLACED, True),
            ("student_meera", "meera.joshi@example.com", "Meera", "Joshi", "Manipal Institute of Technology", "B.Tech CCE", 2026, "Cybersecurity & Cloud Defense", "Cloud Security Engineer", StudentProfile.Status.PLACEMENT_READY, True),
            ("student_dev", "dev.malhotra@example.com", "Dev", "Malhotra", "DTU Delhi", "B.Tech Software Engg", 2026, "Full Stack Cloud Architecture", "Distributed Systems Dev", StudentProfile.Status.LEARNING, False),
            ("student_tara", "tara.singh@example.com", "Tara", "Singh", "BMS College of Engineering", "B.E. ISE", 2026, "Mobile Product Engineering", "Cross-Platform Architect", StudentProfile.Status.PLACED, True),
            ("student_ishaan", "ishaan.bose@example.com", "Ishaan", "Bose", "Jadavpur University", "B.E. CSE", 2026, "DevOps & SRE Mastery", "Platform Infrastructure Dev", StudentProfile.Status.NOT_PLACED, True),
            ("student_nisha", "nisha.menon@example.com", "Nisha", "Menon", "CET Trivandrum", "B.Tech CS", 2026, "Data Engineering & Analytics", "Analytics Engineer", StudentProfile.Status.LEARNING, False),
            ("student_rohit", "rohit.das@example.com", "Rohit", "Das", "NIT Surathkal", "B.Tech IT", 2026, "Cybersecurity & Cloud Defense", "Security Architect", StudentProfile.Status.LEARNING, False),
            ("student_kavya", "kavya.rao@example.com", "Kavya", "Rao", "MSRIT Bengaluru", "B.E. CSE", 2026, "Full Stack Cloud Architecture", "Product Engineer", StudentProfile.Status.PLACEMENT_READY, True),
        ]

        student_profiles = {}
        for uname, email, fn, ln, college, qual, grad_yr, cname, goal, st, completed in student_specs:
            u, _ = User.objects.get_or_create(
                username=uname,
                defaults={"email": email, "first_name": fn, "last_name": ln, "role": User.Role.STUDENT},
            )
            u.set_password("StudentPassword123!")
            u.is_active = True
            u.save()

            prof, _ = StudentProfile.objects.get_or_create(
                user=u,
                defaults={
                    "phone": "+91 98765 43210",
                    "college": college,
                    "qualification": qual,
                    "graduation_year": grad_yr,
                    "course_name": cname,
                    "career_goal": goal,
                    "status": st,
                    "course_completed": completed,
                    "course_completed_date": datetime.date(2026, 10, 1) if completed else None,
                    "is_alumni_eligible": completed,
                    "github_url": f"https://github.com/{uname.replace('_', '-')}",
                    "linkedin_url": f"https://linkedin.com/in/{uname.replace('_', '-')}",
                    "portfolio_url": f"https://{uname.replace('_', '')}.dev",
                },
            )
            student_profiles[uname] = prof

        rahul_profile = student_profiles["student_rahul"]
        priya_profile = student_profiles["student_priya"]

        # Alumni (6 distinguished graduates)
        alumni_specs = [
            ("alumni_david", "david.chen@example.com", "David", "Chen", "Institute of Technology & Science", "M.S. Software Engineering", 2025, "CloudScale Systems", "Lead Software Architect", 3.5, "Cloud SaaS / Enterprise Tech", "San Francisco, CA / Bengaluru", "Kubernetes, Microservices, Go, React, Distributed Databases"),
            ("alumni_elena", "elena.rostova@example.com", "Elena", "Rostova", "IIT Bombay", "B.Tech CS", 2024, "QuantumGrid AI", "Senior ML Infrastructure Engineer", 4.0, "Artificial Intelligence", "Bengaluru / Remote", "PyTorch, CUDA, Vector DBs, FastAPI, Ray"),
            ("alumni_arjun", "arjun.desai@example.com", "Arjun", "Desai", "NIT Trichy", "B.Tech ECE", 2024, "FinPulse Tech", "Staff Backend Engineer", 4.5, "FinTech Infrastructure", "Mumbai", "Go, Kafka, PostgreSQL, High-Frequency Ledger Systems"),
            ("alumni_sophia", "sophia.lin@example.com", "Sophia", "Lin", "BITS Pilani", "B.E. CS", 2025, "AeroStack Labs", "Senior Product Engineer", 2.5, "Developer Tools", "Hyderabad / Hybrid", "TypeScript, React 19, GraphQL, Design Systems"),
            ("alumni_omar", "omar.farooq@example.com", "Omar", "Farooq", "Anna University", "M.C.A.", 2023, "CyberShield Corp", "Principal Cloud Security Lead", 5.0, "Cybersecurity", "Pune", "Zero-Trust IAM, Terraform, AWS Security, Go"),
        ]

        alumni_users = {}
        alumni_profiles = {}
        for uname, email, fn, ln, college, qual, grad_yr, comp, title, exp, ind, loc, skills_sum in alumni_specs:
            au, _ = User.objects.get_or_create(
                username=uname,
                defaults={"email": email, "first_name": fn, "last_name": ln, "role": User.Role.ALUMNI},
            )
            au.set_password("AlumniPassword123!")
            au.is_active = True
            au.save()
            alumni_users[uname] = au

            ap, _ = StudentProfile.objects.get_or_create(
                user=au,
                defaults={
                    "phone": "+1 415 555 2671",
                    "college": college,
                    "qualification": qual,
                    "graduation_year": grad_yr,
                    "course_name": "Full Stack Cloud Architecture",
                    "career_goal": "Engineering Leadership",
                    "status": StudentProfile.Status.PLACED,
                    "course_completed": True,
                    "course_completed_date": datetime.date(grad_yr, 6, 15),
                    "is_alumni_eligible": True,
                    "alumni_activated_at": timezone.now() - datetime.timedelta(days=200),
                    "alumni_activated_by": admin_user,
                    "github_url": f"https://github.com/{uname.replace('_', '-')}",
                    "linkedin_url": f"https://linkedin.com/in/{uname.replace('_', '-')}",
                    "portfolio_url": f"https://{uname.replace('_', '')}.io",
                },
            )
            alumni_profiles[uname] = ap

            ProfessionalProfile.objects.get_or_create(
                student=ap,
                defaults={
                    "current_company": comp,
                    "current_job_title": title,
                    "years_of_experience": exp,
                    "target_role": "VP of Engineering",
                    "career_goal": "Scaling resilient cloud-native platforms and mentoring new grads",
                    "industry": ind,
                    "location": loc,
                    "skills_summary": skills_sum,
                    "linkedin_url": f"https://linkedin.com/in/{uname.replace('_', '-')}",
                },
            )

        alumni_david_user = alumni_users["alumni_david"]
        david_profile = alumni_profiles["alumni_david"]

        AlumniActivationLog.objects.get_or_create(
            student=david_profile,
            defaults={
                "activated_by": admin_user,
                "notes": "Graduated top of cohort with distinction; placed at CloudScale Systems.",
            },
        )

        # 2. COURSES, MODULES & LEARNING MATERIALS
        course_specs = [
            ("Full Stack Cloud Architecture", "FSCA-2026", 6, "Comprehensive engineering curriculum covering React 19, Django REST microservices, PostgreSQL data modeling, and cloud deployments."),
            ("AI & Machine Learning Engineering", "AIME-2026", 8, "Deep dive into machine learning pipelines, LLM fine-tuning, vector search embeddings, and enterprise AI product integrations."),
            ("DevOps & SRE Mastery", "DOSR-2026", 5, "Production Kubernetes, Terraform IaC, observability with Prometheus/Grafana, and automated CI/CD release pipelines."),
            ("Data Engineering & Analytics", "DEAN-2026", 6, "Modern lakehouse architecture, dbt transformations, Apache Spark, Kafka streaming, and executive BI dashboards."),
            ("Cybersecurity & Cloud Defense", "CSCD-2026", 5, "Application security, zero-trust cloud IAM, penetration testing workflows, and threat detection engineering."),
            ("Mobile Product Engineering", "MOPE-2026", 4, "Cross-platform mobile architecture, offline-first sync, animations, and app-store release engineering."),
        ]

        courses = {}
        for name, code, dur, desc in course_specs:
            c, _ = Course.objects.get_or_create(
                name=name,
                defaults={"code": code, "duration_months": dur, "description": desc, "is_active": True},
            )
            courses[code] = c

        course1 = courses["FSCA-2026"]
        course2 = courses["AIME-2026"]

        mod1, _ = CourseModule.objects.get_or_create(
            course=course1,
            title="Modern Frontend Engineering with React & Tailwind",
            defaults={"order": 1, "duration_weeks": 4, "description": "Component architecture, custom hooks, state management, and responsive design systems."},
        )
        mod2, _ = CourseModule.objects.get_or_create(
            course=course1,
            title="Backend Systems, APIs & PostgreSQL Modeling",
            defaults={"order": 2, "duration_weeks": 6, "description": "Django REST Framework, relational normalization, indexing, and JWT authentication."},
        )
        mod3, _ = CourseModule.objects.get_or_create(
            course=course1,
            title="Cloud Deployment, CI/CD & Containerization",
            defaults={"order": 3, "duration_weeks": 4, "description": "Docker multi-stage builds, GitHub Actions CI/CD, and zero-downtime cloud releases."},
        )
        mod_ai1, _ = CourseModule.objects.get_or_create(
            course=course2,
            title="Applied Deep Learning & Transformer Architectures",
            defaults={"order": 1, "duration_weeks": 5, "description": "PyTorch foundations, attention mechanisms, and fine-tuning domain LLMs."},
        )
        mod_ai2, _ = CourseModule.objects.get_or_create(
            course=course2,
            title="RAG Pipelines, Vector Databases & Inference APIs",
            defaults={"order": 2, "duration_weeks": 5, "description": "Semantic retrieval, pgvector indexing, and low-latency model serving."},
        )

        LearningMaterial.objects.get_or_create(
            module=mod1,
            title="React 19 State Patterns & Performance Optimization",
            defaults={"material_type": LearningMaterial.MaterialType.DOCUMENT, "description": "Architecture guide on hooks, suspense boundaries, and memoization.", "external_url": "https://react.dev"},
        )
        LearningMaterial.objects.get_or_create(
            module=mod2,
            title="PostgreSQL Indexing & Query Optimization Handbook",
            defaults={"material_type": LearningMaterial.MaterialType.NOTES, "description": "B-Tree/GIN indexes and eliminating N+1 queries in Django ORM.", "external_url": "https://www.postgresql.org/docs/"},
        )
        LearningMaterial.objects.get_or_create(
            module=mod3,
            title="Production Docker & Kubernetes Field Guide",
            defaults={"material_type": LearningMaterial.MaterialType.VIDEO, "description": "Hands-on walkthrough of container hardening and readiness probes.", "external_url": "https://docs.docker.com/"},
        )
        LearningMaterial.objects.get_or_create(
            module=mod_ai1,
            title="Transformer Attention & LoRA Fine-Tuning Lab",
            defaults={"material_type": LearningMaterial.MaterialType.CODE, "description": "Interactive notebook for parameter-efficient LLM fine-tuning.", "external_url": "https://pytorch.org/docs/"},
        )

        # 3. BATCHES & ENROLLMENTS
        batch_specs = [
            ("Alpha Batch 2026-Q1", course1, trainers["trainer_alex"], datetime.date(2026, 1, 15), datetime.date(2026, 7, 15)),
            ("Beta Cloud Cohort 2026-Q2", course1, trainers["trainer_alex"], datetime.date(2026, 4, 1), datetime.date(2026, 10, 1)),
            ("AI Vanguard Cohort 2026", course2, trainers["trainer_maya"], datetime.date(2026, 2, 1), datetime.date(2026, 9, 30)),
            ("SRE Cloud Ops 2026", courses["DOSR-2026"], trainers["trainer_liam"], datetime.date(2026, 3, 10), datetime.date(2026, 8, 10)),
            ("Data Lakehouse 2026", courses["DEAN-2026"], trainers["trainer_maya"], datetime.date(2026, 3, 15), datetime.date(2026, 9, 15)),
            ("SecOps Shield 2026", courses["CSCD-2026"], trainers["trainer_liam"], datetime.date(2026, 5, 1), datetime.date(2026, 10, 1)),
        ]

        batches = {}
        for bname, c_obj, tr, sd, ed in batch_specs:
            b, _ = Batch.objects.get_or_create(
                name=bname,
                course=c_obj,
                defaults={"trainer": tr, "start_date": sd, "end_date": ed, "is_active": True},
            )
            batches[bname] = b

        batch_alpha = batches["Alpha Batch 2026-Q1"]
        batch_beta = batches["Beta Cloud Cohort 2026-Q2"]
        batch_ai = batches["AI Vanguard Cohort 2026"]

        enrollment_map = [
            ("student_rahul", batch_alpha, False),
            ("student_priya", batch_alpha, True),
            ("student_ananya", batch_alpha, True),
            ("student_kavya", batch_alpha, True),
            ("student_dev", batch_beta, False),
            ("student_tara", batch_beta, True),
            ("student_aarav", batch_ai, True),
            ("student_vikram", batch_ai, True),
            ("student_kabir", batches["SRE Cloud Ops 2026"], True),
            ("student_ishaan", batches["SRE Cloud Ops 2026"], True),
            ("student_sneha", batches["Data Lakehouse 2026"], False),
            ("student_nisha", batches["Data Lakehouse 2026"], False),
            ("student_meera", batches["SecOps Shield 2026"], True),
            ("student_rohit", batches["SecOps Shield 2026"], False),
        ]

        for uname, b_obj, comp in enrollment_map:
            Enrollment.objects.get_or_create(
                student=student_profiles[uname],
                batch=b_obj,
                defaults={
                    "is_active": True,
                    "completed": comp,
                    "completed_at": datetime.date(2026, 10, 1) if comp else None,
                },
            )

        # Sample Attendance records
        for days_ago, st in [(1, Attendance.Status.PRESENT), (2, Attendance.Status.PRESENT), (3, Attendance.Status.LATE), (4, Attendance.Status.PRESENT)]:
            d = datetime.date.today() - datetime.timedelta(days=days_ago)
            for uname in ["student_rahul", "student_priya", "student_ananya", "student_kavya"]:
                Attendance.objects.get_or_create(
                    batch=batch_alpha,
                    student=student_profiles[uname],
                    date=d,
                    defaults={"status": st},
                )

        # 4. ASSESSMENTS, QUESTIONS & SUBMISSIONS
        quiz1, _ = Assessment.objects.get_or_create(
            title="Full Stack Architecture Midterm Assessment",
            course=course1,
            batch=batch_alpha,
            defaults={
                "description": "Evaluates REST principles, React lifecycle, and SQL query optimization.",
                "assessment_type": Assessment.AssessmentType.QUIZ,
                "total_marks": 50,
                "passing_marks": 30,
                "duration_minutes": 45,
                "due_date": timezone.now() + datetime.timedelta(days=14),
                "is_published": True,
                "created_by": trainer_user,
            },
        )
        q1, _ = Question.objects.get_or_create(
            assessment=quiz1,
            order=1,
            defaults={
                "question_text": "Which Django ORM method prevents N+1 queries when fetching ForeignKey relations?",
                "question_type": Question.QuestionType.MULTIPLE_CHOICE,
                "marks": 25,
                "options": [
                    {"text": "select_related()", "is_correct": True},
                    {"text": "filter_related()", "is_correct": False},
                    {"text": "defer_foreign()", "is_correct": False},
                    {"text": "query_cache()", "is_correct": False},
                ],
                "correct_answer": "select_related()",
            },
        )
        q2, _ = Question.objects.get_or_create(
            assessment=quiz1,
            order=2,
            defaults={
                "question_text": "True or False: HTTP POST requests are defined as idempotent by default in REST.",
                "question_type": Question.QuestionType.TRUE_FALSE,
                "marks": 25,
                "options": [
                    {"text": "True", "is_correct": False},
                    {"text": "False", "is_correct": True},
                ],
                "correct_answer": "False",
            },
        )

        quiz2, _ = Assessment.objects.get_or_create(
            title="React State & Performance Mastery Quiz",
            course=course1,
            batch=batch_alpha,
            defaults={
                "description": "Covers React rendering lifecycle, memoization, and accessible component design.",
                "assessment_type": Assessment.AssessmentType.QUIZ,
                "total_marks": 40,
                "passing_marks": 24,
                "duration_minutes": 30,
                "due_date": timezone.now() + datetime.timedelta(days=10),
                "is_published": True,
                "created_by": trainer_user,
            },
        )
        Question.objects.get_or_create(
            assessment=quiz2,
            order=1,
            defaults={
                "question_text": "Which hook memoizes an expensive computed value between renders?",
                "question_type": Question.QuestionType.MULTIPLE_CHOICE,
                "marks": 20,
                "options": [
                    {"text": "useMemo", "is_correct": True},
                    {"text": "useRef", "is_correct": False},
                    {"text": "useLayoutEffect", "is_correct": False},
                    {"text": "useId", "is_correct": False},
                ],
                "correct_answer": "useMemo",
            },
        )
        Question.objects.get_or_create(
            assessment=quiz2,
            order=2,
            defaults={
                "question_text": "Which hook avoids recreating callback function references across child re-renders?",
                "question_type": Question.QuestionType.MULTIPLE_CHOICE,
                "marks": 20,
                "options": [
                    {"text": "useCallback", "is_correct": True},
                    {"text": "useReducer", "is_correct": False},
                    {"text": "useDebugValue", "is_correct": False},
                    {"text": "useTransition", "is_correct": False},
                ],
                "correct_answer": "useCallback",
            },
        )

        code_task, _ = Assessment.objects.get_or_create(
            title="API Rate Limiter & Caching System Design",
            course=course1,
            batch=batch_alpha,
            defaults={
                "description": "Design and implement a token-bucket rate limiter middleware with Redis backing.",
                "assessment_type": Assessment.AssessmentType.CODING_CHALLENGE,
                "total_marks": 100,
                "passing_marks": 60,
                "duration_minutes": 90,
                "due_date": timezone.now() + datetime.timedelta(days=7),
                "is_published": True,
                "created_by": trainer_user,
            },
        )
        q_code, _ = Question.objects.get_or_create(
            assessment=code_task,
            order=1,
            defaults={
                "question_text": "Explain your token-bucket algorithm and atomic Redis update strategy.",
                "question_type": Question.QuestionType.CODE,
                "marks": 100,
                "options": [],
                "correct_answer": "Lua script or atomic pipeline",
            },
        )

        # Submissions (evaluated + pending for trainer_alex grading queue!)
        Submission.objects.get_or_create(
            assessment=quiz1,
            student=priya_profile,
            defaults={
                "status": Submission.Status.EVALUATED,
                "total_score": 48.0,
                "passed": True,
                "trainer_feedback": "Exceptional clarity on REST architecture and Django optimization.",
                "evaluated_by": trainer_user,
                "evaluated_at": timezone.now(),
            },
        )
        Submission.objects.get_or_create(
            assessment=quiz1,
            student=student_profiles["student_ananya"],
            defaults={
                "status": Submission.Status.EVALUATED,
                "total_score": 45.0,
                "passed": True,
                "trainer_feedback": "Strong command of ORM query plans.",
                "evaluated_by": trainer_user,
                "evaluated_at": timezone.now(),
            },
        )

        pending_sub_rahul, _ = Submission.objects.get_or_create(
            assessment=code_task,
            student=rahul_profile,
            defaults={"status": Submission.Status.PENDING},
        )
        StudentAnswer.objects.get_or_create(
            submission=pending_sub_rahul,
            question=q_code,
            defaults={
                "answer_text": "Using a Redis Lua script to atomically refill tokens based on elapsed timestamp and decrement token count per user key.",
            },
        )
        pending_sub_kavya, _ = Submission.objects.get_or_create(
            assessment=code_task,
            student=student_profiles["student_kavya"],
            defaults={"status": Submission.Status.PENDING},
        )
        StudentAnswer.objects.get_or_create(
            submission=pending_sub_kavya,
            question=q_code,
            defaults={
                "answer_text": "Sliding window log using Redis ZSET with ZREMRANGEBYSCORE and ZCARD inside a MULTI/EXEC transaction.",
            },
        )

        # 5. SKILLS & CERTIFICATIONS
        cat_fe, _ = SkillCategory.objects.get_or_create(name="Frontend Engineering", defaults={"description": "Modern web interfaces and UI systems"})
        cat_be, _ = SkillCategory.objects.get_or_create(name="Backend & Data", defaults={"description": "Server APIs and relational databases"})
        cat_cloud, _ = SkillCategory.objects.get_or_create(name="Cloud & DevOps", defaults={"description": "Containers, CI/CD, and cloud platforms"})
        cat_ai, _ = SkillCategory.objects.get_or_create(name="AI & Data Science", defaults={"description": "ML pipelines, LLMs, and analytics"})

        skill_defs = [
            (cat_fe, "React 19"), (cat_fe, "TypeScript"), (cat_fe, "Tailwind CSS"), (cat_fe, "Next.js"),
            (cat_be, "Django & DRF"), (cat_be, "PostgreSQL"), (cat_be, "Redis"), (cat_be, "FastAPI"),
            (cat_cloud, "Docker & Containers"), (cat_cloud, "Kubernetes"), (cat_cloud, "AWS Architecture"), (cat_cloud, "Terraform"),
            (cat_ai, "PyTorch"), (cat_ai, "LangChain & RAG"), (cat_ai, "Apache Spark"),
        ]
        skills_map = {}
        for cat, sname in skill_defs:
            sk, _ = Skill.objects.get_or_create(category=cat, name=sname)
            skills_map[sname] = sk

        student_skill_links = [
            (priya_profile, "React 19", StudentSkill.Proficiency.EXPERT, True),
            (priya_profile, "Django & DRF", StudentSkill.Proficiency.ADVANCED, True),
            (priya_profile, "PostgreSQL", StudentSkill.Proficiency.ADVANCED, True),
            (priya_profile, "TypeScript", StudentSkill.Proficiency.INTERMEDIATE, False),
            (rahul_profile, "PostgreSQL", StudentSkill.Proficiency.INTERMEDIATE, True),
            (rahul_profile, "Docker & Containers", StudentSkill.Proficiency.INTERMEDIATE, False),
            (rahul_profile, "React 19", StudentSkill.Proficiency.ADVANCED, False),
            (student_profiles["student_ananya"], "React 19", StudentSkill.Proficiency.EXPERT, True),
            (student_profiles["student_ananya"], "Tailwind CSS", StudentSkill.Proficiency.EXPERT, True),
            (student_profiles["student_aarav"], "PyTorch", StudentSkill.Proficiency.ADVANCED, True),
            (student_profiles["student_aarav"], "LangChain & RAG", StudentSkill.Proficiency.ADVANCED, False),
            (student_profiles["student_kabir"], "Kubernetes", StudentSkill.Proficiency.ADVANCED, True),
            (student_profiles["student_kabir"], "Terraform", StudentSkill.Proficiency.INTERMEDIATE, False),
            (student_profiles["student_kavya"], "Django & DRF", StudentSkill.Proficiency.ADVANCED, False),
        ]
        for st_p, sk_name, lvl, ver in student_skill_links:
            StudentSkill.objects.get_or_create(
                student=st_p,
                skill=skills_map[sk_name],
                defaults={"proficiency_level": lvl, "verified_by_trainer": ver},
            )

        Certification.objects.get_or_create(
            student=priya_profile,
            title="AWS Certified Solutions Architect – Associate",
            defaults={"issuing_organization": "Amazon Web Services", "issue_date": datetime.date(2026, 4, 10), "credential_id": "AWS-PSA-982341", "credential_url": "https://aws.amazon.com/verification"},
        )
        Certification.objects.get_or_create(
            student=priya_profile,
            title="Meta Front-End Developer Professional Certificate",
            defaults={"issuing_organization": "Coursera / Meta", "issue_date": datetime.date(2026, 2, 18), "credential_id": "META-FE-44102", "credential_url": "https://coursera.org"},
        )
        Certification.objects.get_or_create(
            student=rahul_profile,
            title="Docker Certified Associate (DCA)",
            defaults={"issuing_organization": "Mirantis / Docker", "issue_date": datetime.date(2026, 6, 5), "credential_id": "DCA-2026-7712", "credential_url": "https://docker.com"},
        )

        # 6. PROJECTS
        proj_specs = [
            (priya_profile, "ApexTrade — Real-time Financial Portfolio Platform", "High-throughput securities tracking and portfolio analytics", "Architected an institutional-grade portfolio dashboard with WebSocket price streaming, risk rebalancing, and PostgreSQL time-series indexing.", "https://github.com/priya-patel/apextrade", "https://apextrade-demo.vercel.app", ["React 19", "Django REST", "PostgreSQL", "WebSockets"], True, 5, "Outstanding production architecture and clean DB normalization."),
            (priya_profile, "PulseOps — Distributed Incident Telemetry Hub", "Real-time microservice health & SLA alerting workbench", "Built an OpenTelemetry log aggregator with automated anomaly alerts and interactive latency heatmaps.", "https://github.com/priya-patel/pulseops", "https://pulseops.vercel.app", ["TypeScript", "FastAPI", "Redis", "Docker"], False, None, None),
            (rahul_profile, "CloudMesh — Multi-Region Deployment Orchestrator", "Zero-downtime blue/green container rollout controller", "Implemented declarative manifest diffing, health-check rollbacks, and Terraform state snapshots.", "https://github.com/rahul-sharma/cloudmesh", "https://cloudmesh.dev", ["Python", "Docker", "Terraform", "PostgreSQL"], True, None, None),
            (student_profiles["student_aarav"], "DocuMind — Enterprise Hybrid RAG Copilot", "Sub-second semantic citation search across PDFs & wikis", "Combined dense pgvector embeddings with BM25 reranking and streaming citations.", "https://github.com/aarav-nair/documind", "https://documind.ai", ["PyTorch", "pgvector", "FastAPI", "React"], True, 5, "Impressive retrieval precision and clean evaluation harness."),
            (student_profiles["student_ananya"], "DesignForge — Collaborative UI Token Studio", "Live Tailwind & Figma design-token synchronization tool", "Built real-time canvas previews with WCAG contrast checking and CSS variable export.", "https://github.com/ananya-iyer/designforge", "https://designforge.app", ["React 19", "Tailwind CSS", "TypeScript"], True, 5, "Polished UX craft and rock-solid keyboard accessibility."),
        ]

        for st_p, title, tag, desc, gh, live, techs, feat, rating, fb in proj_specs:
            pr, _ = Project.objects.get_or_create(
                student=st_p,
                title=title,
                defaults={
                    "tagline": tag,
                    "description": desc,
                    "github_url": gh,
                    "live_url": live,
                    "completion_date": datetime.date(2026, 8, 20),
                    "is_featured": feat,
                    "status": Project.Status.COMPLETED,
                },
            )
            for tname in techs:
                ProjectTechnology.objects.get_or_create(project=pr, name=tname)
            if rating:
                ProjectReview.objects.get_or_create(
                    project=pr,
                    reviewer=trainer_user,
                    defaults={"rating": rating, "feedback": fb},
                )

        # 7. COMPANIES, VACANCIES, APPLICATIONS, INTERVIEWS & PLACEMENTS
        comp_specs = [
            ("Novus Cloud Technologies", "Enterprise Cloud & SaaS", "Bengaluru / Remote", "Evelyn Wright", "careers@novuscloud.example.com", "https://novuscloud.example.com"),
            ("Stratos FinTech Global", "FinTech & Payments", "Mumbai / Hybrid", "Arthur Pendelton", "talent@stratosfin.example.com", "https://stratosfin.example.com"),
            ("CloudScale Systems", "Distributed Infrastructure", "San Francisco / Bengaluru", "Hannah Vance", "hiring@cloudscale.example.com", "https://cloudscale.example.com"),
            ("QuantumGrid AI", "Applied AI & LLMs", "Bengaluru", "Dr. Vikram Sen", "jobs@quantumgrid.example.com", "https://quantumgrid.example.com"),
            ("AeroStack Labs", "Developer Platforms", "Hyderabad / Remote", "Claire Brooks", "people@aerostack.example.com", "https://aerostack.example.com"),
            ("CyberShield Corp", "Cloud Security", "Pune / Hybrid", "Raghavendra Rao", "security-jobs@cybershield.example.com", "https://cybershield.example.com"),
            ("DataForge Analytics", "Data Lakehouse & BI", "Chennai / Hybrid", "Neha Kapoor", "careers@dataforge.example.com", "https://dataforge.example.com"),
        ]
        companies = {}
        for cname, ind, loc, cp, em, web in comp_specs:
            co, _ = Company.objects.get_or_create(
                name=cname,
                defaults={"industry": ind, "location": loc, "contact_person": cp, "email": em, "website": web, "phone": "+91 80 4123 4567"},
            )
            companies[cname] = co

        vacancy_specs = [
            ("Novus Cloud Technologies", "Associate Cloud Software Engineer", "Build resilient microservices, REST APIs, and modern React web portals.", JobVacancy.JobType.FULL_TIME, "Bengaluru / Hybrid", "9.5 - 13 LPA", 5, "React, Python, Django, PostgreSQL"),
            ("Stratos FinTech Global", "Full Stack FinTech Developer", "Develop real-time payment ledger UIs and high-integrity transaction APIs.", JobVacancy.JobType.FULL_TIME, "Mumbai / Hybrid", "11 - 15 LPA", 3, "React, TypeScript, PostgreSQL, Redis"),
            ("QuantumGrid AI", "Applied ML Platform Engineer", "Deploy vector search pipelines, RAG workflows, and GPU inference APIs.", JobVacancy.JobType.FULL_TIME, "Bengaluru", "14 - 18 LPA", 2, "Python, PyTorch, FastAPI, Docker"),
            ("AeroStack Labs", "Frontend Product Engineer", "Craft accessible, high-speed developer consoles and visual workflow editors.", JobVacancy.JobType.FULL_TIME, "Hyderabad / Remote", "10 - 14 LPA", 4, "React 19, TypeScript, Tailwind CSS"),
            ("CloudScale Systems", "Junior Site Reliability Engineer", "Automate Kubernetes deployments, observability, and incident response.", JobVacancy.JobType.FULL_TIME, "Bengaluru", "12 - 16 LPA", 3, "Docker, Kubernetes, Terraform, Linux"),
            ("DataForge Analytics", "Data Engineering Intern", "Build streaming ingestion jobs and analytics dbt models.", JobVacancy.JobType.INTERNSHIP, "Chennai / Remote", "45,000 / month", 6, "Python, SQL, Apache Spark"),
            ("CyberShield Corp", "Cloud Security Analyst", "Audit IAM policies, automate compliance checks, and harden cloud workloads.", JobVacancy.JobType.FULL_TIME, "Pune / Hybrid", "9 - 12 LPA", 2, "AWS, IAM, Python, Security"),
        ]
        vacancies = {}
        for cname, title, desc, jtype, loc, sal, open_cnt, req_sk in vacancy_specs:
            vac, _ = JobVacancy.objects.get_or_create(
                company=companies[cname],
                title=title,
                defaults={
                    "job_description": desc,
                    "job_type": jtype,
                    "location": loc,
                    "salary_package": sal,
                    "openings": open_cnt,
                    "application_deadline": datetime.date(2026, 12, 31),
                    "status": JobVacancy.VacancyStatus.ACTIVE,
                    "created_by": placement_user,
                },
            )
            JobEligibility.objects.get_or_create(
                vacancy=vac,
                defaults={
                    "minimum_qualification": "B.Tech / B.E. / M.C.A.",
                    "required_skills": req_sk,
                    "min_graduation_year": 2025,
                    "max_graduation_year": 2026,
                    "must_be_placement_ready": True,
                },
            )
            vacancies[title] = vac

        # Applications & Interviews
        app_specs = [
            ("Associate Cloud Software Engineer", priya_profile, JobApplication.ApplicationStatus.SHORTLISTED, "Built ApexTrade & PulseOps using React 19, Django REST, and PostgreSQL."),
            ("Full Stack FinTech Developer", priya_profile, JobApplication.ApplicationStatus.INTERVIEW_SCHEDULED, "Experienced with WebSocket real-time portfolios and SQL indexing."),
            ("Frontend Product Engineer", student_profiles["student_ananya"], JobApplication.ApplicationStatus.OFFERED, "Creator of DesignForge design token studio."),
            ("Applied ML Platform Engineer", student_profiles["student_aarav"], JobApplication.ApplicationStatus.INTERVIEW_SCHEDULED, "Built DocuMind enterprise RAG platform."),
            ("Applied ML Platform Engineer", student_profiles["student_vikram"], JobApplication.ApplicationStatus.OFFERED, "Published benchmark work on vector retrieval latency."),
            ("Junior Site Reliability Engineer", student_profiles["student_kabir"], JobApplication.ApplicationStatus.SHORTLISTED, "Hands-on Kubernetes & Terraform automation experience."),
            ("Associate Cloud Software Engineer", student_profiles["student_kavya"], JobApplication.ApplicationStatus.APPLIED, "Strong full-stack engineering background."),
            ("Cloud Security Analyst", student_profiles["student_meera"], JobApplication.ApplicationStatus.SHORTLISTED, "Focused on cloud IAM and zero-trust controls."),
            ("Junior Site Reliability Engineer", student_profiles["student_ishaan"], JobApplication.ApplicationStatus.REJECTED, "Applied for SRE cohort track."),
        ]

        apps_created = []
        for vtitle, st_p, ast, note in app_specs:
            ap_obj, _ = JobApplication.objects.get_or_create(
                vacancy=vacancies[vtitle],
                student=st_p,
                defaults={"status": ast, "cover_note": note},
            )
            apps_created.append(ap_obj)

        Interview.objects.get_or_create(
            application=apps_created[0],
            round_name="Round 1: Technical Architecture & Code Review",
            defaults={
                "scheduled_date": timezone.now() + datetime.timedelta(days=2),
                "mode": Interview.Mode.ONLINE,
                "meeting_link": "https://meet.google.com/abc-defg-hij",
                "interviewer_name": "Senior Staff Architect - Novus Cloud",
                "status": Interview.Status.SCHEDULED,
            },
        )
        Interview.objects.get_or_create(
            application=apps_created[1],
            round_name="Round 2: FinTech System Design",
            defaults={
                "scheduled_date": timezone.now() + datetime.timedelta(days=4),
                "mode": Interview.Mode.ONLINE,
                "meeting_link": "https://meet.google.com/stratos-fintech-r2",
                "interviewer_name": "VP Engineering - Stratos FinTech",
                "status": Interview.Status.SCHEDULED,
            },
        )
        Interview.objects.get_or_create(
            application=apps_created[3],
            round_name="Applied ML & RAG Deep Dive",
            defaults={
                "scheduled_date": timezone.now() + datetime.timedelta(days=3),
                "mode": Interview.Mode.ONLINE,
                "meeting_link": "https://meet.google.com/quantum-ai-loop",
                "interviewer_name": "Dr. Vikram Sen - QuantumGrid AI",
                "status": Interview.Status.SCHEDULED,
            },
        )
        Interview.objects.get_or_create(
            application=apps_created[2],
            round_name="Final Cultural & Leadership Fit",
            defaults={
                "scheduled_date": timezone.now() - datetime.timedelta(days=5),
                "mode": Interview.Mode.IN_PERSON,
                "meeting_link": "AeroStack Campus Office, Hyderabad",
                "interviewer_name": "Head of Product - AeroStack Labs",
                "status": Interview.Status.COMPLETED,
                "feedback": "Strong ownership, crisp UI engineering depth. Recommended for Offer.",
            },
        )

        # Official Placement Records (multi-company bar chart data!)
        placement_records = [
            (david_profile, "CloudScale Systems", "Cloud Platform Engineer", "14.5 LPA", datetime.date(2025, 7, 10), PlacementRecord.JoiningStatus.JOINED),
            (alumni_profiles["alumni_elena"], "QuantumGrid AI", "ML Infrastructure Engineer", "16.0 LPA", datetime.date(2024, 8, 1), PlacementRecord.JoiningStatus.JOINED),
            (alumni_profiles["alumni_arjun"], "Stratos FinTech Global", "Backend Systems Engineer", "13.5 LPA", datetime.date(2024, 7, 20), PlacementRecord.JoiningStatus.JOINED),
            (alumni_profiles["alumni_sophia"], "AeroStack Labs", "Product Engineer", "12.0 LPA", datetime.date(2025, 6, 25), PlacementRecord.JoiningStatus.JOINED),
            (alumni_profiles["alumni_omar"], "CyberShield Corp", "Cloud Security Engineer", "15.0 LPA", datetime.date(2023, 8, 5), PlacementRecord.JoiningStatus.JOINED),
            (student_profiles["student_ananya"], "AeroStack Labs", "Frontend Product Engineer", "12.5 LPA", datetime.date(2026, 10, 15), PlacementRecord.JoiningStatus.YET_TO_JOIN),
            (student_profiles["student_vikram"], "QuantumGrid AI", "Applied ML Platform Engineer", "16.5 LPA", datetime.date(2026, 10, 18), PlacementRecord.JoiningStatus.YET_TO_JOIN),
            (student_profiles["student_tara"], "Novus Cloud Technologies", "Mobile & Cloud Engineer", "11.0 LPA", datetime.date(2026, 10, 20), PlacementRecord.JoiningStatus.JOINED),
        ]
        for st_p, cname, role_off, ctc, pdate, jstat in placement_records:
            PlacementRecord.objects.get_or_create(
                student=st_p,
                company=companies[cname],
                defaults={
                    "role_offered": role_off,
                    "ctc": ctc,
                    "placed_date": pdate,
                    "joining_status": jstat,
                    "created_by": placement_user,
                },
            )

        # 8. CAREERS, MILESTONES, MENTORSHIP & EVENTS
        milestone_specs = [
            (david_profile, "Promoted to Lead Software Architect at CloudScale", "CloudScale Systems", datetime.date(2026, 3, 1), "Leading the core distributed streaming platform team handling 400k req/sec."),
            (alumni_profiles["alumni_elena"], "Published Open-Source pgvector Reranker Benchmark", "QuantumGrid AI", datetime.date(2026, 5, 12), "Open-sourced hybrid retrieval toolkit now used by 2,400+ developers."),
            (alumni_profiles["alumni_arjun"], "Architected Zero-Downtime Payment Settlement Engine", "FinPulse Tech", datetime.date(2026, 7, 19), "Scaled real-time UPI & ledger reconciliation to 99.999% uptime."),
            (alumni_profiles["alumni_sophia"], "Speaker at React India Engineering Summit", "AeroStack Labs", datetime.date(2026, 9, 4), "Delivered talk on accessible multi-theme design token architectures."),
        ]
        for st_p, mtitle, comp, dt, desc in milestone_specs:
            CareerMilestone.objects.get_or_create(
                student=st_p,
                title=mtitle,
                defaults={"company_name": comp, "date_achieved": dt, "description": desc, "is_public": True},
            )

        event_specs = [
            ("Ascendra Annual Tech Summit & Alumni Panel 2026", "Keynote on scalable system design, AI in software development, and networking with alumni.", timezone.now() + datetime.timedelta(days=14), "Main Auditorium / Live Stream Online", AlumniEvent.EventType.NETWORKING),
            ("System Design Mock Interview Clinic", "Live architectural whiteboarding with alumni engineers from CloudScale and FinPulse.", timezone.now() + datetime.timedelta(days=7), "https://meet.google.com/ascendra-sd-clinic", AlumniEvent.EventType.WORKSHOP),
            ("Building Production RAG & AI Agents", "Hands-on session led by Elena Rostova covering vector indexing and evals.", timezone.now() + datetime.timedelta(days=22), "https://meet.google.com/ascendra-ai-talk", AlumniEvent.EventType.WEBINAR),
            ("Engineering Leadership & First-Year Growth Panel", "How to thrive in your first 90 days as a software engineer.", timezone.now() + datetime.timedelta(days=30), "Innovation Hub Room 402 & Zoom", AlumniEvent.EventType.REUNION),
        ]
        for etitle, edesc, edate, eloc, etype in event_specs:
            AlumniEvent.objects.get_or_create(
                title=etitle,
                defaults={"description": edesc, "event_date": edate, "location_or_link": eloc, "event_type": etype, "created_by": admin_user, "is_published": True},
            )

        mentorship_specs = [
            (alumni_david_user, priya_profile, "Career Transition to Cloud Architect & Placement Interview Strategies", Mentorship.Status.ACTIVE, "Bi-weekly Saturdays 4 PM IST", "Focused on distributed systems and portfolio storytelling."),
            (alumni_david_user, rahul_profile, "Container Orchestration & Backend Scalability Roadmap", Mentorship.Status.REQUESTED, "", "Looking for architecture feedback on CloudMesh project."),
            (alumni_david_user, student_profiles["student_kavya"], "Django REST Performance & Resume Positioning", Mentorship.Status.ACTIVE, "Wednesdays 7 PM IST", "Reviewing API caching and query optimization."),
            (alumni_users["alumni_elena"], student_profiles["student_aarav"], "Fine-Tuning & RAG Evaluation Best Practices", Mentorship.Status.ACTIVE, "Fridays 6 PM IST", "Deep dive into semantic retrieval benchmarks."),
        ]
        for alum_u, st_p, topic, mstat, sched, notes in mentorship_specs:
            Mentorship.objects.get_or_create(
                alumnus=alum_u,
                student=st_p,
                topic=topic,
                defaults={"status": mstat, "meeting_schedule": sched, "notes": notes},
            )

        # 9. ANNOUNCEMENTS & NOTIFICATIONS
        Announcement.objects.get_or_create(
            title="Ascendra Campus Recruitment Drive 2026 Officially Open",
            defaults={
                "content": "Placement-ready learners can now apply to verified vacancies from Novus Cloud, Stratos FinTech, QuantumGrid AI, and AeroStack Labs.",
                "target_role": Announcement.TargetRole.ALL,
                "created_by": admin_user,
                "is_active": True,
            },
        )
        Announcement.objects.get_or_create(
            title="Midterm Evaluation & Skill Verification Week",
            defaults={
                "content": "Faculty trainers are reviewing pending coding challenges and endorsing verified stack skills this Friday.",
                "target_role": Announcement.TargetRole.TRAINER,
                "created_by": admin_user,
                "is_active": True,
            },
        )

        notif_specs = [
            (student_profiles["student_priya"].user, "Application Shortlisted!", "Your application for Associate Cloud Software Engineer at Novus Cloud has been shortlisted.", "/student/placements"),
            (student_profiles["student_priya"].user, "Interview Scheduled — Stratos FinTech", "Round 2 System Design interview scheduled in 4 days.", "/student/placements"),
            (student_profiles["student_rahul"].user, "New Assessment Available", "React State & Performance Mastery Quiz is open for Alpha Batch.", "/student/assessments"),
            (trainer_user, "2 Pending Coding Evaluations", "Rahul Sharma and Kavya Rao submitted API Rate Limiter solutions for grading.", "/trainer/evaluations"),
            (placement_user, "3 Interviews Scheduled This Week", "Check interview schedules for Novus Cloud, Stratos FinTech, and QuantumGrid AI.", "/placement/interviews"),
            (alumni_david_user, "New Mentorship Request", "Rahul Sharma requested mentorship on Container Orchestration & Backend Scalability.", "/alumni/mentorship"),
            (admin_user, "4 Students Ready for Alumni Activation", "Graduating cohort learners have completed their courses and await Alumni promotion.", "/admin/alumni-activation"),
        ]
        for recip, ntitle, nmsg, nlink in notif_specs:
            Notification.objects.get_or_create(
                recipient=recip,
                title=ntitle,
                defaults={"message": nmsg, "link": nlink, "is_read": False},
            )

        self.stdout.write(self.style.SUCCESS("Rich Ascendra database seeding completed!"))
