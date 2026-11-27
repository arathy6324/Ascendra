import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { skillsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Award, Plus, ExternalLink, Trash2, ShieldCheck } from "lucide-react";

export const StudentSkillsPage = () => {
  const toast = useToast();
  const [studentSkills, setStudentSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Forms
  const [skillForm, setSkillForm] = useState({
    skill: "",
    proficiency_level: "INTERMEDIATE",
  });

  const [certForm, setCertForm] = useState({
    title: "",
    issuing_organization: "",
    issue_date: "",
    credential_id: "",
    credential_url: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [skRes, certRes, allSkRes] = await Promise.all([
        skillsApi.getStudentSkills(),
        skillsApi.getCertifications(),
        skillsApi.getSkills(),
      ]);
      setStudentSkills(skRes.data.results || skRes.data || []);
      setCertifications(certRes.data.results || certRes.data || []);
      setAvailableSkills(allSkRes.data.results || allSkRes.data || []);
    } catch (err) {
      console.error("Load skills error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await skillsApi.addStudentSkill(skillForm);
      toast.success("Skill added to your matrix!");
      setIsSkillModalOpen(false);
      setSkillForm({ skill: "", proficiency_level: "INTERMEDIATE" });
      loadData();
    } catch (err) {
      toast.error("Failed to add skill. You may have already added this skill.");
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!confirm("Remove this skill from your profile?")) return;
    try {
      await skillsApi.deleteStudentSkill(id);
      toast.success("Skill removed.");
      loadData();
    } catch (err) {
      toast.error("Failed to delete skill.");
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    try {
      await skillsApi.addCertification(certForm);
      toast.success("Certification added!");
      setIsCertModalOpen(false);
      setCertForm({
        title: "",
        issuing_organization: "",
        issue_date: "",
        credential_id: "",
        credential_url: "",
      });
      loadData();
    } catch (err) {
      toast.error("Failed to add certification.");
    }
  };

  const getProficiencyVariant = (level) => {
    switch (level) {
      case "EXPERT":
        return "purple";
      case "ADVANCED":
        return "primary";
      case "INTERMEDIATE":
        return "success";
      case "BEGINNER":
      default:
        return "neutral";
    }
  };

  return (
    <AppLayout title="Skills & Certifications">
      <div className="space-y-8">
        {/* Skills Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Verified Technical Skills</h2>
              <p className="text-xs text-slate-500">
                Skills logged on your career profile with trainer verification.
              </p>
            </div>
            <button
              onClick={() => setIsSkillModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentSkills.length === 0 ? (
              <p className="col-span-full text-xs text-slate-400 py-6 text-center">
                No skills logged yet. Add your technical stack!
              </p>
            ) : (
              studentSkills.map((sk) => (
                <div
                  key={sk.id}
                  className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{sk.skill_name}</h4>
                    <p className="text-[11px] text-slate-500">{sk.category_name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={getProficiencyVariant(sk.proficiency_level)} size="sm">
                        {sk.proficiency_level}
                      </Badge>
                      {sk.verified_by_trainer && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(sk.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Certifications Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Professional Certifications</h2>
              <p className="text-xs text-slate-500">
                Industry credentials verified by external certification providers.
              </p>
            </div>
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.length === 0 ? (
              <p className="col-span-full text-xs text-slate-400 py-6 text-center">
                No certifications uploaded yet.
              </p>
            ) : (
              certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 bg-slate-50/70 rounded-xl border border-slate-200 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-200 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{cert.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{cert.issuing_organization}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Issued: {cert.issue_date} • ID: {cert.credential_id || "Verified"}
                      </p>
                    </div>
                  </div>
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal: Add Skill */}
        <Modal
          isOpen={isSkillModalOpen}
          onClose={() => setIsSkillModalOpen(false)}
          title="Add Technical Skill"
        >
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Skill
              </label>
              <select
                required
                value={skillForm.skill}
                onChange={(e) => setSkillForm({ ...skillForm, skill: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <option value="">-- Choose Skill --</option>
                {availableSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Proficiency Level
              </label>
              <select
                value={skillForm.proficiency_level}
                onChange={(e) => setSkillForm({ ...skillForm, proficiency_level: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <option value="BEGINNER">Beginner (Foundational)</option>
                <option value="INTERMEDIATE">Intermediate (Competent)</option>
                <option value="ADVANCED">Advanced (Production-Ready)</option>
                <option value="EXPERT">Expert (Architectural)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Add Skill
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add Certification */}
        <Modal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          title="Add Verified Certification"
        >
          <form onSubmit={handleAddCertification} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Certification Name
              </label>
              <input
                type="text"
                required
                value={certForm.title}
                onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="e.g. AWS Certified Solutions Architect"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Issuing Organization
              </label>
              <input
                type="text"
                required
                value={certForm.issuing_organization}
                onChange={(e) => setCertForm({ ...certForm, issuing_organization: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="e.g. Amazon Web Services, Google Cloud"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  required
                  value={certForm.issue_date}
                  onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Credential ID
                </label>
                <input
                  type="text"
                  value={certForm.credential_id}
                  onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Verification URL
              </label>
              <input
                type="url"
                value={certForm.credential_url}
                onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Save Certification
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default StudentSkillsPage;
