import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { academicsApi, studentApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Plus, Trash2 } from "lucide-react";

export const EnrollmentPage = () => {
  const toast = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    student: "",
    batch: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [enrRes, stuRes, batRes] = await Promise.all([
        academicsApi.getEnrollments(),
        studentApi.getProfiles(),
        academicsApi.getBatches(),
      ]);
      setEnrollments(enrRes.data.results || enrRes.data || []);
      setStudents(stuRes.data.results || stuRes.data || []);
      setBatches(batRes.data.results || batRes.data || []);
    } catch (err) {
      console.error("Load enrollments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await academicsApi.createEnrollment({
        student: Number(form.student),
        batch: Number(form.batch),
      });
      toast.success("Student enrolled in batch!");
      setIsModalOpen(false);
      setForm({ student: "", batch: "" });
      loadData();
    } catch (err) {
      toast.error("Failed to enroll student. Student might already be enrolled in this batch.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this enrollment?")) return;
    try {
      await academicsApi.deleteEnrollment(id);
      toast.success("Enrollment removed.");
      loadData();
    } catch (err) {
      toast.error("Failed to remove enrollment.");
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
      header: "Training Batch",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-800">{row.batch_name}</span>
      ),
    },
    {
      header: "Academic Stream",
      render: (row) => (
        <span className="text-xs text-slate-600">{row.course_name}</span>
      ),
    },
    {
      header: "Enrollment Date",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.enrolled_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Course Status",
      render: (row) => (
        <Badge variant={row.completed ? "success" : "primary"} size="sm">
          {row.completed ? "Completed" : "Active Training"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <AppLayout title="Student Batch Enrollments">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Course & Batch Enrollments</h2>
            <p className="text-xs text-slate-500">
              Assign admitted students to active cohorts and verify academic progress.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>

        <DataTable columns={columns} data={enrollments} loading={loading} />

        {/* Modal: Enroll Student */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Enroll Student in Training Batch"
        >
          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Student
              </label>
              <select
                required
                value={form.student}
                onChange={(e) => setForm({ ...form, student: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <option value="">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user.full_name} (@{s.user.username}) — {s.college || "No college"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Active Batch
              </label>
              <select
                required
                value={form.batch}
                onChange={(e) => setForm({ ...form, batch: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <option value="">-- Choose Batch --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.course_name})
                  </option>
                ))}
              </select>
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
                Confirm Enrollment
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default EnrollmentPage;
