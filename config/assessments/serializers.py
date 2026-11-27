from rest_framework import serializers
from .models import Assessment, Question, Submission, StudentAnswer


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "assessment",
            "question_text",
            "question_type",
            "marks",
            "options",
            "correct_answer",
            "order",
        ]


class QuestionStudentSerializer(serializers.ModelSerializer):
    """
    Excludes the correct_answer for students taking the test.
    """
    class Meta:
        model = Question
        fields = [
            "id",
            "assessment",
            "question_text",
            "question_type",
            "marks",
            "options",
            "order",
        ]


class AssessmentSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    created_by_name = serializers.ReadOnlyField(source="created_by.get_full_name")
    course_name = serializers.ReadOnlyField(source="course.name")
    batch_name = serializers.ReadOnlyField(source="batch.name")
    submissions_count = serializers.SerializerMethodField()
    my_submission = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            "id",
            "course",
            "course_name",
            "batch",
            "batch_name",
            "title",
            "description",
            "assessment_type",
            "total_marks",
            "passing_marks",
            "duration_minutes",
            "due_date",
            "is_published",
            "created_by",
            "created_by_name",
            "questions",
            "submissions_count",
            "my_submission",
            "created_at",
        ]
        read_only_fields = ["created_by"]

    def get_questions(self, obj):
        request = self.context.get("request")
        qs = obj.questions.all()
        if request and request.user.is_authenticated and request.user.role in ["STUDENT", "ALUMNI"]:
            return QuestionStudentSerializer(qs, many=True).data
        return QuestionSerializer(qs, many=True).data

    def get_submissions_count(self, obj):
        return obj.submissions.count()

    def get_my_submission(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated and hasattr(request.user, "student_profile"):
            sub = obj.submissions.filter(student=request.user.student_profile).first()
            if sub:
                return {
                    "id": sub.id,
                    "status": sub.status,
                    "total_score": sub.total_score,
                    "passed": sub.passed,
                    "submitted_at": sub.submitted_at,
                }
        return None


class StudentAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.ReadOnlyField(source="question.question_text")
    question_type = serializers.ReadOnlyField(source="question.question_type")
    max_marks = serializers.ReadOnlyField(source="question.marks")

    class Meta:
        model = StudentAnswer
        fields = [
            "id",
            "submission",
            "question",
            "question_text",
            "question_type",
            "max_marks",
            "answer_text",
            "selected_option",
            "marks_obtained",
            "evaluator_notes",
        ]


class SubmissionSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, read_only=True)
    student_name = serializers.ReadOnlyField(source="student.user.get_full_name")
    student_email = serializers.ReadOnlyField(source="student.user.email")
    assessment_title = serializers.ReadOnlyField(source="assessment.title")
    total_marks = serializers.ReadOnlyField(source="assessment.total_marks")
    passing_marks = serializers.ReadOnlyField(source="assessment.passing_marks")

    class Meta:
        model = Submission
        fields = [
            "id",
            "assessment",
            "assessment_title",
            "student",
            "student_name",
            "student_email",
            "total_marks",
            "passing_marks",
            "submitted_at",
            "status",
            "total_score",
            "passed",
            "trainer_feedback",
            "evaluated_by",
            "evaluated_at",
            "answers",
        ]
        read_only_fields = ["student", "submitted_at"]
