import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import { academicsApi, assessmentsApi } from "../../services/api";
import { DUMMY_BATCHES, DUMMY_SUBMISSIONS, DUMMY_QUIZZES, DUMMY_ASSIGNMENTS } from "../../data/dummyData";
import { Calendar, Users, FileCheck2, ClipboardList, BookOpen, ArrowRight, Sparkles } from "lucide-react";

export const TrainerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [batches, setBatches] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainerData = async () => {
      try {
        const [sumRes, batRes, subRes] = await Promise.all([
          academicsApi.getTrainerSummary(),
          academicsApi.getBatches(),
          assessmentsApi.getSubmissions(),
        ]);
        setSummary(sumRes.data);
        const apiBatches = batRes.data.results || batRes.data || [];
        const apiSubs = subRes.data.results || subRes.data || [];
        setBatches(apiBatches.length > 0 ? apiBatches : DUMMY_BATCHES.slice(0, 5));
        setSubmissions(apiSubs.length > 0 ? apiSubs : DUMMY_SUBMISSIONS);
      } catch (err) {
        console.error("Trainer dashboard load error:", err);
        setBatches(DUMMY_BATCHES.slice(0, 5));
        setSubmissions(DUMMY_SUBMISSIONS);
      } finally {
        setLoading(false);
      }
    };
    loadTrainerData();
  }, []);

  const dummySummary = {
    assigned_batches_count: DUMMY_BATCHES.length,
    total_students: 25,
    pending_evaluations: DUMMY_SUBMISSIONS.filter(s => s.status === "SUBMITTED").length,
    total_assessments_created: DUMMY_QUIZZES.length + DUMMY_ASSIGNMENTS.length,
  };

  const displaySummary = summary?.assigned_batches_count ? summary : dummySummary;

  const cardStyle = { backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "1rem" };
  const textPrimary = { color: "var(--text-primary)" };
  const textSecondary = { color: "var(--text-secondary)" };

  return (
    <AppLayout title="Faculty Trainer Workspace" subtitle="Academic delivery, cohorts, and evaluations">
      <div className="space-y-7">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2E1065] via-[#6D28D9] to-[#4338CA] animate-gradient-x p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-white/10 border border-white/15 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /><span>Academic Delivery & Mentorship</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3" style={{ fontFamily: "Sora, sans-serif" }}>
              Faculty Instructor Portal
            </h2>
            <p className="text-violet-100/90 text-sm mt-2 max-w-xl leading-relaxed">
              Manage assigned cohorts, publish course modules, take daily attendance, grade assessments, and verify student skills.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-2.5 shrink-0">
            <Link to="/trainer/assessments" className="inline-flex items-center gap-2 bg-white text-violet-950 hover:bg-violet-50 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition">
              <ClipboardList className="w-4 h-4 text-violet-600" /><span>Create Assessment</span>
            </Link>
            <Link to="/trainer/batches" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs px-5 py-3 rounded-xl transition">
              <Calendar className="w-4 h-4" /><span>Manage Batches</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Assigned Batches" value={loading ? "—" : displaySummary.assigned_batches_count} subtitle="Active cohorts" icon={Calendar} color="purple" />
          <StatCard title="Total Students" value={loading ? "—" : displaySummary.total_students} subtitle="Under your mentorship" icon={Users} color="blue" />
          <StatCard title="Pending Evaluations" value={loading ? "—" : displaySummary.pending_evaluations} subtitle="Awaiting review" icon={FileCheck2} color="amber" />
          <StatCard title="Assessments Built" value={loading ? "—" : displaySummary.total_assessments_created} subtitle="Published quizzes & tasks" icon={BookOpen} color="teal" />
        </div>

        {/* Batches & Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold" style={{ ...textPrimary, fontFamily: "Sora, sans-serif" }}>Assigned Training Batches</h3>
              <Link to="/trainer/batches" className="text-xs font-bold hover:underline" style={{ color: "var(--color-purple)" }}>
                Attendance & Modules →
              </Link>
            </div>
            <div className="space-y-3">
              {batches.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>No batches assigned yet.</p>
              ) : (
                batches.slice(0, 5).map((batch) => (
                  <div
                    key={batch.id}
                    className="p-4 rounded-xl flex items-center justify-between"
                    style={{ backgroundColor: "var(--color-purple-subtle)", border: "1px solid rgba(139,92,246,0.15)" }}
                  >
                    <div>
                      <h4 className="font-bold text-sm" style={textPrimary}>{batch.name}</h4>
                      <p className="text-xs mt-0.5" style={textSecondary}>{batch.course_name}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="purple" size="sm">{batch.students_count || 0} Students</Badge>
                      <span className="text-[10px] block mt-1" style={{ color: "var(--text-muted)" }}>Start: {batch.start_date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold" style={{ ...textPrimary, fontFamily: "Sora, sans-serif" }}>Recent Student Submissions</h3>
              <Link to="/trainer/evaluations" className="text-xs font-bold hover:underline" style={{ color: "var(--color-purple)" }}>
                Evaluate All →
              </Link>
            </div>
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>No student submissions received.</p>
              ) : (
                submissions.slice(0, 5).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl flex items-center justify-between"
                    style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <h4 className="font-bold text-xs" style={textPrimary}>{sub.student_name}</h4>
                      <p className="text-[11px] mt-0.5" style={textSecondary}>{sub.assessment_title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={sub.status === "EVALUATED" ? "success" : "warning"} size="sm">
                        {sub.status}
                      </Badge>
                      <Link to="/trainer/evaluations" className="text-xs font-bold hover:underline inline-flex items-center gap-0.5" style={{ color: "var(--color-purple)" }}>
                        <span>Review</span><ArrowRight className="w-3 h-3" />
                      </Link>
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

export default TrainerDashboard;
