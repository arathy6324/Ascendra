import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { commonApi } from "../../services/api";
import BrandLogo from "../ui/BrandLogo";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  Award,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Bell,
  LogOut,
  Menu,
  X,
  Sparkles,
  ClipboardList,
  Compass,
  FileCheck2,
  CalendarDays,
  Network,
  History,
  Building2,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCheck,
  Megaphone,
  Sun,
  Moon,
} from "lucide-react";

export const AppLayout = ({ children, title = "Dashboard", subtitle = "Ascendra Career Platform" }) => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const fetchCommonData = async () => {
    try {
      const [notifRes, annRes] = await Promise.all([
        commonApi.getNotifications(),
        commonApi.getAnnouncements(),
      ]);
      setNotifications(notifRes.data.results || notifRes.data || []);
      setAnnouncements(annRes.data.results || annRes.data || []);
    } catch (err) {
      console.error("Common fetch error:", err);
    }
  };

  useEffect(() => {
    if (user) fetchCommonData();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await commonApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleNotificationClick = async (n) => {
    try {
      if (!n.is_read) {
        await commonApi.markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
        );
      }
      if (n.link) {
        setShowNotifications(false);
        navigate(n.link);
      }
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const roleThemes = {
    ADMIN: {
      activeNav: "bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow-lg shadow-indigo-900/30",
      badge: "bg-rose-500/20 text-rose-300 border-rose-400/30",
      avatar: "from-indigo-500 to-rose-500",
      banner: "from-indigo-600 via-violet-600 to-rose-500",
      glow: "from-rose-500/10 via-indigo-500/8 to-transparent",
      label: "Administrator",
    },
    TRAINER: {
      activeNav: "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-900/30",
      badge: "bg-violet-500/20 text-violet-300 border-violet-400/30",
      avatar: "from-violet-500 to-fuchsia-500",
      banner: "from-violet-600 via-purple-600 to-indigo-500",
      glow: "from-violet-500/10 via-purple-500/8 to-transparent",
      label: "Faculty Trainer",
    },
    PLACEMENT: {
      activeNav: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-900/30",
      badge: "bg-amber-500/20 text-amber-300 border-amber-400/30",
      avatar: "from-amber-500 to-orange-500",
      banner: "from-amber-500 via-orange-500 to-rose-400",
      glow: "from-amber-500/10 via-orange-500/8 to-transparent",
      label: "Placement Officer",
    },
    ALUMNI: {
      activeNav: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-900/30",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
      avatar: "from-emerald-500 to-teal-500",
      banner: "from-emerald-600 via-teal-500 to-cyan-500",
      glow: "from-emerald-500/10 via-teal-500/8 to-transparent",
      label: "Distinguished Alumni",
    },
    STUDENT: {
      activeNav: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-900/30",
      badge: "bg-sky-500/20 text-sky-300 border-sky-400/30",
      avatar: "from-blue-500 to-cyan-500",
      banner: "from-blue-600 via-indigo-500 to-cyan-500",
      glow: "from-blue-500/10 via-cyan-500/8 to-transparent",
      label: "Student Learner",
    },
  };

  const theme = roleThemes[user?.role] || roleThemes.STUDENT;

  const getNavLinks = () => {
    switch (user?.role) {
      case "ADMIN":
        return [
          { name: "Executive Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
          { name: "User Directory", path: "/admin/users", icon: Users },
          { name: "Courses & Modules", path: "/admin/courses", icon: BookOpen },
          { name: "Batches & Schedules", path: "/admin/batches", icon: Calendar },
          { name: "Student Enrollments", path: "/admin/enrollments", icon: UserCheck },
          { name: "Alumni Activation", path: "/admin/alumni-activation", icon: GraduationCap },
          { name: "Placements Overview", path: "/admin/placements", icon: Briefcase },
          { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
        ];
      case "TRAINER":
        return [
          { name: "Trainer Dashboard", path: "/trainer/dashboard", icon: LayoutDashboard },
          { name: "Assigned Batches", path: "/trainer/batches", icon: Calendar },
          { name: "Curriculum & Modules", path: "/trainer/curriculum", icon: BookOpen },
          { name: "Assessments", path: "/trainer/assessments", icon: ClipboardList },
          { name: "Submissions & Grading", path: "/trainer/evaluations", icon: FileCheck2 },
          { name: "Student Progress", path: "/trainer/students", icon: Users },
        ];
      case "PLACEMENT":
        return [
          { name: "Placement Dashboard", path: "/placement/dashboard", icon: LayoutDashboard },
          { name: "Partner Companies", path: "/placement/companies", icon: Building2 },
          { name: "Job Vacancies", path: "/placement/vacancies", icon: Briefcase },
          { name: "Student Applications", path: "/placement/applications", icon: FileSpreadsheet },
          { name: "Interview Schedules", path: "/placement/interviews", icon: CalendarDays },
          { name: "Placement Records", path: "/placement/records", icon: Award },
        ];
      case "ALUMNI":
        return [
          { name: "Alumni Dashboard", path: "/alumni/dashboard", icon: LayoutDashboard },
          { name: "Professional Profile", path: "/alumni/profile", icon: UserCheck },
          { name: "Career Milestones", path: "/alumni/milestones", icon: Award },
          { name: "Mentorship Hub", path: "/alumni/mentorship", icon: Compass },
          { name: "Alumni Network", path: "/alumni/network", icon: Network },
          { name: "Events & Webinars", path: "/alumni/events", icon: CalendarDays },
          { name: "Academic History", path: "/alumni/history", icon: History },
        ];
      case "STUDENT":
      default:
        return [
          { name: "My Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
          { name: "Learning & Modules", path: "/student/academics", icon: BookOpen },
          { name: "Assessments & Tests", path: "/student/assessments", icon: ClipboardList },
          { name: "Skills & Certifications", path: "/student/skills", icon: Award },
          { name: "Project Portfolio", path: "/student/projects", icon: FolderGit2 },
          { name: "Job Opportunities", path: "/student/placements", icon: Briefcase },
          { name: "Career Readiness", path: "/student/profile", icon: Sparkles },
        ];
    }
  };

  const navLinks = getNavLinks();
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg-canvas)" }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (always dark) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:static ${
          sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "lg:w-72"}`}
        style={{ backgroundColor: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        {/* Logo Area */}
        <div
          className={`relative flex h-16 items-center justify-between px-4 bg-gradient-to-br ${theme.glow}`}
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <Link to="/" className="flex items-center overflow-hidden">
            <BrandLogo size="sm" dark showTagline={!collapsed} />
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden transition"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* User Card */}
        {!collapsed && (
          <div className="mx-3 mt-4 p-3.5 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.avatar} flex items-center justify-center font-extrabold text-white text-sm shadow-lg shrink-0`}>
                {user?.first_name ? user.first_name[0] : user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">
                  {user?.full_name || user?.username}
                </p>
                <span className={`mt-1.5 inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                  {theme.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {!collapsed && (
            <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Workspace
            </p>
          )}
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? `${theme.activeNav} font-semibold`
                    : "text-slate-400 hover:text-white"
                }`}
                style={!isActive ? { ":hover": { backgroundColor: "var(--sidebar-hover)" } } : {}}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)")}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = "")}
                title={collapsed ? link.name : ""}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                {!collapsed && <span className="truncate">{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header
          className="h-16 px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md"
          style={{
            backgroundColor: isDark ? "rgba(26,29,39,0.92)" : "rgba(255,255,255,0.92)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Left: Hamburger + Title */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl transition lg:hidden"
              style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-subtle)" }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1
                className="text-lg sm:text-xl font-bold tracking-tight leading-tight"
                style={{ fontFamily: "Sora, sans-serif", color: "var(--text-primary)" }}
              >
                {title}
              </h1>
              <p className="text-[11px] font-medium hidden sm:block" style={{ color: "var(--text-muted)" }}>
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right: Theme Toggle + Bell + User */}
          <div className="flex items-center gap-2.5">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              className="theme-toggle"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl transition"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
                >
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Notifications</h4>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{unreadCount} unread of {notifications.length}</span>
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--accent)" }}>
                        <CheckCheck className="w-3.5 h-3.5" /><span>Mark all read</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>
                        You're all caught up! 🎉
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className="w-full text-left p-3.5 text-xs flex items-start gap-2.5 transition"
                          style={{
                            borderBottom: "1px solid var(--border)",
                            backgroundColor: !n.is_read ? "var(--accent-subtle)" : "transparent",
                            color: "var(--text-primary)",
                          }}
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? "bg-indigo-500" : "bg-slate-400"}`} />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold">{n.title}</p>
                            <p className="mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{n.message}</p>
                            <span className="text-[10px] mt-1 block" style={{ color: "var(--text-muted)" }}>
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Pill */}
            <div className="flex items-center gap-2.5 pl-3" style={{ borderLeft: "1px solid var(--border)" }}>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.avatar} text-white font-bold flex items-center justify-center text-xs shadow-md`}>
                {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold block leading-tight" style={{ color: "var(--text-primary)" }}>
                  {user?.full_name || user?.username}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>{theme.label}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Announcement Banner */}
        {!bannerDismissed && announcements.length > 0 && announcements[0].is_active && (
          <div className={`bg-gradient-to-r ${theme.banner} text-white px-6 py-2.5 text-xs flex items-center justify-between gap-4`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] shrink-0">
                Announcement
              </span>
              <span className="font-bold shrink-0">{announcements[0].title}:</span>
              <span className="opacity-90 truncate">{announcements[0].content}</span>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 rounded-lg hover:bg-white/20 transition shrink-0"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col justify-between">
          <div className="animate-fade-in-up">{children}</div>
          <footer
            className="mt-12 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]"
            style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>Ascendra Career Lifecycle v2.0</span>
              <span>•</span>
              <span>admissions@ascendra.edu</span>
            </div>
            <div className="flex items-center gap-4">
              <span>© {new Date().getFullYear()} Ascendra Inc.</span>
              <span>•</span>
              <Link to="/" className="font-semibold hover:underline transition" style={{ color: "var(--accent)" }}>
                Public Overview
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
