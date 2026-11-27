import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { assessmentsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export const TrainerEvaluationsPage = () => {
  const toast = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState("");
  const [evaluating, setEvaluating] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await assessmentsApi.getSubmissions();
      setSubmissions(res.data.results || res.data || []);
    } catch (err) {
      console.error("Load submissions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const openEvaluationModal = (sub) => {
    setSelectedSub(sub);
    const initialScores = {};
    sub.answers?.forEach((ans) => {
      initialScores[ans.id] = ans.marks_obtained !== null ? ans.marks_obtained : "";
    });
    setScores(initialScores);
    setFeedback(sub.trainer_feedback || "");
  };

  const handleScoreChange = (ansId, val) => {
    setScores((prev) => ({
      ...prev,
      [ansId]: val,
    }));
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    setEvaluating(true);
    try {
      const evalPayload = Object.entries(scores).map(([ansId, marks]) => ({
        answer_id: Number(ansId),
        marks_obtained: marks === "" ? 0 : Number(marks),
      }));

      await assessmentsApi.evaluateSubmission(selectedSub.id, {
        evaluations: evalPayload,
        trainer_feedback: feedback,
      });

      toast.success("Evaluation published!");
      setSelectedSub(null);
      loadSubmissions();
    } catch (err) {
      toast.error("Failed to save evaluation.");
    } finally {
      setEvaluating(false);
    }
  };

  const columns = [
    {
      header: "Student Candidate",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.student_name}</p>
          <p className="text-xs text-slate-500">{row.student_email}</p>
        </div>
      ),
    },
    {
      header: "Assessment",
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.assessment_title}</p>
          <span className="text-[10px] text-slate-500">Max Marks: {row.total_marks}</span>
        </div>
      ),
    },
    {
      header: "Submitted Date",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.submitted_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "EVALUATED" ? "success" : "warning"} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Score",
      render: (row) => (
        <span className="text-xs font-bold text-slate-900">
          {row.total_score !== null ? `${row.total_score} pts` : "Pending"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => openEvaluationModal(row)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
        >
          {row.status === "EVALUATED" ? "Edit Grade" : "Evaluate"}
        </button>
      ),
    },
  ];

  return (
    <AppLayout title="Submission Evaluations">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Student Assessment Submissions</h2>
          <p className="text-xs text-slate-500 mb-4">
            Grade objective and subjective answers, configure individual marks, and provide constructive feedback.
          </p>
          <DataTable columns={columns} data={submissions} loading={loading} />
        </div>

        {/* Modal: Evaluation */}
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Evaluate: ${selectedSub?.student_name} — ${selectedSub?.assessment_title}`}
          maxWidth="max-w-2xl"
        >
          {selectedSub && (
            <form onSubmit={handleSaveEvaluation} className="space-y-6">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {selectedSub.answers?.map((ans, idx) => (
                  <div key={ans.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="font-bold text-slate-900">
                        {idx + 1}. {ans.question_text}
                      </p>
                      <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        Max {ans.max_marks} pts
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                      <strong>Student Answer: </strong>
                      {ans.selected_option || ans.answer_text || "<No answer provided>"}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <label className="font-semibold text-slate-700">Marks Awarded:</label>
                      <input
                        type="number"
                        min="0"
                        max={ans.max_marks}
                        step="0.5"
                        required
                        value={scores[ans.id] !== undefined ? scores[ans.id] : ""}
                        onChange={(e) => handleScoreChange(ans.id, e.target.value)}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center font-bold"
                      />
                      <span className="text-slate-400">/ {ans.max_marks}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Overall Trainer Feedback & Notes
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  placeholder="Provide recommendations, commendations or areas for code improvement..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={evaluating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  {evaluating ? "Saving..." : "Publish Evaluation"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default TrainerEvaluationsPage;
