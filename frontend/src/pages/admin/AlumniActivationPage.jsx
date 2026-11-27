import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { studentApi, careersApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { GraduationCap, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

export const AlumniActivationPage = () => {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [activationLogs, setActivationLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notes, setNotes] = useState("");
  const [activating, setActivating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, logsRes] = await Promise.all([
        studentApi.getProfiles(),
        careersApi.getActivationLogs(),
      ]);
      setStudents(studentsRes.data.results || studentsRes.data || []);
      setActivationLogs(logsRes.data.results || logsRes.data || []);
    } catch (err) {
      console.error("Load alumni data failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkCourseComplete = async (profile) => {
    if (!confirm(`Mark course completed for ${profile.user.full_name}?`)) return;
    try {
      await studentApi.completeCourse(profile.id);
      toast.success(`Course completed for ${profile.user.full_name}. Ready for alumni activation.`);
      setSuccessMessage(`Course marked completed for ${profile.user.full_name}. Now eligible for alumni activation.`);
      loadData();
    } catch (err) {
      toast.error("Failed to mark course completion.");
    }
  };

  const handleConfirmActivation = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setActivating(true);
    try {
      const res = await studentApi.activateAlumni(selectedStudent.id, { notes });
      toast.success("Alumni role activated with academic history preserved!");
      setSuccessMessage(res.data.detail || "Alumni access activated successfully!");
      setSelectedStudent(null);
      setNotes("");
      loadData();
    } catch (err) {
      toast.error("Failed to activate alumni access.");
    } finally {
      setActivating(false);
    }
  };

  const columns = [
    {
      header: "Candidate",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.user.full_name}</p>
          <p className="text-xs text-slate-500">@{row.user.username} • {row.college || "Ascendra Academy"}</p>
        </div>
      ),
    },
    {
      header: "Course & Status",
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.course_name || "Full Stack Architecture"}</p>
          <span className="text-[10px] text-slate-500">Placement: {row.status}</span>
        </div>
      ),
    },
    {
      header: "Course Completed",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            row.course_completed ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          {row.course_completed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Completed ({row.course_completed_date || "Yes"})</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-amber-500" />
              <span>In Training</span>
            </>
          )}
        </span>
      ),
    },
    {
      header: "Platform Role",
      render: (row) => (
        <Badge variant={row.user.role === "ALUMNI" ? "success" : "primary"} size="sm">
          {row.user.role}
        </Badge>
      ),
    },
    {
      header: "Alumni Activation Action",
      render: (row) => {
        if (row.user.role === "ALUMNI") {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Alumni Active</span>
            </span>
          );
        }

        if (!row.course_completed) {
          return (
            <button
              onClick={() => handleMarkCourseComplete(row)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
            >
              Verify Course Completion
            </button>
          );
        }

        return (
          <button
            onClick={() => {
              setSelectedStudent(row);
              setNotes(`Course completed with distinction on ${row.course_completed_date || "date"}. Verified by Administrator.`);
            }}
            className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
          >
            Activate Alumni Role
          </button>
        );
      },
    },
  ];

  return (
    <AppLayout title="Student-to-Alumni Transition Portal">
      <div className="space-y-6">
        {/* Banner with Architecture Explanation */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 shrink-0">
              <GraduationCap className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Single-Account Career Lifecycle Transition
              </h2>
              <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                When a student completes their training, they transition into an Alumnus under the <strong>same user account</strong>. All academic history, projects, assessment scores, and placement records remain completely preserved while unlocking the professional alumni mentorship and networking suite.
              </p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage("")} className="text-emerald-700 hover:text-emerald-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Graduation & Alumni Transition Pipeline</h3>
          <p className="text-xs text-slate-500 mb-4">
            Verify course completion status and activate permanent Alumni network access.
          </p>
          <DataTable columns={columns} data={students} loading={loading} />
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Alumni Activation Audit Logs</h3>
          <p className="text-xs text-slate-500 mb-4">
            Immutable log of admin-authorized alumni promotions.
          </p>
          {activationLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No alumni activations logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <th className="px-4 py-3">Student Candidate</th>
                    <th className="px-4 py-3">Activated By</th>
                    <th className="px-4 py-3">Activation Timestamp</th>
                    <th className="px-4 py-3">Administrative Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{log.student_name}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{log.activated_by_name}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(log.activated_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600 italic">{log.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Alumni Activation Confirmation */}
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="Confirm Alumni Access Activation"
        >
          {selectedStudent && (
            <form onSubmit={handleConfirmActivation} className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <p className="font-bold text-sm">
                  Promote {selectedStudent.user.full_name} to ALUMNI
                </p>
                <p className="mt-1">
                  This will transition their platform role from <strong>STUDENT</strong> to <strong>ALUMNI</strong>. Their academic records, batch enrollments, and projects will be permanently preserved.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Administrator Authorization Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="Record reasons, honors, course completion verification..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  {activating ? "Processing..." : "Confirm & Activate Alumni"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default AlumniActivationPage;
