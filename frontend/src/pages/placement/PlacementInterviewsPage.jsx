import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import { placementsApi } from "../../services/api";
import { CalendarDays, Video, ExternalLink } from "lucide-react";

export const PlacementInterviewsPage = () => {
  const toast = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: "SCHEDULED", feedback: "" });

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const res = await placementsApi.getInterviews();
      setInterviews(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load interviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await placementsApi.updateInterview(editing.id, form);
      toast.success("Interview outcome updated.");
      setEditing(null);
      loadInterviews();
    } catch (err) {
      toast.error("Failed to update interview.");
    }
  };

  const columns = [
    {
      header: "Interview Round",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.round_name}</p>
          <p className="text-xs text-slate-500">Interviewer: {row.interviewer_name || "Panel"}</p>
        </div>
      ),
    },
    {
      header: "Scheduled Time",
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {new Date(row.scheduled_date).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Mode / Link",
      render: (row) => (
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="cyan" size="sm">{row.mode}</Badge>
          {row.meeting_link && (
            <a href={row.meeting_link} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
              <span>Join</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <Badge
          variant={row.status === "COMPLETED" ? "success" : row.status === "CANCELLED" ? "danger" : "warning"}
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => {
            setEditing(row);
            setForm({ status: row.status, feedback: row.feedback || "" });
          }}
          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition"
        >
          Update Outcome
        </button>
      ),
    },
  ];

  return (
    <AppLayout title="Interview Schedules" subtitle="Coordinate technical & HR interview rounds">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Scheduled Recruitment Rounds</h2>
            <p className="text-xs text-slate-500">Track upcoming interviews, join links, and panelist feedback.</p>
          </div>
          <Badge variant="warning" size="md">{interviews.length} Total Rounds</Badge>
        </div>

        <DataTable columns={columns} data={interviews} loading={loading} emptyMessage="No interviews scheduled yet." />

        <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={`Update Interview — ${editing?.round_name}`}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Outcome Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Panel Feedback</label>
              <textarea
                rows={3}
                value={form.feedback}
                onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                placeholder="Record technical evaluation notes..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold">
                Save Outcome
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default PlacementInterviewsPage;
