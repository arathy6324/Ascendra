import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/ui/StatCard";
import { adminApi } from "../../services/api";
import { DUMMY_ADMIN_METRICS } from "../../data/dummyData";
import {
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  Calendar,
  CheckCircle,
  Award,
  ArrowUpRight,
  Megaphone,
  UserPlus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const BAR_COLORS = ["#5B6CF8", "#0D9488", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await adminApi.getAnalyticsSummary();
        const apiData = res.data;
        // Use dummy data if API returns empty/zero metrics
        if (!apiData?.metrics?.total_students) {
          setData(DUMMY_ADMIN_METRICS);
        } else {
          setData(apiData);
        }
      } catch (err) {
        console.error("Failed to load admin summary:", err);
        setData(DUMMY_ADMIN_METRICS);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const metrics = data?.metrics || {};
  const coursesDist = data?.courses_distribution || [];

  const pieData = [
    { name: "Learning", value: metrics.learning_students || 0, color: "#5B6CF8" },
    { name: "Placement Ready", value: metrics.placement_ready || 0, color: "#F59E0B" },
    { name: "Placed", value: metrics.placed_students || 0, color: "#10B981" },
    { name: "Not Placed", value: metrics.not_placed_students || 0, color: "#EF4444" },
  ].filter((item) => item.value > 0);

  const cardStyle = {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "1rem",
  };

  const textPrimary = { color: "var(--text-primary)" };
  const textSecondary = { color: "var(--text-secondary)" };
  const textMuted = { color: "var(--text-muted)" };

  return (
    <AppLayout title="Executive Overview" subtitle="Institution Command Center & Live Analytics">
      <div className="space-y-7">
        {/* Hero Command Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#131836] via-[#312E81] to-[#881337] animate-gradient-x p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="absolute left-1/3 -bottom-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-200 bg-rose-500/20 border border-rose-400/30 px-3 py-1 rounded-full tracking-wider uppercase">
                Institution Command Center
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3" style={{ fontFamily: "Sora, sans-serif" }}>
                Ascendra Career Ecosystem
              </h2>
              <p className="text-slate-300 text-sm mt-2 max-w-xl leading-relaxed">
                Real-time visibility across student enrollments, faculty cohorts, recruitment pipelines, and alumni transitions.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link to="/admin/users" className="inline-flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold px-4 py-2 rounded-xl shadow transition">
                  <UserPlus className="w-3.5 h-3.5 text-indigo-600" /><span>Manage Users</span>
                </Link>
                <Link to="/admin/alumni-activation" className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold px-4 py-2 rounded-xl transition">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-300" /><span>Alumni Activation</span>
                </Link>
                <Link to="/admin/announcements" className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold px-4 py-2 rounded-xl transition">
                  <Megaphone className="w-3.5 h-3.5 text-amber-300" /><span>Broadcast Notice</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-5 rounded-2xl border border-white/15 shrink-0">
              <div>
                <p className="text-[11px] text-slate-300 uppercase font-bold tracking-wider">Placement Rate</p>
                <p className="text-4xl font-extrabold text-emerald-400 mt-0.5 tabular-nums" style={{ fontFamily: "Sora, sans-serif" }}>
                  {data?.placement_rate || 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                <Award className="w-8 h-8 text-emerald-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Primary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Students" value={loading ? "—" : metrics.total_students || 0} subtitle={`${metrics.active_students || 0} currently active`} icon={Users} color="indigo" />
          <StatCard title="Faculty Trainers" value={loading ? "—" : metrics.total_trainers || 0} subtitle="Academic mentors" icon={BookOpen} color="purple" />
          <StatCard title="Placement-Ready" value={loading ? "—" : metrics.placement_ready || 0} subtitle="Screened candidates" icon={Briefcase} color="amber" />
          <StatCard title="Alumni Network" value={loading ? "—" : metrics.total_alumni || 0} subtitle="Graduated & active" icon={GraduationCap} color="emerald" />
        </div>

        {/* Secondary KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { to: "/admin/placements", icon: CheckCircle, label: "Students Placed", value: metrics.placed_students || 0, iconBg: "rgba(16,185,129,0.1)", iconColor: "#10B981", hoverBorder: "#10B981" },
            { to: "/admin/courses", icon: BookOpen, label: "Active Courses", value: metrics.active_courses || 0, iconBg: "rgba(6,182,212,0.1)", iconColor: "#06B6D4", hoverBorder: "#06B6D4" },
            { to: "/admin/batches", icon: Calendar, label: "Training Batches", value: metrics.total_batches || 0, iconBg: "rgba(139,92,246,0.1)", iconColor: "#8B5CF6", hoverBorder: "#8B5CF6" },
          ].map(({ to, icon: Icon, label, value, iconBg, iconColor }) => (
            <Link
              key={to}
              to={to}
              className="p-5 rounded-2xl flex items-center justify-between group transition-all duration-200"
              style={cardStyle}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px -4px ${iconColor}40`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: iconBg }}>
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={textMuted}>{label}</p>
                  <h4 className="text-2xl font-extrabold tabular-nums" style={{ ...textPrimary, fontFamily: "Sora, sans-serif" }}>{value}</h4>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 transition" style={{ color: "var(--border-strong)" }} />
            </Link>
          ))}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold" style={{ ...textPrimary, fontFamily: "Sora, sans-serif" }}>Course-wise Student Distribution</h3>
                <p className="text-xs mt-0.5" style={textSecondary}>Enrolled candidates across active curriculum streams</p>
              </div>
              <Link to="/admin/enrollments" className="text-xs font-bold hover:underline" style={{ color: "var(--accent)" }}>
                Manage Enrollments →
              </Link>
            </div>
            <div className="h-72 w-full">
              {coursesDist.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm" style={textMuted}>
                  No course enrollment data recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursesDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1E2235", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px", fontFamily: "DM Sans, sans-serif" }} />
                    <Bar dataKey="student_count" name="Enrolled Students" radius={[8, 8, 0, 0]}>
                      {coursesDist.map((_, idx) => (
                        <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl flex flex-col justify-between" style={cardStyle}>
            <div>
              <h3 className="text-base font-extrabold" style={{ ...textPrimary, fontFamily: "Sora, sans-serif" }}>Lifecycle Breakdown</h3>
              <p className="text-xs mt-0.5 mb-4" style={textSecondary}>Current student distribution by stage</p>
              <div className="h-52 w-full flex items-center justify-center">
                {pieData.length === 0 ? (
                  <p className="text-xs" style={textMuted}>No student status records.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={4}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1E2235", borderRadius: "10px", border: "none", color: "#fff", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2.5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold" style={textPrimary}>{item.name}</span>
                  </div>
                  <span className="font-bold tabular-nums" style={textPrimary}>{item.value} students</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
