import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { placementsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Send,
  Video,
} from "lucide-react";

export const StudentPlacementsPage = () => {
  const toast = useToast();
  const [vacancies, setVacancies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vacancies"); // 'vacancies' or 'applications'

  // Apply Modal
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [vRes, aRes] = await Promise.all([
        placementsApi.getVacancies(),
        placementsApi.getApplications(),
      ]);
      setVacancies(vRes.data.results || vRes.data || []);
      setApplications(aRes.data.results || aRes.data || []);
    } catch (err) {
      console.error("Load placements error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedVacancy) return;

    setApplying(true);
    try {
      await placementsApi.applyVacancy(selectedVacancy.id, {
        cover_note: coverNote,
      });
      toast.success(`Application submitted for ${selectedVacancy.title}!`);
      setSuccessMsg(`Application submitted for ${selectedVacancy.title} at ${selectedVacancy.company_name}!`);
      setSelectedVacancy(null);
      setCoverNote("");
      loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || "Application failed.";
      toast.error(msg);
    } finally {
      setApplying(false);
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

  return (
    <AppLayout title="Placement Opportunities">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("vacancies")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === "vacancies"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Verified Vacancies ({vacancies.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === "applications"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>My Applications ({applications.length})</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-700 hover:text-emerald-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Active Vacancies */}
        {activeTab === "vacancies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vacancies.map((job) => {
              const applied = applications.some((a) => a.vacancy === job.id);
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-900 block">{job.company_name}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{job.location}</span>
                          </span>
                        </div>
                      </div>
                      <Badge variant="primary" size="sm">
                        {job.job_type}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mt-2">{job.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {job.job_description}
                    </p>

                    {/* Eligibility Snippet */}
                    {job.eligibility && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                        <p>
                          <strong>Required Skills:</strong> {job.eligibility.required_skills || "Relevant full-stack skills"}
                        </p>
                        <p>
                          <strong>Eligibility:</strong> {job.eligibility.minimum_qualification || "Graduate"} (Graduation Year: {job.eligibility.min_graduation_year || "2025"}-{job.eligibility.max_graduation_year || "2026"})
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Compensation</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {job.salary_package || "Industry Standard"}
                      </span>
                    </div>

                    {applied ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedVacancy(job)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Applications Tracker */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                You haven't submitted any job applications yet. Check verified vacancies!
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-slate-900">{app.job_title}</h3>
                      <Badge variant={getStatusVariant(app.status)} size="sm">
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      Company: <span className="font-semibold text-slate-800">{app.company_name}</span> • Package: {app.salary_package}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Applied on: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Interview Callout if scheduled */}
                  {app.interviews && app.interviews.length > 0 && (
                    <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-950 shrink-0">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                        <Video className="w-4 h-4 text-blue-600" />
                        <span>{app.interviews[0].round_name}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Date: {new Date(app.interviews[0].scheduled_date).toLocaleString()}
                      </p>
                      {app.interviews[0].meeting_link && (
                        <a
                          href={app.interviews[0].meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal: Apply */}
        <Modal
          isOpen={!!selectedVacancy}
          onClose={() => setSelectedVacancy(null)}
          title={`Apply for ${selectedVacancy?.title}`}
        >
          {selectedVacancy && (
            <form onSubmit={handleApply} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <p className="font-bold text-sm text-slate-900">{selectedVacancy.company_name}</p>
                <p className="mt-1">Location: {selectedVacancy.location} • Compensation: {selectedVacancy.salary_package}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Candidate Note / Cover Note
                </label>
                <textarea
                  rows={4}
                  required
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="Highlight your project portfolio and full-stack capabilities..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedVacancy(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  {applying ? "Submitting..." : "Confirm Application"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default StudentPlacementsPage;
