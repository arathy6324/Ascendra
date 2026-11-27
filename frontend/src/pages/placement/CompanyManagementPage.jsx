import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import { placementsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Plus, ExternalLink } from "lucide-react";

export const CompanyManagementPage = () => {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    contact_person: "",
    email: "",
    phone: "",
    description: "",
  });

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await placementsApi.getCompanies();
      setCompanies(res.data.results || res.data || []);
    } catch (err) {
      console.error("Load companies error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await placementsApi.createCompany(form);
      toast.success("Partner company added!");
      setIsModalOpen(false);
      setForm({
        name: "",
        industry: "",
        location: "",
        website: "",
        contact_person: "",
        email: "",
        phone: "",
        description: "",
      });
      loadCompanies();
    } catch (err) {
      toast.error("Failed to add partner company.");
    }
  };

  const columns = [
    {
      header: "Partner Company",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center border border-blue-200 text-sm shrink-0">
            {row.name[0]}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">{row.name}</h4>
            <p className="text-xs text-slate-500">{row.industry || "Technology & Software"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: "location",
      render: (row) => <span className="text-xs text-slate-700">{row.location || "Bengaluru"}</span>,
    },
    {
      header: "Contact Person",
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.contact_person || "HR Team"}</p>
          <p className="text-[11px] text-slate-400">{row.email || "—"}</p>
        </div>
      ),
    },
    {
      header: "Vacancies",
      render: (row) => (
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          {row.vacancies_count || 0} Openings
        </span>
      ),
    },
    {
      header: "Placements Hired",
      render: (row) => (
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {row.placements_count || 0} Placed
        </span>
      ),
    },
    {
      header: "Website",
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Visit Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <AppLayout title="Corporate Partner Database">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registered Partner Employers</h2>
            <p className="text-xs text-slate-500">
              Database records managed by the placement cell. No external recruiter portals required.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Partner Company</span>
          </button>
        </div>

        <DataTable columns={columns} data={companies} loading={loading} />

        {/* Modal: Add Company */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Corporate Partner Company"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Industry</label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder="e.g. Enterprise Cloud, FinTech"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Headquarters / Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Bengaluru / Hybrid"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Person</label>
                <input
                  type="text"
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Website URL</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
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
                Save Company
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default CompanyManagementPage;
