import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { commonApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Plus } from "lucide-react";

export const AnnouncementsPage = () => {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    target_role: "ALL",
  });

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await commonApi.getAnnouncements();
      setAnnouncements(res.data.results || res.data || []);
    } catch (err) {
      console.error("Load announcements error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await commonApi.createAnnouncement(form);
      toast.success("Announcement published!");
      setIsModalOpen(false);
      setForm({ title: "", content: "", target_role: "ALL" });
      loadAnnouncements();
    } catch (err) {
      toast.error("Failed to publish announcement.");
    }
  };

  return (
    <AppLayout title="Platform Announcements">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Broadcast Announcements</h2>
            <p className="text-xs text-slate-500">
              Publish official notices to all users or target specific roles (Students, Trainers, Placement, Alumni).
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>

        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  Target: {ann.target_role}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(ann.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
            </div>
          ))}
        </div>

        {/* Modal: New Announcement */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Platform Announcement"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Announcement Headline
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Target User Group
              </label>
              <select
                value={form.target_role}
                onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <option value="ALL">All Users</option>
                <option value="STUDENT">Students Only</option>
                <option value="TRAINER">Faculty Trainers Only</option>
                <option value="PLACEMENT">Placement Officers Only</option>
                <option value="ALUMNI">Alumni Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Announcement Body
              </label>
              <textarea
                rows={4}
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
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
                Publish Notice
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default AnnouncementsPage;
