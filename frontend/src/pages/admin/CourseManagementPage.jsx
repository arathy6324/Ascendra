import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { academicsApi, adminApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { BookOpen, Calendar, Plus, Users, Clock } from "lucide-react";

export const CourseManagementPage = ({ defaultTab = "courses" }) => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Forms
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    duration_months: 6,
    description: "",
  });

  const [batchForm, setBatchForm] = useState({
    name: "",
    course: "",
    trainer: "",
    start_date: "",
    end_date: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, bRes, uRes] = await Promise.all([
        academicsApi.getCourses(),
        academicsApi.getBatches(),
        adminApi.getUsers({ role: "TRAINER" }),
      ]);
      setCourses(cRes.data.results || cRes.data || []);
      setBatches(bRes.data.results || bRes.data || []);
      setTrainers(uRes.data.results || uRes.data || []);
    } catch (err) {
      console.error("Load courses/batches error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await academicsApi.createCourse(courseForm);
      toast.success("Course created successfully!");
      setIsCourseModalOpen(false);
      setCourseForm({ name: "", code: "", duration_months: 6, description: "" });
      loadData();
    } catch (err) {
      toast.error("Failed to create course.");
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await academicsApi.createBatch({
        ...batchForm,
        trainer: batchForm.trainer ? Number(batchForm.trainer) : null,
        course: Number(batchForm.course),
      });
      toast.success("Training batch created!");
      setIsBatchModalOpen(false);
      setBatchForm({ name: "", course: "", trainer: "", start_date: "", end_date: "" });
      loadData();
    } catch (err) {
      toast.error("Failed to create batch.");
    }
  };

  return (
    <AppLayout title="Academic Curriculum & Batches">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("courses")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === "courses"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Courses ({courses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("batches")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === "batches"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Training Batches ({batches.length})</span>
            </button>
          </div>

          <div className="pb-3">
            {activeTab === "courses" ? (
              <button
                onClick={() => setIsCourseModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Course</span>
              </button>
            ) : (
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Batch</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Courses */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {course.code || "COURSE"}
                    </span>
                    <Badge variant={course.is_active ? "success" : "neutral"} size="sm">
                      {course.is_active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{course.name}</h3>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {course.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{course.duration_months} Months</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{course.students_count || 0} Students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Batches */}
        {activeTab === "batches" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">{batch.course_name}</span>
                    <Badge variant={batch.is_active ? "primary" : "neutral"} size="sm">
                      {batch.is_active ? "Ongoing" : "Completed"}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{batch.name}</h3>
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500">Assigned Faculty Trainer:</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{batch.trainer_name}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Start: {batch.start_date}</span>
                  <span className="font-bold text-slate-800">{batch.students_count || 0} Enrolled</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: New Course */}
        <Modal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          title="Create New Academic Course"
        >
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Title</label>
              <input
                type="text"
                required
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. FSCA-2026"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Months)</label>
                <input
                  type="number"
                  required
                  value={courseForm.duration_months}
                  onChange={(e) => setCourseForm({ ...courseForm, duration_months: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Curriculum Overview</label>
              <textarea
                rows={3}
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Save Course
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: New Batch */}
        <Modal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          title="Create Training Batch & Assign Trainer"
        >
          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Batch Name</label>
              <input
                type="text"
                required
                value={batchForm.name}
                onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="e.g. Alpha Batch 2026-Q1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Course</label>
              <select
                required
                value={batchForm.course}
                onChange={(e) => setBatchForm({ ...batchForm, course: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign Trainer</label>
              <select
                value={batchForm.trainer}
                onChange={(e) => setBatchForm({ ...batchForm, trainer: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">-- Unassigned --</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} (@{t.username})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={batchForm.start_date}
                  onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Date (Target)</label>
                <input
                  type="date"
                  value={batchForm.end_date}
                  onChange={(e) => setBatchForm({ ...batchForm, end_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Create Batch
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default CourseManagementPage;
