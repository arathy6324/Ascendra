import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { placementsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Plus } from "lucide-react";

export const VacancyManagementPage = () => {
  const toast = useToast();
  const [vacancies, setVacancies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    company: "",
    title: "",
    job_description: "",
    job_type: "FULL_TIME",
    location: "",
    salary_package: "",
    openings: 2,
    application_deadline: "",
    status: "ACTIVE",
    minimum_qualification: "B.Tech / B.E. / M.C.A.",
    required_skills: "React, Python, Django, PostgreSQL",
    min_graduation_year: 2025,
    max_graduation_year: 2026,
    must_be_placement_ready: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [vRes, cRes] = await Promise.all([
        placementsApi.getVacancies(),
        placementsApi.getCompanies(),
      ]);
      setVacancies(vRes.data.results || vRes.data || []);
      setCompanies(cRes.data.results || cRes.data || []);
    } catch (err) {
      console.error("Load vacancies error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVacancy = async (e) => {
    e.preventDefault();
    try {
      await placementsApi.createVacancy({
        company: Number(form.company),
        title: form.title,
        job_description: form.job_description,
        job_type: form.job_type,
        location: form.location,
        salary_package: form.salary_package,
        openings: Number(form.openings),
        application_deadline: form.application_deadline,
        status: form.status,
        eligibility: {
          minimum_qualification: form.minimum_qualification,
          required_skills: form.required_skills,
          min_graduation_year: Number(form.min_graduation_year),
          max_graduation_year: Number(form.max_graduation_year),
          must_be_placement_ready: form.must_be_placement_ready,
        },
      });

      toast.success("Job vacancy broadcasted!");
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error("Failed to create vacancy.");
    }
  };

  const columns = [
    {
      header: "Opportunity",
      render: (row) => (
        <div>
          <h4 className="font-bold text-sm text-slate-900">{row.title}</h4>
          <p className="text-xs text-slate-600">{row.company_name} • {row.location}</p>
        </div>
      ),
    },
    {
      header: "Job Type",
      accessor: "job_type",
      render: (row) => <Badge variant="primary" size="sm">{row.job_type}</Badge>,
    },
    {
      header: "Package (CTC)",
      accessor: "salary_package",
      render: (row) => <span className="text-xs font-bold text-slate-800">{row.salary_package || "Industry Standard"}</span>,
    },
    {
      header: "Applications",
      render: (row) => (
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          {row.applications_count || 0} Applied
        </span>
      ),
    },
    {
      header: "Deadline",
      accessor: "application_deadline",
      render: (row) => <span className="text-xs text-slate-500">{row.application_deadline}</span>,
    },
    {
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "neutral"} size="sm">
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <AppLayout title="Job Vacancies & Eligibility Rules">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Institutional Job Vacancies</h2>
            <p className="text-xs text-slate-500">
              Publish corporate openings with strict graduation year, qualification, and readiness eligibility filters.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Post Vacancy</span>
          </button>
        </div>

        <DataTable columns={columns} data={vacancies} loading={loading} />

        {/* Modal: Post Vacancy */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Post Corporate Job Vacancy"
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleCreateVacancy} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company</label>
                <select
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
                >
                  <option value="">-- Select Company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Designation</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Associate Cloud Software Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Type</label>
                <select
                  value={form.job_type}
                  onChange={(e) => setForm({ ...form, job_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Salary Package</label>
                <input
                  type="text"
                  value={form.salary_package}
                  onChange={(e) => setForm({ ...form, salary_package: e.target.value })}
                  placeholder="e.g. 8.5 - 12 LPA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Bengaluru / Hybrid"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Open Positions</label>
                <input
                  type="number"
                  min="1"
                  value={form.openings}
                  onChange={(e) => setForm({ ...form, openings: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Application Deadline</label>
                <input
                  type="date"
                  required
                  value={form.application_deadline}
                  onChange={(e) => setForm({ ...form, application_deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Eligibility Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                Candidate Eligibility Rules
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Required Skills</label>
                  <input
                    type="text"
                    value={form.required_skills}
                    onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Min Qualification</label>
                  <input
                    type="text"
                    value={form.minimum_qualification}
                    onChange={(e) => setForm({ ...form, minimum_qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Min Graduation Year</label>
                  <input
                    type="number"
                    value={form.min_graduation_year}
                    onChange={(e) => setForm({ ...form, min_graduation_year: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Max Graduation Year</label>
                  <input
                    type="number"
                    value={form.max_graduation_year}
                    onChange={(e) => setForm({ ...form, max_graduation_year: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.must_be_placement_ready}
                  onChange={(e) => setForm({ ...form, must_be_placement_ready: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Candidate must have 'Placement Ready' status verified</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Description & Responsibilities</label>
              <textarea
                rows={3}
                required
                value={form.job_description}
                onChange={(e) => setForm({ ...form, job_description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Broadcast Vacancy
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default VacancyManagementPage;
