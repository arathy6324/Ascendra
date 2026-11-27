from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.db.models import Q

from .models import Assessment, Question, Submission, StudentAnswer
from .serializers import (
    AssessmentSerializer,
    QuestionSerializer,
    QuestionStudentSerializer,
    SubmissionSerializer,
    StudentAnswerSerializer,
)
from accounts.permissions import IsTrainerUserRole, IsAdminUserRole


class AssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Assessment.objects.select_related("course", "batch", "created_by").prefetch_related("questions")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role == "TRAINER":
            qs = qs.filter(created_by=user)
        elif user.role in ["STUDENT", "ALUMNI"]:
            # Only published assessments for the courses/batches student is enrolled in
            qs = qs.filter(
                is_published=True
            ).filter(
                Q(batch__enrollments__student__user=user)
                | Q(batch__isnull=True, course__batches__enrollments__student__user=user)
            ).distinct()

        course_id = self.request.query_params.get("course")
        if course_id:
            qs = qs.filter(course_id=course_id)

        batch_id = self.request.query_params.get("batch")
        if batch_id:
            qs = qs.filter(batch_id=batch_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        """
        Student takes and submits the assessment.
        Auto-evaluates objective questions (MCQ/True-False).
        Marks subjective questions for trainer review.
        """
        assessment = self.get_object()
        user = request.user

        if not hasattr(user, "student_profile"):
            return Response(
                {"detail": "Only students can submit assessments."},
                status=status.HTTP_403_FORBIDDEN,
            )

        student = user.student_profile

        # Check existing submission
        existing = Submission.objects.filter(assessment=assessment, student=student).first()
        if existing:
            return Response(
                {"detail": "You have already submitted this assessment.", "submission_id": existing.id},
                status=status.HTTP_400_BAD_REQUEST,
            )

        answers_data = request.data.get("answers", [])  # list of {question_id, selected_option, answer_text}

        with transaction.atomic():
            submission = Submission.objects.create(
                assessment=assessment,
                student=student,
                status=Submission.Status.SUBMITTED,
            )

            total_score = 0
            has_subjective = False

            for item in answers_data:
                q_id = item.get("question_id")
                selected_option = item.get("selected_option", "")
                answer_text = item.get("answer_text", "")

                try:
                    q = Question.objects.get(id=q_id, assessment=assessment)
                except Question.DoesNotExist:
                    continue

                marks_obtained = None
                if q.question_type in [Question.QuestionType.MULTIPLE_CHOICE, Question.QuestionType.TRUE_FALSE]:
                    # Auto grade
                    if selected_option and selected_option.strip().lower() == q.correct_answer.strip().lower():
                        marks_obtained = q.marks
                        total_score += q.marks
                    else:
                        marks_obtained = 0
                else:
                    has_subjective = True

                StudentAnswer.objects.create(
                    submission=submission,
                    question=q,
                    selected_option=selected_option,
                    answer_text=answer_text,
                    marks_obtained=marks_obtained,
                )

            if not has_subjective:
                submission.total_score = total_score
                submission.passed = total_score >= assessment.passing_marks
                submission.status = Submission.Status.EVALUATED
                submission.evaluated_at = timezone.now()
            else:
                submission.status = Submission.Status.PENDING

            submission.save()

        serializer = SubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsTrainerUserRole]

    def get_queryset(self):
        assessment_id = self.request.query_params.get("assessment")
        qs = Question.objects.all()
        if assessment_id:
            qs = qs.filter(assessment_id=assessment_id)
        return qs


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.select_related("assessment", "student__user").prefetch_related("answers__question")

        if user.role in ["ADMIN", "PLACEMENT"] or user.is_superuser:
            pass
        elif user.role == "TRAINER":
            qs = qs.filter(assessment__created_by=user)
        elif user.role in ["STUDENT", "ALUMNI"]:
            qs = qs.filter(student__user=user)

        assessment_id = self.request.query_params.get("assessment")
        if assessment_id:
            qs = qs.filter(assessment_id=assessment_id)

        student_id = self.request.query_params.get("student")
        if student_id:
            qs = qs.filter(student_id=student_id)

        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsTrainerUserRole])
    def evaluate(self, request, pk=None):
        """
        Trainer submits evaluation scores and feedback for subjective questions.
        """
        submission = self.get_object()
        evaluations = request.data.get("evaluations", [])  # list of {answer_id, marks_obtained, evaluator_notes}
        feedback = request.data.get("trainer_feedback", "")

        with transaction.atomic():
            for item in evaluations:
                ans_id = item.get("answer_id")
                marks = item.get("marks_obtained")
                notes = item.get("evaluator_notes", "")
                try:
                    answer = StudentAnswer.objects.get(id=ans_id, submission=submission)
                    answer.marks_obtained = marks
                    answer.evaluator_notes = notes
                    answer.save()
                except StudentAnswer.DoesNotExist:
                    continue

            total = sum(
                (ans.marks_obtained or 0) for ans in submission.answers.all()
            )
            submission.total_score = total
            submission.passed = total >= submission.assessment.passing_marks
            submission.status = Submission.Status.EVALUATED
            submission.trainer_feedback = feedback
            submission.evaluated_by = request.user
            submission.evaluated_at = timezone.now()
            submission.save()

        serializer = SubmissionSerializer(submission)
        return Response(serializer.data)
