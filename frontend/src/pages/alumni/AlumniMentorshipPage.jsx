import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { careersApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Calendar } from "lucide-react";

export const AlumniMentorshipPage = () => {
  const toast = useToast();
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [statusVal, setStatusVal] = useState("ACTIVE");
  const [scheduleVal, setScheduleVal] = useState("");
  const [notesVal, setNotesVal] = useState("");

  const loadMentorships = async () => {
    setLoading(true);
    try {
      const res = await careersApi.getMentorships();
      setMentorships(res.data.results || res.data || []);
    } catch (err) {
      console.error("Load mentorships error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentorships();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;
    try {
      await careersApi.updateMentorshipStatus(selectedSession.id, {
        status: statusVal,
        meeting_schedule: scheduleVal,
        notes: notesVal,
      });
      toast.success("Mentorship session updated!");
      setSelectedSession(null);
      loadMentorships();
    } catch (err) {
      toast.error("Failed to update mentorship status.");
    }
  };

  return (
    <AppLayout title="Student Mentorship Hub">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Career Mentorship Sessions</h2>
            <p className="text-xs text-slate-500">
              Guide early-career students on system architecture, placement interviews, and industry trends.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {mentorships.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No mentorship requests received at this time.
            </div>
          ) : (
            mentorships.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900">{m.topic}</h3>
                    <Badge variant={m.status === "ACTIVE" ? "success" : "primary"} size="sm">
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Mentee Student: <span className="font-semibold text-slate-900">{m.student_name}</span>
                  </p>
                  {m.meeting_schedule && (
                    <p className="text-xs text-blue-600 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{m.meeting_schedule}</span>
                    </p>
                  )}
                  {m.notes && (
                    <p className="text-xs text-slate-500 italic">"{m.notes}"</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedSession(m);
                    setStatusVal(m.status);
                    setScheduleVal(m.meeting_schedule || "");
                    setNotesVal(m.notes || "");
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
                >
                  Manage Session
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal: Manage Session */}
        <Modal
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          title={`Mentorship: ${selectedSession?.student_name}`}
        >
          {selectedSession && (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Session Status
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
                >
                  <option value="REQUESTED">Requested</option>
                  <option value="ACTIVE">Active (Ongoing Mentorship)</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DECLINED">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Meeting Schedule / Timing
                </label>
                <input
                  type="text"
                  value={scheduleVal}
                  onChange={(e) => setScheduleVal(e.target.value)}
                  placeholder="e.g. Bi-weekly Saturdays 4 PM IST via Google Meet"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mentorship Guidance Notes
                </label>
                <textarea
                  rows={3}
                  value={notesVal}
                  onChange={(e) => setNotesVal(e.target.value)}
                  placeholder="Goals, reading material or system design roadmap..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Save Updates
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default AlumniMentorshipPage;
