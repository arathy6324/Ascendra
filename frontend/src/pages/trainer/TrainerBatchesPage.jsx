import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import { academicsApi } from "../../services/api";
import { Calendar, Users, Plus, BookOpen, CheckCircle2, Clock } from "lucide-react";

export const TrainerBatchesPage = () => {
  const toast = useToast();
  const [batches, setBatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    course: "",
    title: "",
    description: "",
    order: 1,
    duration_weeks: 2,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, eRes] = await Promise.all([
        academicsApi.getBatches(),
        academicsApi.getEnrollments(),
      ]);
      const bList = bRes.data.results || bRes.data || [];
      setBatches(bList);
      setEnrollments(eRes.data.results || eRes.data || []);
      if (bList.length > 0 && !selectedBatch) {
        setSelectedBatch(bList[0]);
      }
    } catch (err) {
      console.error("Failed to load trainer batches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const batchEnrollments = selectedBatch
    ? enrollments.filter((e) => e.batch === selectedBatch.id)
    : [];

  const handleMarkAttendance = async (studentId, status) => {
    if (!selectedBatch) return;
    try {
      await academicsApi.recordAttendance({
        batch: selectedBatch.id,
        student: studentId,
        date: attDate,
        status,
      });
      toast.success(`Marked ${status} for ${attDate}.`);
    } catch (err) {
      toast.error("Failed to record attendance.");
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await academicsApi.createModule({
        ...moduleForm,
        course: Number(moduleForm.course),
        order: Number(moduleForm.order),
        duration_weeks: Number(moduleForm.duration_weeks),
      });
      toast.success("Curriculum module published!");
      setIsModuleModalOpen(false);
      setModuleForm({ course: "", title: "", description: "", order: 1, duration_weeks: 2 });
    } catch (err) {
      toast.error("Failed to add curriculum module.");
    }
  };

  return (
    <AppLayout title="Assigned Batches & Attendance" subtitle="Manage daily cohort attendance and publish syllabus modules">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Your Active Cohorts</h2>
            <p className="text-xs text-slate-500">Select a batch to take attendance or add course modules.</p>
          </div>
          <button
            onClick={() => {
              setModuleForm((prev) => ({ ...prev, course: selectedBatch?.course || "" }));
              setIsModuleModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:brightness-105 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course Module</span>
          </button>
        </div>

        {/* Batch Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-400">Loading batches...</div>
          ) : batches.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              No batches assigned to you yet.
            </div>
          ) : (
            batches.map((b) => {
              const active = selectedBatch?.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatch(b)}
                  className={`text-left p-5 rounded-2xl border transition ${
                    active
                      ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-transparent shadow-md"
                      : "bg-white border-slate-200 hover:border-violet-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase ${active ? "text-violet-200" : "text-violet-600"}`}>
                      {b.course_name}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                      {b.students_count || 0} Learners
                    </span>
                  </div>
                  <h3 className={`text-base font-extrabold mt-2 ${active ? "text-white" : "text-slate-900"}`}>
                    {b.name}
                  </h3>
                  <p className={`text-xs mt-1 ${active ? "text-violet-100" : "text-slate-500"}`}>
                    Start Date: {b.start_date}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Attendance Roster */}
        {selectedBatch && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Attendance Roster — {selectedBatch.name}
                </h3>
                <p className="text-xs text-slate-500">Mark present, late, or absent for the selected session date.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Session Date:</label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            {batchEnrollments.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No students enrolled in this batch.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {batchEnrollments.map((enr) => (
                  <div key={enr.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{enr.student_name}</p>
                      <p className="text-xs text-slate-500">{enr.student_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkAttendance(enr.student, "PRESENT")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(enr.student, "LATE")}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition"
                      >
                        Late
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(enr.student, "ABSENT")}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Modal isOpen={isModuleModalOpen} onClose={() => setIsModuleModalOpen(false)} title="Publish Curriculum Module">
          <form onSubmit={handleCreateModule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Course</label>
              <select
                required
                value={moduleForm.course}
                onChange={(e) => setModuleForm({ ...moduleForm, course: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                <option value="">-- Choose Course --</option>
                {Array.from(new Map(batches.map((b) => [b.course, b.course_name])).entries()).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Module Title</label>
              <input
                type="text"
                required
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="e.g. Microservices & Container Orchestration"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Module Order</label>
                <input
                  type="number"
                  min="1"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Duration (Weeks)</label>
                <input
                  type="number"
                  min="1"
                  value={moduleForm.duration_weeks}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration_weeks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Module Overview</label>
              <textarea
                rows={3}
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModuleModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold">
                Publish Module
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default TrainerBatchesPage;
