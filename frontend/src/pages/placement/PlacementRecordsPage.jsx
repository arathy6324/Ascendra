import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { placementsApi, studentApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Plus } from "lucide-react";

export const PlacementRecordsPage = () => {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    student: "",
    company: "",
    role_offered: "",
    ctc: "",
    placed_date: new Date().toISOString().split("T")[0],
    joining_status: "JOINED",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, stuRes, compRes] = await Promise.all([
        placementsApi.getPlacementRecords(),
        studentApi.getProfiles(),
        placementsApi.getCompanies(),
      ]);
      setRecords(recRes.data.results || recRes.data || []);
      setStudents(stuRes.data.results || stuRes.data || []);
      setCompanies(compRes.data.results || compRes.data || []);
    } catch (err) {
      console.error("Load placement records error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await placementsApi.createPlacementRecord({
        ...form,
        student: Number(form.student),
        company: Number(form.company),
      });
      toast.success("Placement record saved!");
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error("Failed to record placement.");
    }
  };

  const columns = [
    {
      header: "Placed Student",
      render: (row) => (
        <div>
          <h4 className="font-semibold text-sm text-slate-900">{row.student_name}</h4>
          <p className="text-xs text-slate-500">{row.student_email} • {row.student_college}</p>
        </div>
      ),
    },
    {
      header: "Hiring Company",
      accessor: "company_name",
      render: (row) => <span className="text-xs font-bold text-slate-800">{row.company_name}</span>,
    },
    {
      header: "Designation Offered",
      accessor: "role_offered",
      render: (row) => <span className="text-xs text-slate-700">{row.role_offered}</span>,
    },
    {
      header: "Annual Package (CTC)",
      accessor: "ctc",
      render: (row) => <span className="text-xs font-bold text-emerald-600 font-mono">{row.ctc}</span>,
    },
    {
      header: "Placed Date",
      accessor: "placed_date",
      render: (row) => <span className="text-xs text-slate-500">{row.placed_date}</span>,
    },
    {
      header: "Joining Status",
      render: (row) => (
        <Badge variant={row.joining_status === "JOINED" ? "success" : "warning"} size="sm">
          {row.joining_status}
        </Badge>
      ),
    },
  ];

  return (
    <AppLayout title="Official Placement Records">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Institutional Placement Ledger</h2>
            <p className="text-xs text-slate-500">
              Official verification of employment offers, compensation packages, and corporate join dates.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Placement</span>
          </button>
        </div>

        <DataTable columns={columns} data={records} loading={loading} />

        {/* Modal: Record Placement */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Official Student Placement"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Student</label>
              <select
                required
                value={form.student}
                onChange={(e) => setForm({ ...form, student: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <option value="">-- Choose Candidate --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user.full_name} (@{s.user.username}) — Status: {s.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hiring Company</label>
              <select
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <option value="">-- Choose Partner Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role / Designation</label>
                <input
                  type="text"
                  required
                  value={form.role_offered}
                  onChange={(e) => setForm({ ...form, role_offered: e.target.value })}
                  placeholder="e.g. Cloud Platform Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Offered Package (CTC)</label>
                <input
                  type="text"
                  required
                  value={form.ctc}
                  onChange={(e) => setForm({ ...form, ctc: e.target.value })}
                  placeholder="e.g. 10.5 LPA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Offer / Placed Date</label>
                <input
                  type="date"
                  required
                  value={form.placed_date}
                  onChange={(e) => setForm({ ...form, placed_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Joining Status</label>
                <select
                  value={form.joining_status}
                  onChange={(e) => setForm({ ...form, joining_status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
                >
                  <option value="JOINED">Joined</option>
                  <option value="YET_TO_JOIN">Yet to Join</option>
                  <option value="OPTED_OUT">Opted Out</option>
                </select>
              </div>
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
                Save Placement Record
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default PlacementRecordsPage;
