import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Badge from "../../components/ui/Badge";
import { studentApi, assessmentsApi, skillsApi, projectsApi } from "../../services/api";
import { History, BookOpen, Award, FolderGit2, CheckCircle2, Code2, ExternalLink } from "lucide-react";

export const AlumniHistoryPage = () => {
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [profRes, subRes, skRes, prRes] = await Promise.all([
          studentApi.getMyProfile(),
          assessmentsApi.getSubmissions(),
          skillsApi.getStudentSkills(),
          projectsApi.getProjects(),
        ]);
        setProfile(profRes.data);
        setSubmissions(subRes.data.results || subRes.data || []);
        setSkills(skRes.data.results || skRes.data || []);
        setProjects(prRes.data.results || prRes.data || []);
      } catch (err) {
        console.error("Failed to load academic history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  return (
    <AppLayout title="Preserved Academic History" subtitle="Permanent institutional transcript, skills, and project archive">
      <div className="space-y-7">
        {/* Transcript Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
              <History className="w-3.5 h-3.5" />
              <span>Official Single-Account Archive</span>
            </span>
            <h2 className="text-2xl font-extrabold mt-2">{profile?.user?.full_name || "Alumni Transcript"}</h2>
            <p className="text-xs sm:text-sm text-emerald-50/90 mt-1">
              {profile?.qualification} • {profile?.college} • Graduated {profile?.graduation_year}
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-xs border border-white/20 px-5 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-amber-300" />
            <span>Verified Institutional Record</span>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">Completed Courses & Batches</h3>
          </div>
          {loading ? (
            <p className="text-xs text-slate-400 py-4">Loading history...</p>
          ) : !profile?.enrolled_courses?.length ? (
            <p className="text-xs text-slate-400 py-4">No archived enrollments found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.enrolled_courses.map((c) => (
                <div key={c.enrollment_id} className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/70 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{c.course_name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Batch: {c.batch_name} • Trainer: {c.trainer_name}</p>
                  </div>
                  <Badge variant={c.completed ? "success" : "primary"} size="sm">
                    {c.completed ? "Completed" : "Archived"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assessment Results & Verified Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Assessment Transcript</h3>
            {submissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No archived assessment submissions.</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{sub.assessment_title}</h4>
                      <p className="text-[11px] text-slate-500">Submitted {new Date(sub.submitted_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={sub.passed ? "success" : "warning"} size="sm">
                      {sub.total_score ?? 0} / {sub.total_marks} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">Verified Skills</h3>
            </div>
            {skills.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No archived skills recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((sk) => (
                  <div key={sk.id} className="px-3.5 py-2 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <span>{sk.skill_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-emerald-700">{sk.proficiency_level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Projects Archive */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <FolderGit2 className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900">Archived Engineering Projects</h3>
          </div>
          {projects.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No projects archived.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{p.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AlumniHistoryPage;
