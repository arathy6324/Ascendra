import React from "react";

export const StatCard = ({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  color = "blue",
  subtitle,
}) => {
  const colorMap = {
    blue: {
      bar: "from-blue-500 to-indigo-500",
      icon: "from-blue-500 to-indigo-600",
      shadow: "rgba(59,130,246,0.25)",
    },
    indigo: {
      bar: "from-indigo-500 to-violet-500",
      icon: "from-indigo-500 to-violet-600",
      shadow: "rgba(99,102,241,0.25)",
    },
    emerald: {
      bar: "from-emerald-500 to-teal-500",
      icon: "from-emerald-500 to-teal-600",
      shadow: "rgba(16,185,129,0.25)",
    },
    teal: {
      bar: "from-teal-500 to-cyan-500",
      icon: "from-teal-500 to-cyan-600",
      shadow: "rgba(13,148,136,0.25)",
    },
    purple: {
      bar: "from-violet-500 to-purple-500",
      icon: "from-violet-500 to-purple-600",
      shadow: "rgba(139,92,246,0.25)",
    },
    amber: {
      bar: "from-amber-500 to-orange-500",
      icon: "from-amber-500 to-orange-500",
      shadow: "rgba(245,158,11,0.25)",
    },
    rose: {
      bar: "from-rose-500 to-pink-500",
      icon: "from-rose-500 to-pink-600",
      shadow: "rgba(244,63,94,0.25)",
    },
    cyan: {
      bar: "from-cyan-500 to-sky-500",
      icon: "from-cyan-500 to-sky-600",
      shadow: "rgba(6,182,212,0.25)",
    },
    slate: {
      bar: "from-slate-600 to-slate-800",
      icon: "from-slate-700 to-slate-900",
      shadow: "rgba(100,116,139,0.25)",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 group cursor-default"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px -4px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 20px -4px ${c.shadow}, 0 8px 32px -8px rgba(0,0,0,0.1)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px -4px rgba(0,0,0,0.05)";
      }}
    >
      {/* Top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.bar} animate-gradient-x`} />

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="min-w-0">
          <p
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}
          >
            {title}
          </p>
          <h3
            className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums truncate"
            style={{ color: "var(--text-primary)", fontFamily: "Sora, sans-serif" }}
          >
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1.5 text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${c.icon} text-white shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
            style={{ boxShadow: `0 6px 20px -4px ${c.shadow}` }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-4 pt-3 flex items-center text-xs" style={{ borderTop: "1px solid var(--border)" }}>
          <span
            className="font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor:
                trend === "up"
                  ? "var(--color-success-subtle)"
                  : trend === "down"
                  ? "var(--color-danger-subtle)"
                  : "var(--bg-subtle)",
              color:
                trend === "up"
                  ? "var(--color-success)"
                  : trend === "down"
                  ? "var(--color-danger)"
                  : "var(--text-secondary)",
            }}
          >
            {change}
          </span>
          <span className="ml-2" style={{ color: "var(--text-muted)" }}>vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
