import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/ui/StatCard";
import { placementsApi } from "../../services/api";
import {
  Briefcase,
  Building2,
  Users,
  CalendarDays,
  Award,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const BAR_COLORS = ["#f59e0b", "#ea580c", "#10b981", "#4f46e5", "#0d9488", "#e11d48"];

export const PlacementDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlacementData = async () => {
      try {
        const res = await placementsApi.getSummary();
        setData(res.data);
      } catch (err) {
        console.error("Load placement summary error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlacementData();
  }, []);

  const metrics = data?.metrics || {};
  const companyPlacements = data?.company_placements || [];

  const conversionRate =
    metrics.students_placed > 0
      ? Math.round((metrics.students_placed / (metrics.students_placed + metrics.students_awaiting_placement)) * 100)
      : 0;

  return (
    <AppLayout title="Placement & Recruitment Hub" subtitle="Corporate relations, vacancies, and hiring analytics">
      <div className="space-y-7">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#451A03] via-[#B45309] to-[#9F1239] animate-gradient-x p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-200 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full">
              Corporate Relations & Career Placement
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
              Placement Operations Cell
            </h2>
            <p className="text-amber-100/85 text-sm mt-2 max-w-xl leading-relaxed">
              Manage employer relationships, broadcast eligibility-checked job openings, coordinate interviews, and govern official CTC offers.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/placement/vacancies"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-105 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition"
            >
              <Briefcase className="w-4 h-4" />
              <span>Post New Vacancy</span>
            </Link>
            <Link
              to="/placement/interviews"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs px-5 py-3 rounded-xl transition"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Interviews</span>
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Eligible Candidates"
            value={loading ? "—" : metrics.total_eligible_students || 0}
            subtitle={`${metrics.placement_ready_students || 0} placement-ready`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Vacancies"
            value={loading ? "—" : metrics.active_job_opportunities || 0}
            subtitle="Verified partner openings"
            icon={Briefcase}
            color="amber"
          />
          <StatCard
            title="Total Applications"
            value={loading ? "—" : metrics.total_applications || 0}
            subtitle={`${metrics.shortlisted_candidates || 0} shortlisted`}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Students Placed"
            value={loading ? "—" : metrics.students_placed || 0}
            subtitle={`${metrics.students_awaiting_placement || 0} awaiting placement`}
            icon={Award}
            color="emerald"
          />
        </div>

        {/* Secondary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link to="/placement/interviews" className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-violet-300 transition flex items-center gap-4">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl border border-violet-200">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Interviews Scheduled</p>
              <h4 className="text-2xl font-extrabold text-slate-900 tabular-nums">{metrics.interviews_scheduled || 0}</h4>
            </div>
          </Link>

          <Link to="/placement/companies" className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-cyan-300 transition flex items-center gap-4">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Corporate Partners</p>
              <h4 className="text-2xl font-extrabold text-slate-900 tabular-nums">{companyPlacements.length || 0} Active</h4>
            </div>
          </Link>

          <Link to="/placement/records" className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Conversion Rate</p>
              <h4 className="text-2xl font-extrabold text-emerald-600 tabular-nums">{conversionRate}%</h4>
            </div>
          </Link>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Company-wise Placement Distribution</h3>
              <p className="text-xs text-slate-500">Hires across top corporate recruiting partners</p>
            </div>
            <Link to="/placement/records" className="text-xs font-bold text-orange-600 hover:underline">
              View All Records →
            </Link>
          </div>
          <div className="h-72 w-full">
            {companyPlacements.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No company placement statistics recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyPlacements} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0e1325",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="placements" name="Students Hired" radius={[8, 8, 0, 0]}>
                    {companyPlacements.map((_, idx) => (
                      <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlacementDashboard;
