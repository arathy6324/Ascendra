import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/ui/Modal";
import { careersApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Plus, Sparkles } from "lucide-react";

export const AlumniMilestonesPage = () => {
  const toast = useToast();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    company_name: "",
    date_achieved: new Date().toISOString().split("T")[0],
    description: "",
  });

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const res = await careersApi.getMilestones();
      setMilestones(res.data.results || res.data || []);
    } catch (err) {
      console.error("Load milestones error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await careersApi.createMilestone(form);
      toast.success("Career milestone shared with the community!");
      setIsModalOpen(false);
      setForm({
        title: "",
        company_name: "",
        date_achieved: new Date().toISOString().split("T")[0],
        description: "",
      });
      loadMilestones();
    } catch (err) {
      toast.error("Failed to share milestone.");
    }
  };

  return (
    <AppLayout title="Alumni Career Milestones">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Community Career Highlights</h2>
            <p className="text-xs text-slate-500">
              Celebrate promotions, leadership milestones, company transitions, and startup launches with the network.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Share My Milestone</span>
          </button>
        </div>

        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No milestones shared yet. Be the first to share an achievement!
            </div>
          ) : (
            milestones.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-start gap-4"
              >
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                    <span className="text-xs text-slate-400">
                      {new Date(m.date_achieved).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Shared by <span className="font-semibold text-slate-800">{m.student_name}</span>
                    {m.company_name && ` at ${m.company_name}`}
                  </p>
                  {m.description && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{m.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Add Milestone */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Share Career Milestone"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Milestone Headline
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Promoted to Staff Engineer, Launched Enterprise SaaS"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  placeholder="e.g. CloudScale Systems"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Date Achieved
                </label>
                <input
                  type="date"
                  required
                  value={form.date_achieved}
                  onChange={(e) => setForm({ ...form, date_achieved: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Story / Reflection
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Share lessons learned, challenges overcome or advice for current students..."
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
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                Post Milestone
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default AlumniMilestonesPage;
