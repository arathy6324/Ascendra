import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import { studentApi, assessmentsApi, skillsApi, projectsApi, placementsApi } from "../../services/api";
import {
  BookOpen,
  ClipboardList,
  Award,
  FolderGit2,
  Briefcase,
  ArrowRight,
  ExternalLink,
  Code2,
  Sparkles,
  CheckCircle2,
  Compass,
} from "lucide-react";

export const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, assessRes, skillsRes, projRes, appsRes] = await Promise.all([
          studentApi.getMyProfile(),
          assessmentsApi.getAssessments(),
          skillsApi.getStudentSkills(),
          projectsApi.getProjects(),
          placementsApi.getApplications(),
        ]);
        setProfile(profRes.data);
        setAssessments(assessRes.data.results || assessRes.data || []);
        setSkills(skillsRes.data.results || skillsRes.data || []);
        setProjects(projRes.data.results || projRes.data || []);
        setApplications(appsRes.data.results || appsRes.data || []);
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const enrolledCourse = profile?.enrolled_courses?.[0];

  const calculateReadiness = () => {
    let score = 20;
    if (skills.length > 0) score += Math.min(skills.length * 10, 25);
    if (projects.length > 0) score += Math.min(projects.length * 15, 30);
    if (assessments.some((a) => a.my_submission?.passed)) score += 15;
    if (profile?.github_url && profile?.linkedin_url) score += 10;
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadiness();

  return (
    <AppLayout title="Student Learning Hub" subtitle="Track coursework, skills, projects, and placement drives">
      <div className="space-y-7">
        {/* Vibrant Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-600 via-cyan-600 to-teal-500 animate-gradient-x p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -left-10 -bottom-12 w-56 h-56 rounded-full bg-teal-300/20 blur-2xl" />
          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/15 border border-white/20 px-3 py-1 rounded-full text-cyan-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Career Progression Workspace</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
              Welcome back, {profile?.user?.first_name || "Learner"}!
            </h2>
            <p className="mt-2 text-sm text-blue-50/90 leading-relaxed">
              Complete your modules, verify technical skills, showcase production builds, and apply for curated hiring opportunities.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full font-semibold">
                Batch: {profile?.active_batch_name || "Unassigned"}
              </span>
              <span className="bg-amber-400/25 border border-amber-300/40 text-amber-100 px-3 py-1 rounded-full font-bold">
                Status: {profile?.status || "LEARNING"}
              </span>
              <span className="bg-emerald-400/25 border border-emerald-300/40 text-emerald-100 px-3 py-1 rounded-full font-bold">
                {applications.length} Active Applications
              </span>
            </div>
          </div>

          <div className="relative bg-slate-950/25 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center shrink-0 w-full sm:w-56">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">
              Career Readiness
            </p>
            <p className="text-4xl font-extrabold text-white mt-1 tabular-nums">{readinessScore}%</p>
            <div className="w-full bg-white/20 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-300 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <Link
              to="/student/profile"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-200 hover:text-white transition"
            >
              <span>Boost Score & Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Colorful Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Enrolled Courses"
            value={profile?.enrolled_courses?.length || 0}
            subtitle={enrolledCourse?.course_name || "No course enrolled"}
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            title="Assessments"
            value={assessments.length}
            subtitle={`${assessments.filter((a) => a.my_submission).length} Completed`}
            icon={ClipboardList}
            color="purple"
          />
          <StatCard
            title="Verified Skills"
            value={skills.length}
            subtitle={`${skills.filter((s) => s.verified_by_trainer).length} Trainer Verified`}
            icon={Award}
            color="emerald"
          />
          <StatCard
            title="Portfolio Projects"
            value={projects.length}
            subtitle="Production Builds"
            icon={FolderGit2}
            color="amber"
          />
        </div>

        {/* Curriculum & Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active Curriculum
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                {enrolledCourse?.course_name || "Explore Your Enrolled Curriculum"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Instructor: {enrolledCourse?.trainer_name || "Assigned Faculty"} • Batch: {enrolledCourse?.batch_name || "Pending Cohort"}
              </p>
            </div>
            <Link
              to="/student/academics"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2.5 rounded-xl border border-indigo-200 transition"
            >
              <span>Open Modules & Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <Link
              to="/student/assessments"
              className="p-4 bg-violet-50/70 hover:bg-violet-50 rounded-2xl border border-violet-200/80 transition group"
            >
              <span className="font-bold text-violet-700 uppercase text-[10px] tracking-wider block">Next Quiz</span>
              <span className="font-bold text-slate-900 text-sm mt-1 block group-hover:text-violet-700">
                {assessments.filter((a) => !a.my_submission).length} Pending Assessments
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Objective auto-grading enabled</p>
            </Link>
            <Link
              to="/student/placements"
              className="p-4 bg-amber-50/70 hover:bg-amber-50 rounded-2xl border border-amber-200/80 transition group"
            >
              <span className="font-bold text-amber-800 uppercase text-[10px] tracking-wider block">Hiring Pipeline</span>
              <span className="font-bold text-slate-900 text-sm mt-1 block group-hover:text-amber-800">
                {applications.length} Job Applications
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Explore open verified vacancies</p>
            </Link>
            <Link
              to="/student/profile"
              className="p-4 bg-emerald-50/70 hover:bg-emerald-50 rounded-2xl border border-emerald-200/80 transition group"
            >
              <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider block">Alumni Mentors</span>
              <span className="font-bold text-slate-900 text-sm mt-1 block group-hover:text-emerald-700">
                Request 1:1 Career Mentorship
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Connect with industry graduates</p>
            </Link>
          </div>
        </div>

        {/* Assessments & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Assessments & Quizzes</h3>
              <Link to="/student/assessments" className="text-xs font-bold text-indigo-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-xs text-slate-400 py-6 text-center">Loading assessments...</p>
              ) : assessments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No tests assigned yet.</p>
              ) : (
                assessments.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{a.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Total: {a.total_marks} pts • Pass: {a.passing_marks} pts
                      </p>
                    </div>
                    {a.my_submission ? (
                      <Badge variant={a.my_submission.passed ? "success" : "warning"} size="sm">
                        {a.my_submission.total_score ?? "Pending"} pts
                      </Badge>
                    ) : (
                      <Link
                        to="/student/assessments"
                        className="text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 rounded-xl shadow-xs hover:brightness-105 transition shrink-0"
                      >
                        Start Test
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Portfolio Projects</h3>
              <Link to="/student/projects" className="text-xs font-bold text-indigo-600 hover:underline">
                Manage Portfolio →
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-xs text-slate-400 py-6 text-center">Loading projects...</p>
              ) : projects.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-500">No projects added yet.</p>
                  <Link to="/student/projects" className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:underline">
                    + Add your first project
                  </Link>
                </div>
              ) : (
                projects.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{p.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.tagline || p.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.github_url && (
                        <a
                          href={p.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {p.live_url && (
                        <a
                          href={p.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
