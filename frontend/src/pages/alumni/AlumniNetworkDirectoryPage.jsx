import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { careersApi } from "../../services/api";
import { DUMMY_ALUMNI } from "../../data/dummyData";
import { Search, Building2, MapPin, ExternalLink, Users, Handshake } from "lucide-react";

export const AlumniNetworkDirectoryPage = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const res = await careersApi.getAlumniDirectory({ search });
      const apiAlumni = res.data || [];
      setAlumni(apiAlumni.length > 0 ? apiAlumni : DUMMY_ALUMNI);
    } catch (err) {
      console.error("Load alumni directory error:", err);
      setAlumni(DUMMY_ALUMNI);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDirectory(); }, [search]);

  const filtered = alumni.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.full_name?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q) ||
      a.company?.toLowerCase().includes(q) ||
      a.designation?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q)
    );
  });

  const mentorCount = alumni.filter(a => a.mentorship_available).length;

  const cardStyle = { backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "1rem" };
  const textPrimary = { color: "var(--text-primary)" };
  const textSecondary = { color: "var(--text-secondary)" };
  const textMuted = { color: "var(--text-muted)" };

  return (
    <AppLayout title="Alumni Network Directory">
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={cardStyle}>
          <div>
            <h2 className="text-lg font-bold" style={{ ...textPrimary, fontFamily: "Sora, sans-serif" }}>Distinguished Alumni Community</h2>
            <p className="text-xs mt-0.5" style={textMuted}>
              {alumni.length} alumni · {mentorCount} mentors available · Connect with top professionals
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={textMuted} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, or role..."
              className="form-input pl-9"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Alumni", value: alumni.length, color: "#5B6CF8" },
            { label: "Mentors Available", value: mentorCount, color: "#10B981" },
            { label: "Companies", value: new Set(alumni.map(a => a.company)).size, color: "#F59E0B" },
            { label: "Batch Years", value: new Set(alumni.map(a => a.batch_year)).size, color: "#8B5CF6" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl text-center" style={{ ...cardStyle, borderLeft: `3px solid ${s.color}` }}>
              <p className="text-2xl font-extrabold tabular-nums" style={{ color: s.color, fontFamily: "Sora, sans-serif" }}>{s.value}</p>
              <p className="text-xs mt-1 font-medium" style={textMuted}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl" style={cardStyle}>
                <div className="skeleton h-10 w-10 rounded-full mb-3" />
                <div className="skeleton h-4 w-3/4 mb-2" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm" style={textMuted}>
              No alumni found matching your criteria.
            </div>
          ) : (
            filtered.map((alum) => {
              const name = alum.full_name || alum.name || "Alumni";
              const company = alum.company || alum.current_company || "—";
              const role = alum.designation || alum.current_job_title || "Professional";
              const location = alum.location || "India";
              const batchYear = alum.batch_year || alum.graduation_year || "—";
              const linkedin = alum.linkedin || alum.linkedin_url;
              const isMentor = alum.mentorship_available;

              return (
                <div key={alum.id} className="p-5 rounded-2xl flex flex-col justify-between transition-all duration-200" style={cardStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px -4px rgba(16,185,129,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0"
                        style={{ backgroundColor: "var(--color-success-subtle)", color: "var(--color-success)", border: "1.5px solid rgba(16,185,129,0.2)" }}>
                        {name[0]}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm truncate" style={textPrimary}>{name}</h3>
                        <p className="text-xs truncate" style={textMuted}>{alum.email}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl space-y-1.5 text-xs" style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-1.5 font-bold" style={textPrimary}>
                        <Building2 className="w-3.5 h-3.5 shrink-0" style={textMuted} />
                        <span className="truncate">{role}</span>
                      </div>
                      <p className="pl-5" style={textSecondary}>{company}</p>
                      <p className="pl-5 flex items-center gap-1" style={textMuted}>
                        <MapPin className="w-3 h-3 shrink-0" /><span>{location}</span>
                      </p>
                    </div>

                    {isMentor && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
                        style={{ backgroundColor: "var(--color-info-subtle)", color: "var(--color-info)", border: "1px solid rgba(6,182,212,0.2)" }}>
                        <Handshake className="w-3 h-3" />
                        <span>Open for Mentorship</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-between text-[11px]" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    <span>Class of {batchYear}</span>
                    {linkedin ? (
                      <a href={`https://${linkedin}`} target="_blank" rel="noreferrer"
                        className="font-bold flex items-center gap-1 hover:underline"
                        style={{ color: "var(--accent)" }}>
                        <span>LinkedIn</span><ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span style={{ color: "var(--color-success)" }}>✓ Verified</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AlumniNetworkDirectoryPage;
