import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../../components/ui/BrandLogo";
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Loader2,
  Zap,
} from "lucide-react";

export const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(searchParams.get("mode") === "register" ? "register" : "login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regForm, setRegForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    college: "",
    graduation_year: 2026,
  });
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setMode("register");
    }
  }, [searchParams]);

  const from = location.state?.from?.pathname;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setError("");
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate(from || result.redirect, { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register({
      ...regForm,
      graduation_year: Number(regForm.graduation_year) || 2026,
    });
    setLoading(false);

    if (result.success) {
      navigate(result.redirect, { replace: true });
    } else {
      setError(result.error);
    }
  };

  // True 1-click Demo Sign In: fills credentials AND logs straight into that role's dashboard
  const handleQuickDemoLogin = async (u, p) => {
    setMode("login");
    setUsername(u);
    setPassword(p);
    setError("");
    setDemoLoading(u);
    const result = await login(u, p);
    setDemoLoading("");

    if (result.success) {
      navigate(result.redirect, { replace: true });
    } else {
      setError(result.error);
    }
  };

  const demoAccounts = [
    {
      role: "Admin",
      name: "Marcus Vance",
      u: "admin",
      p: "AdminPassword123!",
      style: "bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border-rose-200 text-rose-900",
      dot: "bg-gradient-to-r from-rose-500 to-pink-500",
    },
    {
      role: "Trainer",
      name: "Alex Rivers",
      u: "trainer_alex",
      p: "TrainerPassword123!",
      style: "bg-gradient-to-br from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 border-violet-200 text-violet-900",
      dot: "bg-gradient-to-r from-violet-500 to-indigo-500",
    },
    {
      role: "Placement",
      name: "Sarah Jenkins",
      u: "placement_sarah",
      p: "PlacementPassword123!",
      style: "bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200 text-amber-900",
      dot: "bg-gradient-to-r from-amber-500 to-orange-500",
    },
    {
      role: "Student",
      name: "Priya Patel",
      u: "student_priya",
      p: "StudentPassword123!",
      style: "bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200 text-blue-900",
      dot: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-mesh-hero grid grid-cols-1 lg:grid-cols-12">
      {/* Left Brand / Editorial Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0E1325] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(79,70,229,0.42),transparent_50%),radial-gradient(circle_at_85%_70%,rgba(13,148,136,0.34),transparent_50%),radial-gradient(circle_at_45%_92%,rgba(245,158,11,0.24),transparent_45%)]" />
        <div className="absolute -right-14 top-1/3 w-48 h-48 rounded-full bg-fuchsia-500/15 blur-3xl animate-float-slow" />

        <div className="relative z-10 animate-fade-in-up">
          <Link to="/">
            <BrandLogo size="lg" dark />
          </Link>

          <div className="mt-14 space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-teal-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Career Lifecycle Workspace</span>
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
              One workspace from your first module to your{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                alumni legacy.
              </span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Sign in with your institutional credentials, register as a new student, or click any quick-demo role card to launch straight into a populated workspace.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3 animate-fade-in-up animate-delay-200">
          {[
            { color: "bg-blue-400", text: "5 specialized portals: Admin, Trainer, Placement, Student & Alumni" },
            { color: "bg-amber-400", text: "Verified skill matrix, auto-graded assessments & live placement drives" },
            { color: "bg-emerald-400", text: "Single-account Student-to-Alumni promotion preserving full transcripts" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
              <span className="text-xs font-medium text-slate-200">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Auth Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center py-10 px-5 sm:px-10 lg:px-16">
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
          <div className="lg:hidden text-center mb-6">
            <Link to="/">
              <BrandLogo size="md" />
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xl shadow-indigo-950/10 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-teal-500 animate-gradient-x" />
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    mode === "register"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Create Student Account
                </button>
              </div>

              <div className="mb-5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {mode === "login" ? "Welcome back" : "Join Ascendra"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === "login"
                    ? "Enter credentials or click any demo role below for instant sign-in."
                    : "Register a student learner account to begin your career journey."}
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {mode === "login" ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !!demoLoading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 animate-gradient-x hover:brightness-105 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form className="space-y-3.5" onSubmit={handleRegister}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={regForm.first_name}
                        onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={regForm.last_name}
                        onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={regForm.username}
                        onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">College / Institute</label>
                      <input
                        type="text"
                        value={regForm.college}
                        onChange={(e) => setRegForm({ ...regForm, college: e.target.value })}
                        placeholder="e.g. NIT"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Grad Year</label>
                      <input
                        type="number"
                        value={regForm.graduation_year}
                        onChange={(e) => setRegForm({ ...regForm, graduation_year: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="Min 8 characters"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-105 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Create Student Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* One-Click Demo Role Access */}
              <div className="mt-7 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>One-Click Demo Role Access</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.u}
                      type="button"
                      disabled={!!demoLoading}
                      onClick={() => handleQuickDemoLogin(acc.u, acc.p)}
                      className={`p-2.5 text-left rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-sm flex items-center justify-between gap-2 disabled:opacity-60 ${acc.style}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full ${acc.dot} shrink-0`} />
                        <div className="min-w-0">
                          <span className="font-bold block leading-tight">{acc.role}</span>
                          <span className="text-[10px] opacity-80 truncate block">{acc.name}</span>
                        </div>
                      </div>
                      {demoLoading === acc.u && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!!demoLoading}
                  onClick={() => handleQuickDemoLogin("alumni_david", "AlumniPassword123!")}
                  className="mt-2.5 w-full p-2.5 text-left bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 hover:from-emerald-100 hover:to-cyan-100 rounded-xl border border-emerald-200 text-xs transition-all hover:-translate-y-0.5 hover:shadow-sm flex items-center justify-between gap-2.5 disabled:opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-950 block leading-tight">Alumni Portal</span>
                      <span className="text-[10px] text-emerald-800">David Chen — Lead Architect @ CloudScale</span>
                    </div>
                  </div>
                  {demoLoading === "alumni_david" && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700 shrink-0" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <Link to="/" className="hover:text-indigo-600 font-semibold transition">
              ← Return to Public Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
