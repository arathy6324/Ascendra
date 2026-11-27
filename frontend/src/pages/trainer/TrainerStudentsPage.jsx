import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import { studentApi, skillsApi, projectsApi } from "../../services/api";
import { ShieldCheck, Star, Code2, ExternalLink, Award, FolderGit2 } from "lucide-react";

export const TrainerStudentsPage = () => {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewProject, setReviewProject] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, feedback: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuRes, skRes, prRes] = await Promise.all([
        studentApi.getProfiles(),
        skillsApi.getStudentSkills(),
        projectsApi.getProjects(),
      ]);
      setStudents(stuRes.data.results || stuRes.data || []);
      setSkills(skRes.data.results || skRes.data || []);
      setProjects(prRes.data.results || prRes.data || []);
    } catch (err) {
      console.error("Failed to load trainer students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifySkill = async (skillId) => {
    try {
      await skillsApi.verifyStudentSkill(skillId);
      toast.success("Skill endorsed as Trainer Verified!");
      loadData();
    } catch (err) {
      toast.error("Failed to verify skill.");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewProject) return;
    try {
      await projectsApi.reviewProject(reviewProject.id, {
        rating: Number(reviewForm.rating),
        feedback: reviewForm.feedback,
      });
      toast.success("Project evaluation saved!");
      setReviewProject(null);
      setReviewForm({ rating: 5, feedback: "" });
      loadData();
    } catch (err) {
      toast.error("Failed to submit project review.");
    }
  };

  return (
    <AppLayout title="Student Progress & Verification" subtitle="Verify learner competencies and evaluate portfolio projects">
      <div className="space-y-7">
        {/* Students Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 mb-4">Learners Under Your Guidance ({students.length})</h2>
          {loading ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No students assigned to your batches yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{s.user.full_name}</h4>
                    <Badge variant={s.status === "PLACED" ? "success" : s.status === "PLACEMENT_READY" ? "warning" : "primary"} size="sm">
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{s.college || "Ascendra Cohort"} • {s.course_name}</p>
                  <p className="text-[11px] font-semibold text-violet-700">Batch: {s.active_batch_name || "Assigned"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Skill Verifications */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900">Student Skills Verification Queue</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skills.map((sk) => (
              <div key={sk.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{sk.skill_name}</h4>
                  <p className="text-xs text-slate-500">{sk.student_name} • Level: {sk.proficiency_level}</p>
                </div>
                {sk.verified_by_trainer ? (
                  <Badge variant="success" size="sm">Verified</Badge>
                ) : (
                  <button
                    onClick={() => handleVerifySkill(sk.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Projects Review */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <FolderGit2 className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-extrabold text-slate-900">Portfolio Projects for Review</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                      <p className="text-xs text-violet-700 font-semibold">By {p.student_name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.github_url && (
                        <a href={p.github_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                          <Code2 className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {p.live_url && (
                        <a href={p.live_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{p.description}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
                  {p.reviews?.length > 0 ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      Rated {p.reviews[0].rating}/5
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Not reviewed yet</span>
                  )}
                  <button
                    onClick={() => {
                      setReviewProject(p);
                      setReviewForm({
                        rating: p.reviews?.[0]?.rating || 5,
                        feedback: p.reviews?.[0]?.feedback || "",
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition"
                  >
                    {p.reviews?.length > 0 ? "Update Review" : "Review Project"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Modal isOpen={!!reviewProject} onClose={() => setReviewProject(null)} title={`Review Project: ${reviewProject?.title}`}>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Rating (1 - 5)</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} / 5 Stars</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Technical Feedback</label>
              <textarea
                rows={3}
                required
                value={reviewForm.feedback}
                onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                placeholder="Comment on code structure, deployment, UX, and database design..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setReviewProject(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold">
                Publish Review
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default TrainerStudentsPage;
