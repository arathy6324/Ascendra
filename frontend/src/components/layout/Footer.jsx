import React, { useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../ui/BrandLogo";
import { useToast } from "../../context/ToastContext";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Globe,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Code2,
  GraduationCap,
} from "lucide-react";

export const Footer = () => {
  const toast = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Subscribed to Ascendra Career Digest & Placement Alerts!");
    setEmail("");
  };

  return (
    <footer className="bg-[#0B0F1E] text-slate-300 border-t border-slate-800/80 relative overflow-hidden">
      {/* Top gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 via-amber-500 to-teal-400 animate-gradient-x" />

      {/* Ambient glow */}
      <div className="absolute -left-24 bottom-0 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-24 top-12 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 relative">
        {/* Top Newsletter & Status Strip */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 mb-14 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • Career Lifecycle v2.0</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Stay updated on campus placement drives & alumni summits
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Receive monthly engineering curriculum updates, partner hiring calendars, and mentorship invitations.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto lg:min-w-[380px]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.edu"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 transition"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition shrink-0"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Main 5-Column Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/90">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/">
              <BrandLogo size="md" dark />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Ascendra is an intelligent Career Lifecycle Management Platform unifying academic training, verified technical skills, placement operations, and lifelong alumni mentorship in one relational ecosystem.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300">
                <ShieldCheck className="w-3.5 h-3.5" /> SOC2 & FERPA Ready
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300">
                <Sparkles className="w-3.5 h-3.5" /> 99.9% Uptime SLA
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#roles" className="hover:text-teal-300 transition">Role Workspaces</a></li>
              <li><a href="#lifecycle" className="hover:text-teal-300 transition">8-Stage Career Journey</a></li>
              <li><a href="#features" className="hover:text-teal-300 transition">Hybrid Assessments</a></li>
              <li><a href="#features" className="hover:text-teal-300 transition">Skill Verification Matrix</a></li>
              <li><a href="#about" className="hover:text-teal-300 transition">Institutional Vision</a></li>
            </ul>
          </div>

          {/* Role Portals */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Role Portals</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/login" className="hover:text-blue-300 transition">Student Learning Hub</Link></li>
              <li><Link to="/login" className="hover:text-violet-300 transition">Faculty Trainer Console</Link></li>
              <li><Link to="/login" className="hover:text-amber-300 transition">Placement Operations Cell</Link></li>
              <li><Link to="/login" className="hover:text-emerald-300 transition">Alumni & Mentorship</Link></li>
              <li><Link to="/login" className="hover:text-rose-300 transition">Executive Admin</Link></li>
            </ul>
          </div>

          {/* Institutional Contact */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Campus & Support</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Ascendra Innovation Campus, Outer Ring Road, Bellandur, Bengaluru 560103 & San Francisco, CA</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>admissions@ascendra.edu • placements@ascendra.edu</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 80 4890 2200 (Institutional Helpdesk)</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mon – Sat • 08:30 AM – 07:30 PM IST</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span>© {new Date().getFullYear()} Ascendra Inc. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" /> React 19 + Django REST + PostgreSQL
            </span>
          </div>
          <div className="flex items-center gap-5 font-medium">
            <a href="#about" className="hover:text-white transition">Privacy Policy</a>
            <a href="#about" className="hover:text-white transition">Terms of Service</a>
            <a href="#roles" className="hover:text-white transition">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
