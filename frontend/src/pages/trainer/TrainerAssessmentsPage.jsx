import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { assessmentsApi, academicsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { DUMMY_ASSESSMENTS, DUMMY_BATCHES } from "../../data/dummyData";
import { Plus, ClipboardList, FileText } from "lucide-react";

export const TrainerAssessmentsPage = () => {
  const toast = useToast();
  const [assessments, setAssessments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // Assessment Form
  const [testForm, setTestForm] = useState({
    title: "",
    description: "",
    assessment_type: "QUIZ",
    course: "",
    batch: "",
    total_marks: 50,
    passing_marks: 25,
    duration_minutes: 45,
  });

  // Question Form
  const [qForm, setQForm] = useState({
    question_text: "",
    question_type: "MULTIPLE_CHOICE",
    marks: 10,
    correct_answer: "",
    opt1: "",
    opt2: "",
    opt3: "",
    opt4: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [assRes, batRes, crsRes] = await Promise.all([
        assessmentsApi.getAssessments(),
        academicsApi.getBatches(),
        academicsApi.getCourses(),
      ]);
      const apiAss = assRes.data.results || assRes.data || [];
      const apiBat = batRes.data.results || batRes.data || [];
      setAssessments(apiAss.length > 0 ? apiAss : DUMMY_ASSESSMENTS);
      setBatches(apiBat.length > 0 ? apiBat : DUMMY_BATCHES);
      setCourses(crsRes.data.results || crsRes.data || []);
    } catch (err) {
      console.error("Load trainer tests error:", err);
      setAssessments(DUMMY_ASSESSMENTS);
      setBatches(DUMMY_BATCHES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      await assessmentsApi.createAssessment({
        ...testForm,
        course: Number(testForm.course),
        batch: testForm.batch ? Number(testForm.batch) : null,
      });
      toast.success("Assessment created successfully!");
      setIsAssessmentModalOpen(false);
      setTestForm({
        title: "",
        description: "",
        assessment_type: "QUIZ",
        course: "",
        batch: "",
        total_marks: 50,
        passing_marks: 25,
        duration_minutes: 45,
      });
      loadData();
    } catch (err) {
      toast.error("Failed to create assessment.");
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedAssessment) return;

    try {
      let optionsList = [];
      if (qForm.question_type === "MULTIPLE_CHOICE") {
        optionsList = [
          { text: qForm.opt1, is_correct: qForm.opt1 === qForm.correct_answer },
          { text: qForm.opt2, is_correct: qForm.opt2 === qForm.correct_answer },
          { text: qForm.opt3, is_correct: qForm.opt3 === qForm.correct_answer },
          { text: qForm.opt4, is_correct: qForm.opt4 === qForm.correct_answer },
        ].filter((o) => o.text.trim() !== "");
      } else if (qForm.question_type === "TRUE_FALSE") {
        optionsList = [
          { text: "True", is_correct: qForm.correct_answer.toLowerCase() === "true" },
          { text: "False", is_correct: qForm.correct_answer.toLowerCase() === "false" },
        ];
      }

      await assessmentsApi.createQuestion({
        assessment: selectedAssessment.id,
        question_text: qForm.question_text,
        question_type: qForm.question_type,
        marks: Number(qForm.marks),
        correct_answer: qForm.correct_answer,
        options: optionsList,
      });

      toast.success("Question added to assessment!");
      setIsQuestionModalOpen(false);
      setQForm({
        question_text: "",
        question_type: "MULTIPLE_CHOICE",
        marks: 10,
        correct_answer: "",
        opt1: "",
        opt2: "",
        opt3: "",
        opt4: "",
      });
      loadData();
    } catch (err) {
      toast.error("Failed to add question.");
    }
  };

  const quizzes = assessments.filter(a => a.assessment_type === "QUIZ");
  const assignments = assessments.filter(a => a.assessment_type === "ASSIGNMENT");

  const cardStyle = { backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "1rem" };

  return (
    <AppLayout title="Assessment Builder">
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={cardStyle}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)", fontFamily: "Sora, sans-serif" }}>Assessments & Quizzes</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {assessments.length} assessments · {quizzes.length} quizzes · {assignments.length} assignments
            </p>
          </div>
          <button
            onClick={() => setIsAssessmentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition shadow"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus className="w-4 h-4" /><span>New Assessment</span>
          </button>
        </div>

        {/* Quizzes Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-4 h-4" style={{ color: "var(--color-purple)" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)", fontFamily: "Sora, sans-serif" }}>Quizzes ({quizzes.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {quizzes.map((test) => (
              <div key={test.id} className="p-5 rounded-2xl flex flex-col justify-between" style={cardStyle}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{test.batch_name || test.subject}</span>
                    <Badge variant="indigo" size="sm">{test.assessment_type}</Badge>
                  </div>
                  <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{test.title}</h3>
                  {test.description && <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{test.description}</p>}
                  <div className="mt-3 p-3 rounded-xl flex items-center justify-between text-xs" style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Total: <strong style={{ color: "var(--text-primary)" }}>{test.total_marks}pts</strong></span>
                    <span style={{ color: "var(--text-secondary)" }}>Pass: <strong style={{ color: "var(--text-primary)" }}>{test.passing_marks}pts</strong></span>
                    <span style={{ color: "var(--text-secondary)" }}>Submitted: <strong style={{ color: "var(--text-primary)" }}>{test.submitted_count || 0}</strong></span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
                  <Badge variant={test.status === "ACTIVE" ? "success" : test.status === "COMPLETED" ? "neutral" : "warning"} size="sm">{test.status}</Badge>
                  <button onClick={() => { setSelectedAssessment(test); setIsQuestionModalOpen(true); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition"
                    style={{ backgroundColor: "var(--color-purple-subtle)", color: "var(--color-purple)", border: "1px solid rgba(139,92,246,0.2)" }}
                  >+ Add Question</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignments Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" style={{ color: "var(--color-warning)" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)", fontFamily: "Sora, sans-serif" }}>Assignments ({assignments.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {assignments.map((test) => (
              <div key={test.id} className="p-5 rounded-2xl flex flex-col justify-between" style={cardStyle}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{test.batch_name || test.subject}</span>
                    <Badge variant="warning" size="sm">{test.assessment_type}</Badge>
                  </div>
                  <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{test.title}</h3>
                  {test.description && <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{test.description}</p>}
                  <div className="mt-3 p-3 rounded-xl flex items-center justify-between text-xs" style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Marks: <strong style={{ color: "var(--text-primary)" }}>{test.total_marks}</strong></span>
                    <span style={{ color: "var(--text-secondary)" }}>Submitted: <strong style={{ color: "var(--text-primary)" }}>{test.submitted_count || 0}</strong></span>
                    <span style={{ color: "var(--text-secondary)" }}>Pending: <strong style={{ color: "var(--color-warning)" }}>{test.pending_count || 0}</strong></span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Due: {test.deadline}</span>
                  <Badge variant={test.status === "ACTIVE" ? "success" : test.status === "COMPLETED" ? "neutral" : "warning"} size="sm">{test.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Create Assessment */}
        <Modal isOpen={isAssessmentModalOpen} onClose={() => setIsAssessmentModalOpen(false)} title="Create New Assessment">
          <form onSubmit={handleCreateAssessment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>Assessment Title</label>
              <input type="text" required value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} className="form-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>Course</label>
                <select required value={testForm.course} onChange={(e) => setTestForm({ ...testForm, course: e.target.value })} className="form-input">
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>Batch (Optional)</label>
                <select value={testForm.batch} onChange={(e) => setTestForm({ ...testForm, batch: e.target.value })} className="form-input">
                  <option value="">-- All Batches --</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>Type</label>
                <select value={testForm.assessment_type} onChange={(e) => setTestForm({ ...testForm, assessment_type: e.target.value })} className="form-input">
                  <option value="QUIZ">Quiz (Objective)</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="CODING_CHALLENGE">Coding Task</option>
                  <option value="FINAL_EXAM">Final Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>Total Marks</label>
                <input type="number" required value={testForm.total_marks} onChange={(e) => setTestForm({ ...testForm, total_marks: e.target.value })} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>Pass Marks</label>
                <input type="number" required value={testForm.passing_marks} onChange={(e) => setTestForm({ ...testForm, passing_marks: e.target.value })} className="form-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>Instructions / Description</label>
              <textarea rows={3} value={testForm.description} onChange={(e) => setTestForm({ ...testForm, description: e.target.value })} className="form-input" />
            </div>
            <div className="flex justify-end gap-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <button type="button" onClick={() => setIsAssessmentModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
              <button type="submit" className="px-5 py-2 text-white rounded-lg text-xs font-bold" style={{ backgroundColor: "var(--accent)" }}>Save Assessment</button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add Question */}
        <Modal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          title={`Add Question to ${selectedAssessment?.title}`}
        >
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Question Text
              </label>
              <textarea
                rows={3}
                required
                value={qForm.question_text}
                onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Question Type
                </label>
                <select
                  value={qForm.question_type}
                  onChange={(e) => setQForm({ ...qForm, question_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice (Auto-Graded)</option>
                  <option value="TRUE_FALSE">True / False (Auto-Graded)</option>
                  <option value="SHORT_ANSWER">Short Answer (Subjective)</option>
                  <option value="CODE">Coding Task (Subjective)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  required
                  value={qForm.marks}
                  onChange={(e) => setQForm({ ...qForm, marks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {qForm.question_type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase">Answer Choices</p>
                <input
                  type="text"
                  required
                  placeholder="Option 1"
                  value={qForm.opt1}
                  onChange={(e) => setQForm({ ...qForm, opt1: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Option 2"
                  value={qForm.opt2}
                  onChange={(e) => setQForm({ ...qForm, opt2: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Option 3"
                  value={qForm.opt3}
                  onChange={(e) => setQForm({ ...qForm, opt3: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Option 4"
                  value={qForm.opt4}
                  onChange={(e) => setQForm({ ...qForm, opt4: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Correct Answer (Must match option exactly for auto-grading)
              </label>
              <input
                type="text"
                required
                value={qForm.correct_answer}
                onChange={(e) => setQForm({ ...qForm, correct_answer: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
                placeholder={qForm.question_type === "TRUE_FALSE" ? "True or False" : "Enter correct option text"}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold"
              >
                Add Question
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default TrainerAssessmentsPage;
