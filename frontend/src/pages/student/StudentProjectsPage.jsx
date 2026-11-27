import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { projectsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Plus,
  Code2,
  ExternalLink,
  Star,
  Calendar,
  Trash2,
} from "lucide-react";

export const StudentProjectsPage = () => {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    tech_input: "",
    github_url: "",
    live_url: "",
    completion_date: "",
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getProjects();
      setProjects(res.data.results || res.data || []);
    } catch (err) {
      console.error("Load projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const techNames = formData.tech_input
        ? formData.tech_input.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      await projectsApi.createProject({
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        github_url: formData.github_url,
        live_url: formData.live_url,
        completion_date: formData.completion_date || null,
        tech_names: techNames,
      });

      toast.success("Project added to your portfolio!");
      setIsModalOpen(false);
      setFormData({
        title: "",
        tagline: "",
        description: "",
        tech_input: "",
        github_url: "",
        live_url: "",
        completion_date: "",
      });
      loadProjects();
    } catch (err) {
      toast.error("Failed to create project.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await projectsApi.deleteProject(id);
      toast.success("Project removed.");
      loadProjects();
    } catch (err) {
      toast.error("Failed to delete project.");
    }
  };

  return (
    <AppLayout title="Project Portfolio">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Engineering Portfolio</h2>
            <p className="text-xs text-slate-500">
              Showcase full-stack applications, repositories, and live cloud deployments evaluated by trainers.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{proj.title}</h3>
                    {proj.tagline && (
                      <p className="text-xs font-medium text-blue-600 mt-1">{proj.tagline}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                        title="GitHub Repository"
                      >
                        <Code2 className="w-4 h-4" />
                      </a>
                    )}
                    {proj.live_url && (
                      <a
                        href={proj.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{proj.description}</p>

                {/* Tech Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {proj.technologies?.map((tech) => (
                    <span
                      key={tech.id}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold border border-slate-200/80"
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>

                {/* Trainer Reviews */}
                {proj.reviews && proj.reviews.length > 0 && (
                  <div className="mt-5 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs text-emerald-950">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1 text-emerald-800">
                        <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                        <span>Faculty Evaluation: {proj.reviews[0].rating}/5</span>
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        By {proj.reviews[0].reviewer_name}
                      </span>
                    </div>
                    <p className="text-slate-700 italic text-[11px]">"{proj.reviews[0].feedback}"</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{proj.completion_date ? `Completed: ${proj.completion_date}` : "In Development"}</span>
                </span>
                <Badge variant={proj.status === "COMPLETED" ? "success" : "neutral"} size="sm">
                  {proj.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Project */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Production Project"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Project Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="e.g. ApexTrade — Real-time Financial Portfolio"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Short Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="e.g. Sub-second WebSocket price streaming with PostgreSQL analytics"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Detailed Description & Architecture
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="Describe key architecture decisions, database queries, and problems solved..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Technologies Used (Comma separated)
              </label>
              <input
                type="text"
                value={formData.tech_input}
                onChange={(e) => setFormData({ ...formData, tech_input: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="e.g. React 19, Django REST, PostgreSQL, Docker, Tailwind"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Live Deployment URL
                </label>
                <input
                  type="url"
                  value={formData.live_url}
                  onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="https://demo.app"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Completion Date
              </label>
              <input
                type="date"
                value={formData.completion_date}
                onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
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
                Publish Project
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default StudentProjectsPage;
