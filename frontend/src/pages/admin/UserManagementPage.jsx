import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { adminApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { DUMMY_ALL_USERS } from "../../data/dummyData";
import { UserPlus, Filter } from "lucide-react";

export const UserManagementPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "", email: "", first_name: "", last_name: "",
    password: "", role: "STUDENT", phone: "", college: "",
    qualification: "", graduation_year: 2026, course_name: "",
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminApi.getUsers(params);
      const apiUsers = res.data.results || res.data || [];
      setUsers(apiUsers.length > 0 ? apiUsers : DUMMY_ALL_USERS);
    } catch (err) {
      console.error("Load users failed:", err);
      setUsers(DUMMY_ALL_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [roleFilter, search]);

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      toast.success(`Account ${!user.is_active ? "activated" : "deactivated"} for ${user.full_name}.`);
      loadUsers();
    } catch (err) {
      toast.error("Failed to update user status.");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await adminApi.createUser(formData);
      setIsModalOpen(false);
      setFormData({ username: "", email: "", first_name: "", last_name: "", password: "", role: "STUDENT", phone: "", college: "", qualification: "", graduation_year: 2026, course_name: "" });
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.username?.[0] || err.response?.data?.detail || "Failed to create user.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleVariant = (role) => {
    const map = { ADMIN: "danger", TRAINER: "purple", PLACEMENT: "warning", ALUMNI: "success", STUDENT: "indigo" };
    return map[role] || "neutral";
  };

  // Client-side filter for dummy data
  const filteredUsers = users.filter((u) => {
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchSearch = !search || `${u.full_name} ${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const columns = [
    {
      header: "User Details",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
            style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--accent-muted)" }}
          >
            {row.first_name?.[0] || row.username[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold leading-tight text-sm" style={{ color: "var(--text-primary)" }}>{row.full_name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      render: (row) => <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{row.email || "—"}</span>,
    },
    {
      header: "Platform Role",
      render: (row) => <Badge variant={getRoleVariant(row.role)} size="sm">{row.role}</Badge>,
    },
    {
      header: "Account Status",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: row.is_active ? "var(--color-success)" : "var(--color-danger)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {row.is_active ? "Active" : "Deactivated"}
        </span>
      ),
    },
    {
      header: "Joined",
      render: (row) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(row.date_joined).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className="text-xs px-2.5 py-1 rounded-lg border font-medium transition"
          style={row.is_active
            ? { borderColor: "rgba(239,68,68,0.3)", color: "var(--color-danger)", backgroundColor: "var(--color-danger-subtle)" }
            : { borderColor: "rgba(16,185,129,0.3)", color: "var(--color-success)", backgroundColor: "var(--color-success-subtle)" }
          }
        >
          {row.is_active ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    backgroundColor: "var(--bg-subtle)",
    border: "1.5px solid var(--border)",
    borderRadius: "0.625rem",
    color: "var(--text-primary)",
    fontSize: "0.875rem",
    fontFamily: "DM Sans, sans-serif",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.65rem",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    marginBottom: "0.25rem",
  };

  return (
    <AppLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)", fontFamily: "Sora, sans-serif" }}>Institutional User Directory</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Manage student, trainer, and placement officer credentials — {users.length} total users</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 mr-2" style={{ color: "var(--text-muted)" }}>
            <Filter className="w-3.5 h-3.5" /><span>Role:</span>
          </span>
          {["", "ADMIN", "STUDENT", "TRAINER", "PLACEMENT", "ALUMNI"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition"
              style={roleFilter === r
                ? { backgroundColor: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                : { backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }
              }
            >
              {r === "" ? "All Roles" : r}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          searchTerm={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search users by name, username or email..."
        />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Platform Account">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-xs font-medium" style={{ backgroundColor: "var(--color-danger-subtle)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--color-danger)" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label style={labelStyle}>First Name</label><input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Last Name</label><input type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} style={inputStyle} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label style={labelStyle}>Username</label><input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Email Address</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label style={labelStyle}>Password</label><input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Account Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={inputStyle}>
                  <option value="STUDENT">Student</option>
                  <option value="TRAINER">Trainer</option>
                  <option value="PLACEMENT">Placement Officer</option>
                  <option value="ALUMNI">Alumni</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            {formData.role === "STUDENT" && (
              <div className="pt-3 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--accent)" }}>Student Profile Parameters</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label style={labelStyle}>Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>College / University</label><input type="text" value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })} style={inputStyle} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label style={labelStyle}>Graduation Year</label><input type="number" value={formData.graduation_year} onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Target Course</label><input type="text" value={formData.course_name} onChange={(e) => setFormData({ ...formData, course_name: e.target.value })} style={inputStyle} /></div>
                </div>
              </div>
            )}
            <div className="pt-4 flex items-center justify-end gap-3" style={{ borderTop: "1px solid var(--border)" }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-semibold transition" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-subtle)" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg text-xs font-bold text-white transition disabled:opacity-50" style={{ backgroundColor: "var(--accent)" }}>
                {submitting ? "Saving..." : "Create Account"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default UserManagementPage;
