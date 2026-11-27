import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { studentApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { CheckCircle2, Briefcase } from "lucide-react";

export const AlumniProfilePage = () => {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    current_company: "",
    current_job_title: "",
    years_of_experience: 0,
    target_role: "",
    career_goal: "",
    industry: "",
    location: "",
    skills_summary: "",
    linkedin_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentApi.getMyProfile();
        setProfile(res.data);
        const prof = res.data.professional_profile;
        if (prof) {
          setFormData({
            current_company: prof.current_company || "",
            current_job_title: prof.current_job_title || "",
            years_of_experience: prof.years_of_experience || 0,
            target_role: prof.target_role || "",
            career_goal: prof.career_goal || "",
            industry: prof.industry || "",
            location: prof.location || "",
            skills_summary: prof.skills_summary || "",
            linkedin_url: prof.linkedin_url || "",
          });
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const profId = profile?.professional_profile?.id;
      if (profId) {
        await studentApi.updateProfessional(profId, formData);
      } else {
        await studentApi.createProfessional(formData);
      }
      toast.success("Professional profile updated!");
      setSaved(true);
    } catch (err) {
      toast.error("Failed to save professional profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Professional Career Profile">
      <div className="max-w-3xl space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Professional Career Information</h2>
              <p className="text-xs text-slate-500">
                Your industry role and experience details visible to students and the institution.
              </p>
            </div>
          </div>

          {saved && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Professional profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Current Employer / Company
                </label>
                <input
                  type="text"
                  required
                  value={formData.current_company}
                  onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. CloudScale Systems"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Current Job Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.current_job_title}
                  onChange={(e) => setFormData({ ...formData, current_job_title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Lead Software Architect"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Cloud SaaS / Distributed Infrastructure"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Location (City / Country)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Bengaluru / San Francisco"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Technical Expertise Summary
              </label>
              <textarea
                rows={2}
                value={formData.skills_summary}
                onChange={(e) => setFormData({ ...formData, skills_summary: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="Key technical skills, languages, tools, architectures..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Long-term Career Goal / Mission
              </label>
              <textarea
                rows={2}
                value={formData.career_goal}
                onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="Future aspirations, target director/CTO roles, open source leadership..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                {saving ? "Saving..." : "Save Professional Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default AlumniProfilePage;
