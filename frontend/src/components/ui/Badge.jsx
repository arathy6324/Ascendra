import React from "react";

export const Badge = ({ children, variant = "neutral", size = "md", className = "" }) => {
  const variants = {
    neutral: { bg: "var(--bg-subtle)", text: "var(--text-secondary)", border: "var(--border)" },
    primary: { bg: "rgba(59,130,246,0.1)", text: "#3B82F6", border: "rgba(59,130,246,0.25)" },
    indigo: { bg: "var(--accent-subtle)", text: "var(--accent)", border: "var(--accent-muted)" },
    success: { bg: "var(--color-success-subtle)", text: "var(--color-success)", border: "rgba(16,185,129,0.25)" },
    teal: { bg: "rgba(13,148,136,0.1)", text: "#0D9488", border: "rgba(13,148,136,0.25)" },
    warning: { bg: "var(--color-warning-subtle)", text: "var(--color-warning)", border: "rgba(245,158,11,0.25)" },
    orange: { bg: "rgba(249,115,22,0.1)", text: "#F97316", border: "rgba(249,115,22,0.25)" },
    danger: { bg: "var(--color-danger-subtle)", text: "var(--color-danger)", border: "rgba(239,68,68,0.25)" },
    purple: { bg: "var(--color-purple-subtle)", text: "var(--color-purple)", border: "rgba(139,92,246,0.25)" },
    cyan: { bg: "var(--color-info-subtle)", text: "var(--color-info)", border: "rgba(6,182,212,0.25)" },
    pink: { bg: "rgba(236,72,153,0.1)", text: "#EC4899", border: "rgba(236,72,153,0.25)" },
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  const v = variants[variant] || variants.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizes[size]} ${className}`}
      style={{ backgroundColor: v.bg, color: v.text, borderColor: v.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      {children}
    </span>
  );
};

export default Badge;
