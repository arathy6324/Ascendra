import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { placementsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Filter } from "lucide-react";

export const ApplicationsManagementPage = () => {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState("SHORTLISTED");
  const [statusNotes, setStatusNotes] = useState("");

  // Interview Schedule Form
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    round_name: "Round 1: Technical Screening",
    scheduled_date: "",
    mode: "ONLINE",
    meeting_link: "",
    interviewer_name: "",
  });

  // Offer Form
  const [offerForm, setOfferForm] = useState({
    offered_designation: "",
    offered_ctc: "",
    joining_date: "",
  });

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await placementsApi.getApplications(params);
      setApplications(res.data.results || res.data || []);
    } catch (err) {
      console.error("Load applications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await placementsApi.updateApplicationStatus(selectedApp.id, {
        status: newStatus,
        notes: statusNotes,
        offered_designation: offerForm.offered_designation,
        offered_ctc: offerForm.offered_ctc,
        joining_date: offerForm.joining_date || null,
      });

      toast.success("Application status updated!");
      setSelectedApp(null);
      loadApplications();
    } catch (err) {
      toast.error("Failed to update application status.");
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await placementsApi.createInterview({
        application: selectedApp.id,
        ...interviewForm,
      });

      // Update application status to INTERVIEW_SCHEDULED
      await placementsApi.updateApplicationStatus(selectedApp.id, {
        status: "INTERVIEW_SCHEDULED",
        notes: `Interview scheduled for ${interviewForm.round_name}`,
      });

      toast.success("Interview round scheduled!");
      setIsInterviewModalOpen(false);
      setSelectedApp(null);
      loadApplications();
    } catch (err) {
      toast.error("Failed to schedule interview.");
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "SHORTLISTED":
        return "purple";
      case "INTERVIEW_SCHEDULED":
        return "primary";
      case "OFFERED":
        return "success";
      case "REJECTED":
        return "danger";
      case "APPLIED":
      default:
        return "neutral";
    }
  };

  const columns = [
    {
      header: "Candidate Name",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.candidate_name}</p>
          <p className="text-xs text-slate-500">{row.candidate_email} • {row.candidate_college}</p>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">
            {row.candidate_status}
          </span>
        </div>
      ),
    },
    {
      header: "Job Opportunity",
      render: (row) => (
        <div>
          <p className="font-bold text-xs text-slate-900">{row.job_title}</p>
          <p className="text-[11px] text-slate-600">{row.company_name}</p>
          <span className="text-[10px] text-slate-500">{row.salary_package}</span>
        </div>
      ),
    },
    {
      header: "Application Status",
      render: (row) => (
        <Badge variant={getStatusVariant(row.status)} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Applied Date",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.applied_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Placement Officer Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedApp(row);
              setNewStatus(row.status);
              setStatusNotes(row.notes || "");
              setOfferForm({
                offered_designation: row.job_title,
                offered_ctc: row.salary_package,
                joining_date: "",
              });
            }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            Update Status
          </button>
          <button
            onClick={() => {
              setSelectedApp(row);
              setIsInterviewModalOpen(true);
            }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
          >
            Schedule Interview
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Candidate Applications & Recruitment Drive">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student Placement Applications</h2>
            <p className="text-xs text-slate-500">
              Manage shortlists, coordinate multi-round interviews, and record employment offers.
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {["", "APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "OFFERED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                statusFilter === s
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s === "" ? "All Applications" : s}
            </button>
          ))}
        </div>

        {/* Applications Table */}
        <DataTable columns={columns} data={applications} loading={loading} />

        {/* Modal: Update Status / Record Offer */}
        <Modal
          isOpen={!!selectedApp && !isInterviewModalOpen}
          onClose={() => setSelectedApp(null)}
          title={`Update Status: ${selectedApp?.candidate_name} — ${selectedApp?.job_title}`}
        >
          {selectedApp && (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p>
                  <strong>Candidate Cover Note: </strong>
                  {selectedApp.cover_note || "No note provided."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Change Application Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SHORTLISTED">Shortlisted for Screening</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="OFFERED">Employment Offer Extended</option>
                  <option value="REJECTED">Application Rejected</option>
                </select>
              </div>

              {newStatus === "OFFERED" && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                  <p className="text-xs font-bold text-emerald-900 uppercase">
                    Offer Package Information
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-emerald-800 mb-1">Designation</label>
                      <input
                        type="text"
                        required
                        value={offerForm.offered_designation}
                        onChange={(e) => setOfferForm({ ...offerForm, offered_designation: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-800 mb-1">Offered CTC</label>
                      <input
                        type="text"
                        required
                        value={offerForm.offered_ctc}
                        onChange={(e) => setOfferForm({ ...offerForm, offered_ctc: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-800 mb-1">Target Joining Date</label>
                    <input
                      type="date"
                      value={offerForm.joining_date}
                      onChange={(e) => setOfferForm({ ...offerForm, joining_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Placement Cell Notes
                </label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="Internal notes regarding interview outcome or employer feedback..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  Save Status Update
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Modal: Schedule Interview */}
        <Modal
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          title={`Schedule Interview: ${selectedApp?.candidate_name}`}
        >
          {selectedApp && (
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Interview Round Name
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.round_name}
                  onChange={(e) => setInterviewForm({ ...interviewForm, round_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Round 1: Technical Screening, System Design"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewForm.scheduled_date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Interview Mode
                  </label>
                  <select
                    value={interviewForm.mode}
                    onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
                  >
                    <option value="ONLINE">Online Video (Google Meet / Zoom)</option>
                    <option value="IN_PERSON">In-Person Office</option>
                    <option value="TELEPHONIC">Telephonic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Meeting Link or Location Address
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.meeting_link}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Interviewer Name & Role
                </label>
                <input
                  type="text"
                  value={interviewForm.interviewer_name}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewer_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Senior Staff Architect - Novus Cloud"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  Confirm & Schedule Interview
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default ApplicationsManagementPage;
