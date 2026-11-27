import React from "react";

export const BrandLogo = ({ size = "md", dark = false, showTagline = true }) => {
  const sizes = {
    sm: { box: "w-8 h-8", title: "text-base", sub: "text-[9px]" },
    md: { box: "w-10 h-10", title: "text-lg", sub: "text-[10px]" },
    lg: { box: "w-12 h-12", title: "text-2xl", sub: "text-[11px]" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <div
        className={`${s.box} rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 p-[2px] shadow-md shadow-indigo-500/25 shrink-0`}
      >
        <div className="w-full h-full rounded-[10px] bg-slate-950/15 backdrop-blur-xs flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="w-5 h-5 text-white" fill="none">
            <path
              d="M16 4L27 25H21.2L16 14.5L10.8 25H5L16 4Z"
              fill="currentColor"
            />
            <path
              d="M16 18.5L20 26H12L16 18.5Z"
              fill="#FDE047"
            />
          </svg>
        </div>
      </div>
      <div className="text-left">
        <span
          className={`font-extrabold ${s.title} tracking-tight block leading-none ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          Ascendra
        </span>
        {showTagline && (
          <span
            className={`${s.sub} font-semibold tracking-wider uppercase mt-1 block ${
              dark ? "text-indigo-300/90" : "text-slate-500"
            }`}
          >
            Career Lifecycle
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
