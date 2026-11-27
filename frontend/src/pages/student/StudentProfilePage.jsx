import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import { studentApi, careersApi, authApi, skillsApi, projectsApi, assessmentsApi } from "../../services/api";
import {
  Sparkles,
  CheckCircle2,
  Compass,
  Code2,
  ExternalLink,
  KeyRound,
  Save,
  Building2,
} from "lucide-react";

export const StudentProfilePage = () => {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [stats, setStats] = useState({ skills: 0, projects: 0, passed: false });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    college: "",
    qualification: "",
    graduation_year: 2026,
    career_goal: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
  });

  const [mentorModal, setMentorModal] = useState(null);
  const [mentorForm, setMentorForm] = useState({ topic: "", notes: "" });

  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "" });
  const [changingPw, setChangingPw] = useState(false);

  const loadAll = async () => {
    try {
      const [profRes, alumRes, mentRes, skRes, projRes, assRes] = await Promise.all([
        studentApi.getMyProfile(),
        careersApi.getAlumniDirectory(),
        careersApi.getMentorships(),
        skillsApi.getStudentSkills(),
        projectsApi.getProjects(),
        assessmentsApi.getAssessments(),
      ]);
      const p = profRes.data;
      setProfile(p);
      setForm({
        phone: p.phone || "",
        college: p.college || "",
        qualification: p.qualification || "",
        graduation_year: p.graduation_year || 2026,
        career_goal: p.career_goal || "",
        github_url: p.github_url || "",
        linkedin_url: p.linkedin_url || "",
        portfolio_url: p.portfolio_url || "",
      });
      setAlumni(alumRes.data || []);
      setMentorships(mentRes.data.results || mentRes.data || []);

      const sk = skRes.data.results || skRes.data || [];
      const pr = projRes.data.results || projRes.data || [];
      const as = assRes.data.results || assRes.data || [];
      setStats({
        skills: sk.length,
        projects: pr.length,
        passed: as.some((a) => a.my_submission?.passed),
      });
    } catch (err) {
      console.error("Failed to load student profile:", err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const readinessScore = Math.min(
    20 +
      Math.min(stats.skills * 10, 25) +
      Math.min(stats.projects * 15, 30) +
      (stats.passed ? 15 : 0) +
      (form.github_url && form.linkedin_url ? 10 : 0),
    100
  );

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentApi.updateMyProfile(form);
      toast.success("Your career profile has been updated.");
      loadAll();
    } catch (err) {
      toast.error("Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestMentorship = async (e) => {
    e.preventDefault();
    if (!mentorModal) return;
    try {
      await careersApi.requestMentorship({
        alumnus: mentorModal.user_id,
        topic: mentorForm.topic,
        notes: mentorForm.notes,
      });
      toast.success(`Mentorship request sent to ${mentorModal.name}!`);
      setMentorModal(null);
      setMentorForm({ topic: "", notes: "" });
      loadAll();
    } catch (err) {
      toast.error("Could not submit mentorship request.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await authApi.changePassword(pwForm);
      toast.success("Password updated successfully.");
      setPwForm({ old_password: "", new_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || "Failed to update password.");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <AppLayout title="Career Readiness & Profile" subtitle="Optimize your placement profile and connect with alumni mentors">
      <div className="space-y-7">
        {/* Readiness Breakdown */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-600 to-teal-500 p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Placement Readiness Index</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
              {profile?.user?.full_name || "Student Profile"}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="bg-white/15 px-3 py-1 rounded-full">Skills: {stats.skills}</span>
              <span className="bg-white/15 px-3 py-1 rounded-full">Projects: {stats.projects}</span>
              <span className="bg-white/15 px-3 py-1 rounded-full">
                Assessment Passed: {stats.passed ? "Yes" : "Pending"}
              </span>
              <span className="bg-white/15 px-3 py-1 rounded-full">
                Links Complete: {form.github_url && form.linkedin_url ? "Yes" : "No"}
              </span>
            </div>
          </div>
          <div className="bg-slate-950/30 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center w-full md:w-56 shrink-0">
            <p className="text-[11px] uppercase font-bold text-cyan-200">Readiness Score</p>
            <p className="text-4xl font-extrabold mt-1 tabular-nums">{readinessScore}%</p>
            <div className="w-full h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-amber-300 rounded-full" style={{ width: `${readinessScore}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Profile Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 pb-4 border-b border-slate-100">
              Academic & Portfolio Links
            </h3>
            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">College / University</label>
                  <input
                    type="text"
                    value={form.college}
                    onChange={(e) => setForm({ ...form, college: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={form.graduation_year}
                    onChange={(e) => setForm({ ...form, graduation_year: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Target Career Goal</label>
                <input
                  type="text"
                  value={form.career_goal}
                  onChange={(e) => setForm({ ...form, career_goal: e.target.value })}
                  placeholder="e.g. Full Stack Cloud Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Portfolio URL</label>
                  <input
                    type="url"
                    value={form.portfolio_url}
                    onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:brightness-105 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security / Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs h-fit">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Account Security</h3>
                <p className="text-[11px] text-slate-500">Update your sign-in password</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={pwForm.old_password}
                  onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={changingPw}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                {changingPw ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Request Mentorship from Alumni */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Alumni Career Mentors</h3>
              <p className="text-xs text-slate-500">Request 1:1 guidance from Ascendra graduates working in top tech firms</p>
            </div>
            <Badge variant="success" size="sm">
              {mentorships.length} Active / Requested
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alumni.map((alum) => (
              <div key={alum.user_id} className="p-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm">
                      {alum.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{alum.name}</h4>
                      <p className="text-[11px] text-emerald-700 font-semibold">Class of {alum.graduation_year || "2025"}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{alum.current_job_title || "Engineer"} @ {alum.current_company || "Tech"}</span>
                  </p>
                </div>
                <button
                  onClick={() => setMentorModal(alum)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Request Mentorship</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mentorship Modal */}
        <Modal
          isOpen={!!mentorModal}
          onClose={() => setMentorModal(null)}
          title={`Request Mentorship with ${mentorModal?.name}`}
        >
          <form onSubmit={handleRequestMentorship} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Mentorship Topic</label>
              <input
                type="text"
                required
                value={mentorForm.topic}
                onChange={(e) => setMentorForm({ ...mentorForm, topic: e.target.value })}
                placeholder="e.g. Mock System Design Interview & Resume Review"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Message / Questions</label>
              <textarea
                rows={3}
                value={mentorForm.notes}
                onChange={(e) => setMentorForm({ ...mentorForm, notes: e.target.value })}
                placeholder="Briefly describe what you'd like guidance on..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMentorModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Send Request
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default StudentProfilePage;
