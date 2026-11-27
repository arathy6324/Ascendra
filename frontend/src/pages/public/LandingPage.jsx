import React, { useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../../components/ui/BrandLogo";
import Footer from "../../components/layout/Footer";
import {
  ArrowRight,
  BookOpen,
  Award,
  Briefcase,
  Users,
  Sparkles,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Code2,
  Compass,
  Layers,
  TrendingUp,
  Zap,
  Globe,
} from "lucide-react";

export const LandingPage = () => {
  const [activeRole, setActiveRole] = useState("STUDENT");

  const roleShowcases = {
    STUDENT: {
      label: "Students",
      color: "from-blue-600 to-teal-500",
      pill: "bg-blue-50 text-blue-700 border-blue-200",
      headline: "Turn coursework into a verified engineering portfolio.",
      desc: "Track module completion, take auto-graded quizzes, get trainer-verified skills, deploy live projects, and apply directly to curated hiring drives.",
      highlights: ["Live Career Readiness Score", "Auto-graded & Code Assessments", "Verified Skill Matrix", "1-Click Placement Applications"],
      metric: { label: "Avg Readiness Lift", val: "+42%", accent: "text-teal-600" },
    },
    TRAINER: {
      label: "Trainers",
      color: "from-violet-600 to-indigo-600",
      pill: "bg-violet-50 text-violet-700 border-violet-200",
      headline: "Deliver structured cohorts with zero spreadsheet chaos.",
      desc: "Manage assigned batches, publish curriculum modules, record daily attendance, grade subjective code tasks, and endorse student technical skills.",
      highlights: ["Batch Attendance Tracking", "Question Bank & Auto-Grading", "Project Architecture Reviews", "Skill Verification Endorsements"],
      metric: { label: "Grading Time Saved", val: "65%", accent: "text-violet-600" },
    },
    PLACEMENT: {
      label: "Placement Cell",
      color: "from-amber-500 to-orange-600",
      pill: "bg-amber-50 text-amber-800 border-amber-200",
      headline: "Run campus recruitment with precision eligibility matching.",
      desc: "Maintain employer relationships, broadcast vacancies with graduation & skill filters, schedule multi-round interviews, and log official CTC offers.",
      highlights: ["Partner Employer Directory", "Eligibility Rule Engine", "Multi-Round Interview Tracker", "Offer & CTC Analytics"],
      metric: { label: "Placement Conversion", val: "91.4%", accent: "text-orange-600" },
    },
    ALUMNI: {
      label: "Alumni",
      color: "from-emerald-600 to-teal-600",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
      headline: "Graduate without losing your academic legacy.",
      desc: "Transition from student to alumnus on the very same account—preserving transcripts and projects while mentoring learners and sharing milestones.",
      highlights: ["Preserved Academic Transcript", "1:1 Student Mentorship Hub", "Career Milestone Feed", "Searchable Alumni Directory"],
      metric: { label: "Active Mentorships", val: "3.4x", accent: "text-emerald-600" },
    },
    ADMIN: {
      label: "Administrators",
      color: "from-indigo-600 to-rose-600",
      pill: "bg-rose-50 text-rose-700 border-rose-200",
      headline: "Full-spectrum institutional visibility in real time.",
      desc: "Provision role-based accounts, launch new courses and batches, authorize student-to-alumni promotions with audit logs, and broadcast notices.",
      highlights: ["Executive Pipeline Analytics", "Role & Account Governance", "Alumni Activation Audit Logs", "Targeted Role Announcements"],
      metric: { label: "Unified Lifecycle", val: "100%", accent: "text-rose-600" },
    },
  };

  const lifecycleStages = [
    { step: "01", title: "Enrollment & Academics", desc: "Structured course streams, verified cohorts, and syllabus roadmaps.", color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 text-blue-700 border-blue-200" },
    { step: "02", title: "Interactive Training", desc: "Modular learning materials, lab guides, and daily attendance tracking.", color: "from-indigo-500 to-violet-600", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { step: "03", title: "Rigorous Assessments", desc: "Objective auto-grading paired with hands-on instructor code reviews.", color: "from-violet-500 to-purple-600", bg: "bg-violet-50 text-violet-700 border-violet-200" },
    { step: "04", title: "Skill Verification", desc: "Faculty-endorsed technical competencies and external certifications.", color: "from-cyan-500 to-teal-600", bg: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    { step: "05", title: "Production Projects", desc: "Real-world engineering builds with GitHub links and live previews.", color: "from-teal-500 to-emerald-600", bg: "bg-teal-50 text-teal-700 border-teal-200" },
    { step: "06", title: "Placement Drives", desc: "Curated employer vacancies, smart eligibility rules, and interviews.", color: "from-amber-500 to-orange-600", bg: "bg-amber-50 text-amber-800 border-amber-200" },
    { step: "07", title: "Career Offers", desc: "Verified offer letters, compensation tracking, and joining workflows.", color: "from-orange-500 to-rose-600", bg: "bg-orange-50 text-orange-700 border-orange-200" },
    { step: "08", title: "Alumni Ecosystem", desc: "Lifelong mentorship, milestones, summits, and network directory.", color: "from-emerald-500 to-green-600", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Academic & Cohort Governance",
      desc: "Multi-batch scheduling, trainer assignment, modular learning resources, and live attendance records.",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      border: "hover:border-blue-300",
    },
    {
      icon: Zap,
      title: "Hybrid Assessment Engine",
      desc: "Instant MCQ/True-False scoring alongside subjective short-answer and coding evaluation rubrics.",
      iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
      border: "hover:border-violet-300",
    },
    {
      icon: Code2,
      title: "Verified Portfolio & Skill Matrix",
      desc: "Students log stack proficiencies, attach industry credentials, and receive faculty project ratings.",
      iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
      border: "hover:border-teal-300",
    },
    {
      icon: Briefcase,
      title: "End-to-End Placement Cell",
      desc: "Employer directory, vacancy broadcasting, interview round scheduling, and official CTC ledgers.",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      border: "hover:border-amber-300",
    },
    {
      icon: GraduationCap,
      title: "Single-Account Alumni Continuity",
      desc: "Promote graduating learners to Alumni without losing a single assessment score, project, or certificate.",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      border: "hover:border-emerald-300",
    },
    {
      icon: BarChart3,
      title: "Real-Time Institutional Analytics",
      desc: "Track student readiness funnels, course distribution, placement conversion, and hiring partner output.",
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
      border: "hover:border-rose-300",
    },
  ];

  const currentRole = roleShowcases[activeRole];

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#roles" className="hover:text-indigo-600 transition">Workspaces</a>
            <a href="#lifecycle" className="hover:text-indigo-600 transition">Career Journey</a>
            <a href="#features" className="hover:text-indigo-600 transition">Capabilities</a>
            <a href="#about" className="hover:text-indigo-600 transition">Vision</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl hover:bg-slate-100/80 transition"
            >
              Sign In
            </Link>
            <Link
              to="/login?mode=register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:brightness-105 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-mesh-hero border-b border-slate-200/80 pt-16 pb-20 lg:pt-24 lg:pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-200/90 shadow-xs text-indigo-700 text-xs font-bold tracking-wide mb-6">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 animate-pulse" />
              <span>Unified Student-to-Alumni Career Operating System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.08] animate-fade-in-up">
              Every skill, project, and offer —{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 via-blue-600 to-teal-500 animate-gradient-x bg-clip-text text-transparent">
                connected for life.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl animate-fade-in-up animate-delay-100">
              Ascendra brings together academic cohorts, verified engineering portfolios, campus placements, and lifelong alumni mentorship inside one vibrant, role-aware platform.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 animate-fade-in-up animate-delay-200">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 animate-gradient-x hover:brightness-105 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 animate-pulse-glow"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#roles"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl border border-slate-200 shadow-xs transition"
              >
                <span>Explore 5 Role Portals</span>
                <ChevronRight className="w-4 h-4 text-indigo-500" />
              </a>
            </div>

            {/* Trust / Metrics Strip */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <p className="text-2xl font-extrabold text-indigo-600">5 Portals</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Tailored Role Views</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-teal-600">8 Stages</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Tracked End-to-End</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-amber-600">1 Account</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Student to Alumni</p>
              </div>
            </div>
          </div>

          {/* Right Live Interactive Preview Card Stack */}
          <div className="lg:col-span-6 relative animate-fade-in-up animate-delay-200">
            <div className="relative rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl shadow-indigo-950/10 p-6 sm:p-7 animate-float-slow">
              {/* Top Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-slate-400">ascendra.edu / lifecycle</span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Ecosystem
                </span>
              </div>

              {/* Readiness & Cohort Card */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 p-5 text-white shadow-md">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-100">
                    Career Readiness
                  </p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-4xl font-extrabold tabular-nums">92%</span>
                    <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">
                      Placement Ready
                    </span>
                  </div>
                  <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-amber-300 rounded-full" />
                  </div>
                  <p className="mt-2.5 text-[11px] text-blue-100">
                    4 Verified Skills • 2 Production Builds
                  </p>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      Placement Drive
                    </span>
                    <h4 className="mt-2.5 font-extrabold text-slate-900 text-base">
                      CloudScale Systems
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Cloud Platform Engineer • 12.5 LPA
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Shortlisted
                    </span>
                    <span className="text-slate-500 font-medium">Round 2 Today</span>
                  </div>
                </div>
              </div>

              {/* Colorful Activity Pills */}
              <div className="mt-4 space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-violet-50/70 border border-violet-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Faculty Verified: React & Django REST</p>
                      <p className="text-[11px] text-slate-500">Endorsed by Alex Rivers • Full Stack Batch</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-violet-700 bg-white px-2.5 py-1 rounded-full border border-violet-200">
                    +15 pts
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Alumni Mentorship Active</p>
                      <p className="text-[11px] text-slate-500">David Chen • Lead Architect @ CloudScale</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                    Scheduled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Portals Section */}
      <section id="roles" className="py-20 px-6 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              5 Tailored Portals
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for every stakeholder in the room
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Switch perspectives below to see how each role works from the same unified institutional database.
            </p>
          </div>

          {/* Role Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            {Object.entries(roleShowcases).map(([key, item]) => {
              const active = activeRole === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveRole(key)}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                    active
                      ? `bg-gradient-to-r ${item.color} text-white border-transparent shadow-md`
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Active Role Spotlight */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-7 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${currentRole.pill}`}>
                {currentRole.label} Workspace
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {currentRole.headline}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {currentRole.desc}
              </p>
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentRole.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className={`rounded-3xl bg-gradient-to-br ${currentRole.color} p-7 text-white shadow-xl`}>
                <p className="text-xs font-bold uppercase tracking-wider opacity-85">
                  Impact Highlight
                </p>
                <p className="mt-2 text-5xl font-extrabold tracking-tight">{currentRole.metric.val}</p>
                <p className="mt-1 text-sm font-semibold opacity-95">{currentRole.metric.label}</p>
                <div className="mt-6 pt-5 border-t border-white/20 flex items-center justify-between">
                  <span className="text-xs opacity-90">Ready to try this role?</span>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-100 transition"
                  >
                    <span>Open Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Stage Career Journey */}
      <section id="lifecycle" className="py-24 px-6 bg-[#0F1528] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.22),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.18),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-teal-500/10 border border-teal-400/30 px-3.5 py-1 rounded-full">
              The Ascendra Pathway
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Eight Connected Career Milestones
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Academic records, project reviews, skill endorsements, and placement outcomes travel seamlessly with each learner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {lifecycleStages.map((stage, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/80 backdrop-blur-xs p-6 border border-slate-800 hover:border-slate-600 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r ${stage.color} text-white shadow-sm`}
                  >
                    Stage {stage.step}
                  </span>
                  <TrendingUp className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{stage.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section id="features" className="py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Built for Institutions
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything required to train, verify, and place talent
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md ${feat.border}`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${feat.iconBg} text-white flex items-center justify-center mb-5 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA / Vision Banner */}
      <section id="about" className="py-20 px-6 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="relative max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              Our Vision
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Empowering Learners. Elevating Institutions.
            </h2>
            <p className="mt-4 text-blue-50 leading-relaxed text-sm sm:text-base">
              Ascendra eliminates the gap between classroom learning, skill verification, campus placements, and alumni mentorship—giving every student a verifiable career passport.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition"
              >
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login?mode=register"
                className="inline-flex items-center gap-2 bg-slate-950/30 hover:bg-slate-950/45 text-white border border-white/30 font-bold text-sm px-6 py-3.5 rounded-xl transition"
              >
                <span>Create Student Account</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
