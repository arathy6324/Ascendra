import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { assessmentsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

export const StudentAssessmentsPage = () => {
  const toast = useToast();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const res = await assessmentsApi.getAssessments();
      setAssessments(res.data.results || res.data || []);
    } catch (err) {
      console.error("Load assessments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const handleStartTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setSubmissionResult(null);
  };

  const handleOptionSelect = (qId, optionText) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { selected_option: optionText, answer_text: optionText },
    }));
  };

  const handleTextAnswer = (qId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { answer_text: text, selected_option: "" },
    }));
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    if (!activeTest) return;

    setSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([qId, val]) => ({
        question_id: Number(qId),
        selected_option: val.selected_option,
        answer_text: val.answer_text,
      }));

      const res = await assessmentsApi.submitAssessment(activeTest.id, {
        answers: answersPayload,
      });

      setSubmissionResult(res.data);
      toast.success("Assessment submitted!");
      loadAssessments();
    } catch (err) {
      const msg = err.response?.data?.detail || "Submission failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Assessments & Tests">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assigned Assessments</h2>
            <p className="text-xs text-slate-500">
              Evaluations assigned to your batch. Objective questions are auto-evaluated instantly.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
            {assessments.filter((a) => a.my_submission).length} of {assessments.length} Completed
          </span>
        </div>

        {/* Assessments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((test) => {
            const sub = test.my_submission;
            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">{test.course_name}</span>
                    <Badge variant={sub ? (sub.passed ? "success" : "warning") : "primary"} size="sm">
                      {sub ? sub.status : "Pending"}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{test.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{test.description}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Type</span>
                      <span className="font-bold text-slate-700">{test.assessment_type}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Total Marks</span>
                      <span className="font-bold text-slate-700">{test.total_marks}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Duration</span>
                      <span className="font-bold text-slate-700">{test.duration_minutes}m</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {sub ? (
                    <div className="text-xs">
                      <span className="text-slate-500 font-medium">Your Score: </span>
                      <span className="font-bold text-emerald-600">{sub.total_score} pts</span>
                      <span className="ml-2 text-slate-400">({sub.passed ? "Passed" : "Under Review"})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Not submitted yet</span>
                    </span>
                  )}

                  {!sub && (
                    <button
                      onClick={() => handleStartTest(test)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <span>Take Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Assessment Taking Modal */}
        <Modal
          isOpen={!!activeTest}
          onClose={() => setActiveTest(null)}
          title={submissionResult ? "Assessment Results" : activeTest?.title || "Take Assessment"}
          maxWidth="max-w-3xl"
        >
          {submissionResult ? (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Assessment Submitted Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1">Your objective responses have been auto-evaluated.</p>
              </div>

              <div className="max-w-sm mx-auto bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Total Score Obtained</p>
                <p className="text-4xl font-extrabold text-blue-600 mt-1">
                  {submissionResult.total_score || 0} / {submissionResult.total_marks || activeTest?.total_marks}
                </p>
                <p className="text-xs font-semibold text-emerald-600 mt-2">
                  {submissionResult.passed ? "✓ Passed Passing Criteria" : "Submitted for Trainer Evaluation"}
                </p>
              </div>

              <button
                onClick={() => setActiveTest(null)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close & Return
              </button>
            </div>
          ) : activeTest ? (
            <form onSubmit={handleSubmitTest} className="space-y-6">
              <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <span>{activeTest.description}</span>
                <span className="font-bold">Passing Marks: {activeTest.passing_marks}</span>
              </div>

              <div className="space-y-6 divide-y divide-slate-100">
                {activeTest.questions?.map((q, idx) => (
                  <div key={q.id} className="pt-4 first:pt-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-bold text-slate-900">
                        {idx + 1}. {q.question_text}
                      </p>
                      <span className="text-[11px] font-semibold text-slate-500 shrink-0 bg-slate-100 px-2 py-0.5 rounded">
                        {q.marks} Marks
                      </span>
                    </div>

                    {/* Question Options */}
                    {q.options && q.options.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = answers[q.id]?.selected_option === opt.text;
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleOptionSelect(q.id, opt.text)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                                isSelected
                                  ? "bg-blue-50 border-blue-600 text-blue-900 font-semibold"
                                  : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 text-slate-700"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                checked={isSelected}
                                onChange={() => handleOptionSelect(q.id, opt.text)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span>{opt.text}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-3">
                        <textarea
                          rows={3}
                          value={answers[q.id]?.answer_text || ""}
                          onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                          placeholder="Type your response or code snippet here..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTest(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  {submitting ? "Submitting..." : "Submit Assessment"}
                </button>
              </div>
            </form>
          ) : null}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default StudentAssessmentsPage;
