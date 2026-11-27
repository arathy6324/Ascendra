import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import { studentApi, careersApi } from "../../services/api";
import {
  Briefcase,
  Award,
  Compass,
  History,
  Building2,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export const AlumniDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlumniData = async () => {
      try {
        const [profRes, mileRes, mentorRes, evtRes] = await Promise.all([
          studentApi.getMyProfile(),
          careersApi.getMilestones(),
          careersApi.getMentorships(),
          careersApi.getEvents(),
        ]);
        setProfile(profRes.data);
        setMilestones(mileRes.data.results || mileRes.data || []);
        setMentorships(mentorRes.data.results || mentorRes.data || []);
        setEvents(evtRes.data.results || evtRes.data || []);
      } catch (err) {
        console.error("Alumni dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAlumniData();
  }, []);

  const prof = profile?.professional_profile;

  return (
    <AppLayout title="Alumni Career & Mentorship Network" subtitle="Lifetime career milestones, mentorship, and preserved transcript">
      <div className="space-y-7">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#064E3B] via-[#0D9488] to-[#0284C7] animate-gradient-x p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-100 bg-white/15 border border-white/20 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ascendra Distinguished Alumni</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
              Welcome back, {profile?.user?.first_name || "Alumnus"}!
            </h2>
            <p className="mt-2 text-sm text-emerald-50/90 leading-relaxed">
              Share career breakthroughs, mentor rising learners, and stay connected with peers across global technology firms.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="bg-white/15 px-3 py-1 rounded-full font-semibold border border-white/15 text-emerald-100">
                Class of {profile?.graduation_year || "2025"}
              </span>
              <span className="bg-white/15 px-3 py-1 rounded-full font-semibold border border-white/15 text-white">
                {prof?.current_job_title || "Software Engineer"} @ {prof?.current_company || "Tech"}
              </span>
            </div>
          </div>

          <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/alumni/profile"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Update Career Profile</span>
            </Link>
            <Link
              to="/alumni/milestones"
              className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-5 py-3 rounded-xl border border-white/25 transition"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Share Milestone</span>
            </Link>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Current Company"
            value={loading ? "—" : prof?.current_company || "Update Profile"}
            subtitle={prof?.industry || "Software & Cloud"}
            icon={Building2}
            color="emerald"
          />
          <StatCard
            title="Industry Experience"
            value={loading ? "—" : `${prof?.years_of_experience ?? 0} Yrs`}
            subtitle="Professional tenure"
            icon={TrendingUp}
            color="cyan"
          />
          <StatCard
            title="Mentorship Sessions"
            value={loading ? "—" : mentorships.length}
            subtitle="Guiding students"
            icon={Compass}
            color="purple"
          />
          <StatCard
            title="Career Milestones"
            value={loading ? "—" : milestones.length}
            subtitle="Community achievements"
            icon={Award}
            color="amber"
          />
        </div>

        {/* Profile & History Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Current Professional Profile</h3>
                <p className="text-xs text-slate-500">Visible to students seeking career advice</p>
              </div>
              <Link to="/alumni/profile" className="text-xs font-bold text-emerald-700 hover:underline">
                Edit Profile →
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70">
                <span className="text-emerald-700 block uppercase text-[10px] font-bold">Designation & Firm</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {prof?.current_job_title || "Lead Software Architect"}
                </span>
                <span className="text-slate-600 font-medium">{prof?.current_company || "CloudScale Systems"}</span>
              </div>
              <div className="p-4 bg-cyan-50/60 rounded-xl border border-cyan-200/70">
                <span className="text-cyan-700 block uppercase text-[10px] font-bold">Location & Domain</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {prof?.location || "Bengaluru / Remote"}
                </span>
                <span className="text-slate-600 font-medium">{prof?.industry || "Distributed Cloud Systems"}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 sm:col-span-2">
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Core Expertise & Skills</span>
                <p className="text-slate-800 font-medium mt-1 leading-relaxed">
                  {prof?.skills_summary || "Add your technical expertise in your career profile."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Academic History</h3>
                    <p className="text-[11px] text-slate-500">Permanent record</p>
                  </div>
                </div>
                <Link to="/alumni/history" className="text-xs font-bold text-indigo-600 hover:underline">
                  Full Transcript →
                </Link>
              </div>

              <div className="space-y-2.5 mt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Completed Program</span>
                  <span className="font-bold text-slate-800">
                    {profile?.course_name || "Full Stack Cloud Architecture"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Alma Mater</span>
                  <span className="font-bold text-slate-800">{profile?.college || "Institute of Technology"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Graduation Year</span>
                  <span className="font-bold text-slate-800">{profile?.graduation_year || "2025"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Transcript & projects preserved</span>
            </div>
          </div>
        </div>

        {/* Mentorship & Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Mentorship Sessions</h3>
              <Link to="/alumni/mentorship" className="text-xs font-bold text-emerald-700 hover:underline">
                Manage All →
              </Link>
            </div>
            <div className="space-y-3">
              {mentorships.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No mentorship requests received yet.</p>
              ) : (
                mentorships.map((m) => (
                  <div key={m.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">With {m.student_name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{m.topic}</p>
                    </div>
                    <Badge variant={m.status === "ACTIVE" ? "success" : "primary"} size="sm">
                      {m.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Upcoming Alumni Summits</h3>
              <Link to="/alumni/events" className="text-xs font-bold text-emerald-700 hover:underline">
                View Events →
              </Link>
            </div>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No upcoming events scheduled.</p>
              ) : (
                events.map((evt) => (
                  <div key={evt.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{evt.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(evt.event_date).toLocaleDateString()} • {evt.location_or_link}
                      </p>
                    </div>
                    <Badge variant="purple" size="sm">
                      {evt.event_type}
                    </Badge>
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

export default AlumniDashboard;
