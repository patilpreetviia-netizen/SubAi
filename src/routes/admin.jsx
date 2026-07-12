import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAuthStore } from "../lib/authStore";
import {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  banAdminUser,
  deleteAdminJob,
} from "../lib/adminServer";
import {
  getStorageFiles,
  deleteStorageFile,
  exportAdminData,
  getAuditLog,
  getRevenueStats,
} from "../lib/adminServer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const ADMIN_EMAIL = "patilpreetviia@gmail.com";

const COLORS = [
  "#D97736",
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
});

/* ─── tiny helpers ─────────────────────────────────── */
function fmt(n) {
  return Number(n || 0).toLocaleString();
}
function fmtDate(s) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtAgo(s) {
  if (!s) return "—";
  const ms = Date.now() - new Date(s).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function initials(name, email) {
  if (name)
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  return (email?.[0] || "U").toUpperCase();
}

/* ─── stat card ─────────────────────────────────────── */
function StatCard({ label, value, icon, color = "#D97736", sub }) {
  return (
    <div
      style={{
        background: "rgba(10,10,10,0.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
        overflow: "hidden",
        boxShadow: "rgba(0,0,0,0.25) 0px 25px 50px -12px",
        transition: "all 150ms ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 38,
          height: 38,
          borderRadius: 6,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
        {fmt(value)}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#6b7280" }}>{sub}</div>}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `${color}30`,
          borderRadius: "0 0 16px 16px",
        }}
      />
    </div>
  );
}

/* ─── section heading ─────────────────────────────── */
function SectionHead({ title, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ─── confirm dialog ───────────────────────────────── */
function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 28,
          maxWidth: 400,
          width: "100%",
          boxShadow: "rgba(0,0,0,0.4) 0px 25px 50px -12px",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", color: "#fff" }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 24px", lineHeight: 1.5 }}>
          {body}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#9CA3AF",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "inherit",
              transition: "all 150ms ease",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 18px",
              borderRadius: 9999,
              border: "none",
              background: danger ? "#ef4444" : "#22c55e",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              transition: "all 150ms ease",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── toast ───────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  const Toasts = () => (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === "error" ? "#451a1a" : "#14241a",
            border: `1px solid ${t.type === "error" ? "#ef444440" : "#22c55e40"}`,
            color: t.type === "error" ? "#f87171" : "#4ade80",
            padding: "10px 16px",
            borderRadius: 16,
            fontSize: 13,
            fontWeight: 500,
            animation: "slideInRight 0.25s ease-out",
            maxWidth: 320,
          }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { push, Toasts };
}

/* ─── sidebar nav item ────────────────────────────── */
function NavBtn({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "9px 14px",
        borderRadius: 16,
        border: "none",
        cursor: "pointer",
        background: active ? "rgba(217,119,6,0.1)" : "transparent",
        color: active ? "#D97736" : "#9CA3AF",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        fontFamily: "inherit",
        textAlign: "left",
        transition: "all 150ms ease",
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span
          style={{
            background: "#ef4444",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 9999,
            lineHeight: 1.5,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════ */
function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const { push, Toasts } = useToast();

  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [confirm, setConfirm] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [storageFiles, setStorageFiles] = useState(null);
  const [storageLoading, setStorageLoading] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [featureFlags, setFeatureFlags] = useState({
    maintenanceMode: false,
    newSignupEnabled: true,
    emailNotifications: true,
    aiDescriptions: true,
    freeTierEnabled: true,
    proTierEnabled: true,
  });
  const [emailFilter, setEmailFilter] = useState("all");
  const [bulkAction, setBulkAction] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  /* auth guard */
  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  const token = useAuthStore.getState().session?.access_token;

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    setError(null);
    try {
      const [statsData, usersData] = await Promise.all([
        getAdminStats({ data: { accessToken: token } }),
        getAdminUsers({ data: { accessToken: token } }),
      ]);
      setStats(statsData);
      setUsers(usersData);
      getRevenueStats({ data: { accessToken: token } })
        .then(setRevenue)
        .catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) loadAll();
  }, [user, loadAll]);

  /* user actions */
  const handleDeleteUser = (u) => {
    setConfirm({
      title: `Delete "${u.email}"?`,
      body: `This will permanently delete the user and all their ${u.jobCount} jobs. This cannot be undone.`,
      confirmLabel: "Delete forever",
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteAdminUser({ data: { accessToken: token, userId: u.id } });
          setUsers((prev) => prev.filter((x) => x.id !== u.id));
          push(`Deleted ${u.email}`);
        } catch (e) {
          push(e.message, "error");
        }
      },
    });
  };

  const handleBanUser = async (u) => {
    try {
      await banAdminUser({ data: { accessToken: token, userId: u.id, banned: !u.banned } });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, banned: !u.banned } : x)));
      push(`${u.banned ? "Unbanned" : "Banned"} ${u.email}`);
    } catch (e) {
      push(e.message, "error");
    }
  };

  const handleDeleteJob = (j) => {
    setConfirm({
      title: `Delete job "${j.title || j.id.slice(0, 8)}"?`,
      body: "This removes the job and all its subtitles permanently.",
      confirmLabel: "Delete job",
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteAdminJob({ data: { accessToken: token, jobId: j.id } });
          setStats((prev) => ({
            ...prev,
            jobs: prev.jobs.filter((x) => x.id !== j.id),
            totalJobs: prev.totalJobs - 1,
          }));
          push(`Job deleted`);
        } catch (e) {
          push(e.message, "error");
        }
      },
    });
  };

  const handleSendAnnouncement = () => {
    if (!announcement.trim()) return;
    setAnnouncements((prev) => [
      {
        id: Date.now(),
        msg: announcement,
        time: new Date().toISOString(),
      },
      ...prev,
    ]);
    setAnnouncement("");
    push("Announcement posted (UI demo — wire to DB to persist)");
  };

  /* filtered data */
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()),
    );
  }, [users, userSearch]);

  const filteredJobs = useMemo(() => {
    if (!stats?.jobs) return [];
    return stats.jobs.filter((j) => {
      const matchSearch =
        !jobSearch ||
        j.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.userEmail?.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.language?.toLowerCase().includes(jobSearch.toLowerCase());
      const matchStatus = jobStatusFilter === "all" || j.status === jobStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [stats, jobSearch, jobStatusFilter]);

  /* derived insights */
  const churned = useMemo(() => {
    if (!users) return [];
    const day30 = Date.now() - 30 * 86400000;
    return users.filter((u) => {
      if (!u.lastSignIn) return true;
      return new Date(u.lastSignIn).getTime() < day30 && u.jobCount > 0;
    });
  }, [users]);

  const newSignups = useMemo(() => {
    if (!users) return [];
    const day7 = Date.now() - 7 * 86400000;
    return users.filter((u) => new Date(u.createdAt).getTime() > day7);
  }, [users]);

  if (loading || !user) return null;
  if (user.email !== ADMIN_EMAIL) return null;

  const langPie = stats
    ? Object.entries(stats.jobsByLanguage || {}).map(([name, value]) => ({ name, value }))
    : [];

  const statusPie = stats
    ? Object.entries(stats.jobsByStatus || {}).map(([name, value]) => ({ name, value }))
    : [];

  const durationPie = stats
    ? Object.entries(stats.durationBuckets || {}).map(([name, value]) => ({ name, value }))
    : [];

  /* ── sidebar items ── */
  const sideItems = [
    { id: "overview", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, label: "Overview" },
    { id: "users", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: "Users", badge: users?.filter((u) => u.banned).length },
    { id: "jobs", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>, label: "Jobs" },
    { id: "analytics", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, label: "Analytics" },
    { id: "insights", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: "AI Insights" },
    { id: "revenue", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, label: "Revenue" },
    { id: "storage", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>, label: "Storage" },
    { id: "moderation", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: "Moderation" },
    { id: "broadcast", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: "Broadcast" },
    { id: "emails", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: "Email Logs" },
    { id: "flags", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>, label: "Feature Flags" },
    { id: "audit", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>, label: "Audit Log" },
    { id: "bulk", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, label: "Bulk Ops" },
    { id: "system", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, label: "System" },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#0A0A0A",
        color: "#fff",
        fontFamily: "var(--font-sans)",
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
        input, textarea, button, select { font-family:inherit; }
        a { color:inherit; text-decoration:none; }
        .admin-card {
          background: rgba(10,10,10,0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          box-shadow: rgba(0,0,0,0.25) 0px 25px 50px -12px;
          padding: 20px;
          transition: all 150ms ease;
        }
        .admin-card:hover {
          border-color: rgba(255,255,255,0.12);
        }
        .admin-input {
          background: #111114;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 10px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color 150ms ease;
        }
        .admin-input:focus {
          border-color: #D97736;
        }
        .admin-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 150ms ease;
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: 220,
          minWidth: 220,
          background: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          padding: "16px 10px",
          gap: 2,
        }}
      >
        {/* brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 10px 20px",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              overflow: "hidden",
              background: "#1a1a20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/subai-logo.png"
              alt="SubAI"
              style={{ height: 52, width: "auto", objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>SubAI Admin</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>Control Panel</div>
          </div>
        </div>

        {/* nav */}
        {sideItems.map((item) => (
          <NavBtn
            key={item.id}
            active={tab === item.id}
            onClick={() => setTab(item.id)}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
          />
        ))}

        <div style={{ flex: 1 }} />
        <div
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, marginTop: 4 }}
        >
          <NavBtn
            active={false}
            onClick={() => navigate({ to: "/dashboard" })}
            icon="←"
            label="Back to App"
          />
        </div>

        {/* admin badge */}
        <div
          style={{
            margin: "10px 4px 0",
            padding: "10px 12px",
            background: "rgba(217,119,6,0.06)",
            borderRadius: 16,
            border: "1px solid rgba(217,119,6,0.12)",
            transition: "all 150ms ease",
          }}
        >
          <div style={{ fontSize: 10, color: "#D97736", fontWeight: 700, marginBottom: 3 }}>
            ADMIN
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", wordBreak: "break-all" }}>{user.email}</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* header */}
        <div
          style={{
            height: 60,
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "#0A0A0A",
            flexShrink: 0,
          }}
        >
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#fff" }}>
              {sideItems.find((s) => s.id === tab)?.icon}{" "}
              {sideItems.find((s) => s.id === tab)?.label}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {loadingData && <span style={{ fontSize: 11, color: "#6b7280" }}>Loading…</span>}
            <button
              onClick={loadAll}
              style={{
                padding: "7px 14px",
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                color: "#9CA3AF",
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 150ms ease",
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* error */}
        {error && (
          <div
            style={{
              margin: "16px 28px 0",
              padding: "12px 16px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 16,
              color: "#f87171",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
          {/* ══ OVERVIEW ══ */}
          {tab === "overview" && (
            <div>
              {/* stat cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                  gap: 14,
                  marginBottom: 28,
                }}
              >
                <StatCard
                  label="Total Users"
                  value={stats?.totalUsers}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                  color="#3b82f6"
                  sub={`${fmt(newSignups.length)} new this week`}
                />
                <StatCard
                  label="Total Jobs"
                  value={stats?.totalJobs}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>}
                  color="#D97736"
                  sub={`${fmt(stats?.jobsByStatus?.completed || 0)} completed`}
                />
                <StatCard
                  label="Total Subtitles"
                  value={stats?.totalSubtitles}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
                  color="#22c55e"
                />
                <StatCard
                  label="Storage Files"
                  value={stats?.totalStorageFiles}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>}
                  color="#a855f7"
                />
                <StatCard
                  label="Active 7d"
                  value={stats?.activeUsers7}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                  color="#f97316"
                  sub={`${fmt(stats?.activeUsers30)} active 30d`}
                />
                <StatCard
                  label="Banned Users"
                  value={users?.filter((u) => u.banned).length}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}
                  color="#ef4444"
                />
                <StatCard label="Churned 30d" value={churned.length} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>} color="#6b7280" />
                <StatCard
                  label="New Signups 7d"
                  value={newSignups.length}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                  color="#ec4899"
                />
              </div>

              {/* jobs over time */}
              <div
                className="admin-card"
                style={{ marginBottom: 18 }}
              >
                <SectionHead title="Jobs Over Time" />
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats?.jobsByDate || []}>
                    <defs>
                      <linearGradient id="gJobs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97736" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D97736" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10,10,10,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 6,
                        fontSize: 12,
                        boxShadow: "rgba(0,0,0,0.3) 0px 10px 30px -5px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#D97736"
                      strokeWidth={2}
                      fill="url(#gJobs)"
                      name="Jobs"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* pie row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                <div
                  className="admin-card"
                >
                  <SectionHead title="Language Split" />
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={langPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {langPie.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="admin-card"
                >
                  <SectionHead title="Job Status" />
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={statusPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {statusPie.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* top users */}
              <div
                className="admin-card"
              >
                <SectionHead title="Top Users by Jobs" />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(stats?.topUsers || []).slice(0, 6).map((u, i) => (
                    <div
                      key={u.userId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: `${COLORS[i % COLORS.length]}30`,
                          color: COLORS[i % COLORS.length],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                          {u.email}
                        </div>
                        {u.name && <div style={{ fontSize: 11, color: "#6b7280" }}>{u.name}</div>}
                      </div>
                      <div
                        style={{
                          padding: "3px 10px",
                          borderRadius: 9999,
                          background: `${COLORS[i % COLORS.length]}20`,
                          color: COLORS[i % COLORS.length],
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {u.count} jobs
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ USERS ══ */}
          {tab === "users" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="🔍  Search by email or name…"
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "#0f0f12",
                    color: "#fff",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: 16,
                    background: "#0f0f12",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 13,
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {filteredUsers.length} users
                </div>
              </div>

              {selectedUsers.size > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "rgba(217,119,6,0.08)",
                    borderRadius: 16,
                    marginBottom: 12,
                    border: "1px solid rgba(217,119,6,0.15)",
                    transition: "all 150ms ease",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#D97736", fontWeight: 600 }}>
                    {selectedUsers.size} selected
                  </span>
                  <button
                    onClick={() => {
                      setConfirm({
                        title: `Ban ${selectedUsers.size} users?`,
                        body: "Ban all selected users.",
                        confirmLabel: "Ban selected",
                        danger: true,
                        onConfirm: async () => {
                          setConfirm(null);
                          for (const uid of selectedUsers) {
                            try {
                              await banAdminUser({
                                data: { accessToken: token, userId: uid, banned: true },
                              });
                            } catch (e) {}
                          }
                          push(`Banned ${selectedUsers.size} users`);
                          setSelectedUsers(new Set());
                          loadAll();
                        },
                      });
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 9999,
                      border: "none",
                      background: "rgba(217,119,6,0.15)",
                      color: "#FF9A4D",
                      cursor: "pointer",
                      fontSize: 12,
                      transition: "all 150ms ease",
                    }}
                  >
                    Ban Selected
                  </button>
                  <button
                    onClick={() => {
                      setConfirm({
                        title: `Delete ${selectedUsers.size} users?`,
                        body: "Permanently delete all selected users.",
                        confirmLabel: "Delete selected",
                        danger: true,
                        onConfirm: async () => {
                          setConfirm(null);
                          for (const uid of selectedUsers) {
                            try {
                              await deleteAdminUser({ data: { accessToken: token, userId: uid } });
                            } catch (e) {}
                          }
                          push(`Deleted ${selectedUsers.size} users`);
                          setSelectedUsers(new Set());
                          loadAll();
                        },
                      });
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 9999,
                      border: "none",
                      background: "rgba(239,68,68,0.12)",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: 12,
                      transition: "all 150ms ease",
                    }}
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedUsers(new Set())}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 9999,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "#6b7280",
                      cursor: "pointer",
                      fontSize: 12,
                      transition: "all 150ms ease",
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredUsers.map((u) => (
                  <div key={u.id}>
                    <div
                      style={{
                        background: "rgba(10,10,10,0.8)",
                        backdropFilter: "blur(24px)",
                        border: `1px solid ${u.banned ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 16,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        transition: "all 150ms ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(u.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedUsers((prev) => {
                            const next = new Set(prev);
                            if (next.has(u.id)) next.delete(u.id);
                            else next.add(u.id);
                            return next;
                          });
                        }}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: "#D97736",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      {/* avatar */}
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: u.banned
                            ? "#451a1a"
                            : "linear-gradient(135deg,#D97736,#FF9A4D)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#000",
                          flexShrink: 0,
                        }}
                      >
                        {initials(u.name, u.email)}
                      </div>

                      {/* info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                            {u.email}
                          </span>
                          {u.banned && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: 9999,
                                background: "#451a1a",
                                color: "#f87171",
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              BANNED
                            </span>
                          )}
                          {u.active7 && !u.banned && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: 9999,
                                background: "rgba(34,197,94,0.1)",
                                color: "#4ade80",
                                fontSize: 11,
                              }}
                            >
                              active
                            </span>
                          )}
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 9999,
                              background: "rgba(255,255,255,0.05)",
                              color: "#6b7280",
                              fontSize: 11,
                            }}
                          >
                            {u.provider}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
                          {u.name && <span style={{ marginRight: 10 }}>{u.name}</span>}
                          Joined {fmtDate(u.createdAt)} · Last seen {fmtAgo(u.lastSignIn)} ·{" "}
                          {u.jobCount} jobs · {u.topLanguage}
                        </div>
                      </div>

                      {/* actions */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 9999,
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "transparent",
                            color: "#9CA3AF",
                            cursor: "pointer",
                            fontSize: 12,
                            transition: "all 150ms ease",
                          }}
                        >
                          {expandedUser === u.id ? "▲ Hide" : "▼ Jobs"}
                        </button>
                        <button
                          onClick={() => handleBanUser(u)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 9999,
                            border: "none",
                            background: u.banned ? "rgba(34,197,94,0.15)" : "rgba(217,119,6,0.15)",
                            color: u.banned ? "#4ade80" : "#FF9A4D",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 500,
                            transition: "all 150ms ease",
                          }}
                        >
                          {u.banned ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 9999,
                            border: "none",
                            background: "rgba(239,68,68,0.12)",
                            color: "#f87171",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 500,
                            transition: "all 150ms ease",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* expanded jobs for this user */}
                    {expandedUser === u.id && stats?.jobs && (
                      <div
                        style={{
                          margin: "4px 0 4px 52px",
                          padding: "12px 14px",
                          background: "#0f0f12",
                          borderRadius: 16,
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {stats.jobs.filter((j) => j.user_id === u.id).length === 0 ? (
                          <div style={{ fontSize: 12, color: "#6b7280" }}>No jobs</div>
                        ) : (
                          stats.jobs
                            .filter((j) => j.user_id === u.id)
                            .map((j) => (
                              <div
                                key={j.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "6px 0",
                                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                                }}
                              >
                                <span style={{ fontSize: 12, color: "#9CA3AF", flex: 1 }}>
                                  {j.title || j.id.slice(0, 10)} · {j.language} · {j.status}
                                </span>
                                <span style={{ fontSize: 11, color: "#6b7280" }}>
                                  {fmtDate(j.created_at)}
                                </span>
                                <button
                                  onClick={() => handleDeleteJob(j)}
                                  style={{
                                    padding: "3px 8px",
                                    borderRadius: 9999,
                                    border: "none",
                                    background: "rgba(239,68,68,0.1)",
                                    color: "#f87171",
                                    cursor: "pointer",
                                    fontSize: 11,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    transition: "all 150ms ease",
                                  }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Del
                                </button>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ JOBS ══ */}
          {tab === "jobs" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                <input
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="🔍  Search jobs…"
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: "10px 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "#0f0f12",
                    color: "#fff",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "#0f0f12",
                    color: "#fff",
                    fontSize: 13,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                </select>
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: 16,
                    background: "#0f0f12",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 13,
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {filteredJobs.length} / {stats?.totalJobs || 0}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filteredJobs.slice(0, 100).map((j) => (
                  <div
                    key={j.id}
                    style={{
                      background: "#0f0f12",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        background: j.thumb_color || "#1a1a20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                        {j.title || `Job ${j.id.slice(0, 8)}`}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                        {j.userEmail} · {j.language} · {fmtDate(j.created_at)}
                      </div>
                      {j.ai_description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#6b7280",
                            marginTop: 3,
                            fontStyle: "italic",
                          }}
                        >
                          "{j.ai_description.slice(0, 80)}…"
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 600,
                        background:
                          j.status === "completed" ? "rgba(34,197,94,0.1)" : "rgba(217,119,6,0.1)",
                        color: j.status === "completed" ? "#4ade80" : "#D97736",
                      }}
                    >
                      {j.status}
                    </span>
                    <button
                      onClick={() => handleDeleteJob(j)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 9999,
                        border: "none",
                        background: "rgba(239,68,68,0.12)",
                        color: "#f87171",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "all 150ms ease",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
                    </button>
                  </div>
                ))}
                {filteredJobs.length > 100 && (
                  <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, padding: 12 }}>
                    Showing first 100 of {filteredJobs.length} results
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {tab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* users over time */}
              <div
                className="admin-card"
              >
                <SectionHead title="User Signups Over Time" />
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats?.usersByDate || []}>
                    <defs>
                      <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10,10,10,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 6,
                        fontSize: 12,
                        boxShadow: "rgba(0,0,0,0.3) 0px 10px 30px -5px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#gUsers)"
                      name="Signups"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* cumulative */}
              <div
                className="admin-card"
              >
                <SectionHead title="Cumulative Growth" />
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats?.cumulativeData || []}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10,10,10,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 6,
                        fontSize: 12,
                        boxShadow: "rgba(0,0,0,0.3) 0px 10px 30px -5px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="jobs"
                      stroke="#D97736"
                      dot={false}
                      name="Jobs"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      dot={false}
                      name="Users"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* by weekday */}
                <div
                  className="admin-card"
                >
                  <SectionHead title="Jobs by Weekday" />
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={stats?.jobsByWeekday || []}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" fill="#D97736" radius={[4, 4, 0, 0]} name="Jobs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* by hour */}
                <div
                  className="admin-card"
                >
                  <SectionHead title="Jobs by Hour (UTC)" />
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={stats?.jobsByHour || []}>
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 9, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                        interval={3}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} name="Jobs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* duration buckets */}
                <div
                  className="admin-card"
                >
                  <SectionHead title="Video Duration Buckets" />
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={durationPie}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} name="Videos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* engagement */}
                <div
                  className="admin-card"
                >
                  <SectionHead title="User Engagement" />
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={Object.entries(stats?.engagementBuckets || {}).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} name="Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ══ AI INSIGHTS ══ */}
          {tab === "insights" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* peak hour */}
              {stats?.jobsByHour &&
                (() => {
                  const peak = stats.jobsByHour.reduce((a, b) => (b.count > a.count ? b : a), {
                    count: 0,
                  });
                  return (
                    <div
                      style={{
                        background: "linear-gradient(135deg,rgba(217,119,6,0.1),rgba(59,130,246,0.1))",
                        border: "1px solid rgba(217,119,6,0.2)",
                        borderRadius: 16,
                        padding: 20,
                        backdropFilter: "blur(24px)",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> AI INSIGHT
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
                        Peak usage is at <span style={{ color: "#D97736" }}>{peak.hour}</span> UTC
                        with {peak.count} jobs
                      </div>
                    </div>
                  );
                })()}

              {/* churned users */}
              <div
                className="admin-card"
              >
                <SectionHead
                  title={`Churned Users (${churned.length}) — No activity in 30 days`}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {churned.slice(0, 10).map((u) => (
                    <div
                      key={u.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: "#1a1a20",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {initials(u.name, u.email)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#9CA3AF" }}>{u.email}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          Last seen {fmtAgo(u.lastSignIn)} · {u.jobCount} total jobs
                        </div>
                      </div>
                    </div>
                  ))}
                  {churned.length === 0 && (
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      No churned users — great retention!
                    </div>
                  )}
                </div>
              </div>

              {/* new signups */}
              <div
                className="admin-card"
              >
                <SectionHead title={`New Signups This Week (${newSignups.length})`} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {newSignups.slice(0, 10).map((u) => (
                    <div
                      key={u.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 12px",
                        background: "rgba(34,197,94,0.04)",
                        borderRadius: 16,
                        border: "1px solid rgba(34,197,94,0.1)",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: "rgba(34,197,94,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "#4ade80",
                        }}
                      >
                        {initials(u.name, u.email)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#fff" }}>{u.email}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          Joined {fmtAgo(u.createdAt)} · {u.provider}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#4ade80" }}>new</span>
                    </div>
                  ))}
                  {newSignups.length === 0 && (
                    <div style={{ fontSize: 13, color: "#6b7280" }}>No new signups this week</div>
                  )}
                </div>
              </div>

              {/* top language */}
              <div
                className="admin-card"
              >
                <SectionHead title="Language Popularity Ranking" />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Object.entries(stats?.jobsByLanguage || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([lang, count], i) => {
                      const max = Math.max(...Object.values(stats?.jobsByLanguage || {}));
                      return (
                        <div key={lang} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 60,
                              fontSize: 12,
                              color: "#9CA3AF",
                              textAlign: "right",
                            }}
                          >
                            {lang}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              height: 8,
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(count / max) * 100}%`,
                                height: "100%",
                                background: COLORS[i % COLORS.length],
                                borderRadius: 4,
                              }}
                            />
                          </div>
                          <div style={{ width: 30, fontSize: 12, color: "#6b7280" }}>{count}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ══ REVENUE ══ */}
          {tab === "revenue" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                  gap: 14,
                }}
              >
                <StatCard
                  label="Total Jobs"
                  value={revenue?.totalJobs || 0}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>}
                  color="#D97736"
                  sub="All time"
                />
                <StatCard
                  label="Completed"
                  value={revenue?.completedJobs || 0}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
                  color="#22c55e"
                  sub="Successfully processed"
                />
                <StatCard
                  label="This Month"
                  value={revenue?.jobsThisMonth || 0}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                  color="#3b82f6"
                  sub="Jobs this month"
                />
                <StatCard
                  label="Est. Revenue"
                  value={`₹${(revenue?.estimatedRevenue || 0).toLocaleString("en-IN")}`}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                  color="#22c55e"
                  sub="Based on completed jobs"
                />
              </div>
              <div
                className="admin-card"
              >
                <SectionHead title="Revenue Breakdown" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    {
                      label: "Completed Jobs",
                      value: revenue?.completedJobs || 0,
                      total: revenue?.totalJobs || 1,
                      color: "#22c55e",
                    },
                    {
                      label: "Processing",
                      value: (revenue?.totalJobs || 0) - (revenue?.completedJobs || 0),
                      total: revenue?.totalJobs || 1,
                      color: "#D97736",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div style={{ width: 120, fontSize: 12, color: "#9CA3AF" }}>{item.label}</div>
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${(item.value / item.total) * 100}%`,
                            height: "100%",
                            background: item.color,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <div
                        style={{ width: 40, fontSize: 12, color: "#6b7280", textAlign: "right" }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ STORAGE ══ */}
          {tab === "storage" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <SectionHead title={`Storage Files (${storageFiles?.length || 0})`} />
                <button
                  onClick={async () => {
                    setStorageLoading(true);
                    try {
                      setStorageFiles(await getStorageFiles({ data: { accessToken: token } }));
                    } catch (e) {
                      push(e.message, "error");
                    }
                    setStorageLoading(false);
                  }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 9999,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    fontSize: 12,
                    transition: "all 150ms ease",
                  }}
                >
                  ↻ Load Files
                </button>
              </div>
              {storageLoading && (
                <div style={{ fontSize: 13, color: "#6b7280" }}>Loading storage files…</div>
              )}
              {storageFiles && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {storageFiles.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        background: "rgba(10,10,10,0.8)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "all 150ms ease",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          background: "#1a1a20",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {f.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                          {(f.size / 1024 / 1024).toFixed(1)} MB · {f.mimeType} ·{" "}
                          {fmtDate(f.createdAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setConfirm({
                            title: `Delete "${f.name}"?`,
                            body: "This permanently removes the file from storage.",
                            confirmLabel: "Delete file",
                            danger: true,
                            onConfirm: async () => {
                              setConfirm(null);
                              try {
                                await deleteStorageFile({
                                  data: { accessToken: token, path: f.name },
                                });
                                setStorageFiles((prev) => prev.filter((x) => x.id !== f.id));
                                push(`Deleted ${f.name}`);
                              } catch (e) {
                                push(e.message, "error");
                              }
                            },
                          });
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 9999,
                          border: "none",
                          background: "rgba(239,68,68,0.12)",
                          color: "#f87171",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          transition: "all 150ms ease",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
                      </button>
                    </div>
                  ))}
                  {storageFiles.length === 0 && (
                    <div
                      style={{ fontSize: 13, color: "#6b7280", textAlign: "center", padding: 40 }}
                    >
                      No storage files
                    </div>
                  )}
                </div>
              )}
              {!storageFiles && !storageLoading && (
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Click "Load Files" to view storage contents
                </div>
              )}
            </div>
          )}

          {/* ══ EMAIL LOGS ══ */}
          {tab === "emails" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                {["all", "welcome", "test", "limit"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setEmailFilter(f)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 9999,
                      border: "none",
                      fontSize: 12,
                      cursor: "pointer",
                      background:
                        emailFilter === f ? "rgba(217,119,6,0.15)" : "rgba(255,255,255,0.04)",
                      color: emailFilter === f ? "#D97736" : "#6b7280",
                      textTransform: "capitalize",
                      transition: "all 150ms ease",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div
                className="admin-card"
              >
                <SectionHead title="Email Statistics" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {[
                    {
                      label: "Welcome Emails",
                      value: stats?.emailStats?.welcome || 0,
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 11l.6-2.4A2 2 0 0 1 9.2 7h.2a2 2 0 0 1 2 1.7l.3 1.4a2 2 0 0 0 2 1.7h.4a2 2 0 0 1 2 1.9l-.2 2.3a2 2 0 0 1-1.5 1.8l-6.5 2.2"/></svg>,
                      color: "#22c55e",
                    },
                    {
                      label: "Test Emails",
                      value: stats?.emailStats?.test || 0,
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6"/><path d="M10 9V3"/><path d="M14 9V3"/><path d="M6 21h12"/><path d="M10 9l-4 8a2 2 0 0 0 1.8 2.9h8.4A2 2 0 0 0 18 17l-4-8"/></svg>,
                      color: "#3b82f6",
                    },
                    {
                      label: "Free Tier Alerts",
                      value: stats?.emailStats?.freeTierLimit || 0,
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
                      color: "#D97736",
                    },
                  ].map((e) => (
                    <div
                      key={e.label}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 16,
                        padding: 16,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{e.icon}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{e.value}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{e.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="admin-card"
              >
                <SectionHead title="Email Service Status" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ["Resend API", "Connected", "#22c55e"],
                    ["Rate Limiting", "In-memory (resets on restart)", "#D97736"],
                    ["Welcome Emails", "Sent on signup", "#22c55e"],
                    ["Free Tier Alerts", "Sent at 80% usage", "#22c55e"],
                  ].map(([k, v, c]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 16,
                      }}
                    >
                      <div style={{ width: 140, fontSize: 12, color: "#6b7280" }}>{k}</div>
                      <div style={{ fontSize: 13, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ FEATURE FLAGS ══ */}
          {tab === "flags" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                className="admin-card"
              >
                <SectionHead
                  title="Feature Flags"
                  action={
                    <span style={{ fontSize: 11, color: "#6b7280" }}>
                      Toggle features on/off (stored in state, wire to DB to persist)
                    </span>
                  }
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(featureFlags).map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 16,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                          {val ? "Enabled" : "Disabled"}
                        </div>
                      </div>
                      <button
                        onClick={() => setFeatureFlags((prev) => ({ ...prev, [key]: !prev[key] }))}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 9999,
                          border: "none",
                          cursor: "pointer",
                          background: val ? "#D97736" : "rgba(255,255,255,0.1)",
                          position: "relative",
                          transition: "background 150ms ease",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#fff",
                            position: "absolute",
                            top: 3,
                            left: val ? 23 : 3,
                            transition: "left 150ms ease",
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ AUDIT LOG ══ */}
          {tab === "audit" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                className="admin-card"
              >
                <SectionHead
                  title="Audit Log"
                  action={
                    <button
                      onClick={async () => {
                        try {
                          setAuditLog(await getAuditLog({ data: { accessToken: token } }));
                        } catch (e) {
                          push(e.message, "error");
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 9999,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "transparent",
                        color: "#9CA3AF",
                        cursor: "pointer",
                        fontSize: 12,
                        transition: "all 150ms ease",
                      }}
                    >
                      ↻ Load
                    </button>
                  }
                />
                {auditLog.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#6b7280", textAlign: "center", padding: 30 }}>
                    No audit logs yet. Create an "audit_log" table in Supabase to enable tracking.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {auditLog.map((log, i) => (
                      <div
                        key={log.id || i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: 16,
                        }}
                      >
                        <div style={{ fontSize: 11, color: "#6b7280", minWidth: 80 }}>
                          {fmtDate(log.created_at)}
                        </div>
                        <div style={{ fontSize: 13, color: "#9CA3AF", flex: 1 }}>
                          {log.action} — {log.details || ""}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{log.admin_email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ BULK OPS ══ */}
          {tab === "bulk" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                className="admin-card"
              >
                <SectionHead title="Bulk Operations" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                    gap: 12,
                  }}
                >
                  {[
                    {
                      label: "Export Users CSV",
                      desc: "Download all user data as CSV",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
                      action: async () => {
                        const res = await exportAdminData({
                          data: { accessToken: token, type: "users" },
                        });
                        const blob = new Blob([res.csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = res.filename;
                        a.click();
                        URL.revokeObjectURL(url);
                        push("Users exported!");
                      },
                    },
                    {
                      label: "Export Jobs CSV",
                      desc: "Download all job data as CSV",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
                      action: async () => {
                        const res = await exportAdminData({
                          data: { accessToken: token, type: "jobs" },
                        });
                        const blob = new Blob([res.csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = res.filename;
                        a.click();
                        URL.revokeObjectURL(url);
                        push("Jobs exported!");
                      },
                    },
                    {
                      label: "Delete All Banned",
                      desc: "Remove all banned users permanently",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
                      action: () => {
                        const banned = users?.filter((u) => u.banned) || [];
                        if (banned.length === 0) {
                          push("No banned users", "error");
                          return;
                        }
                        setConfirm({
                          title: `Delete ${banned.length} banned users?`,
                          body: "This permanently deletes all banned users and their jobs.",
                          confirmLabel: `Delete ${banned.length} users`,
                          danger: true,
                          onConfirm: async () => {
                            setConfirm(null);
                            for (const u of banned) {
                              try {
                                await deleteAdminUser({
                                  data: { accessToken: token, userId: u.id },
                                });
                              } catch (e) {}
                            }
                            push(`Deleted ${banned.length} banned users`);
                            loadAll();
                          },
                        });
                      },
                    },
                    {
                      label: "Purge Old Jobs",
                      desc: "Delete jobs older than 90 days",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
                      action: () => {
                        const cutoff = Date.now() - 90 * 86400000;
                        const old =
                          stats?.jobs?.filter((j) => new Date(j.created_at).getTime() < cutoff) ||
                          [];
                        if (old.length === 0) {
                          push("No old jobs to purge", "error");
                          return;
                        }
                        setConfirm({
                          title: `Purge ${old.length} old jobs?`,
                          body: "Delete all jobs created more than 90 days ago.",
                          confirmLabel: `Purge ${old.length} jobs`,
                          danger: true,
                          onConfirm: async () => {
                            setConfirm(null);
                            for (const j of old) {
                              try {
                                await deleteAdminJob({ data: { accessToken: token, jobId: j.id } });
                              } catch (e) {}
                            }
                            push(`Purged ${old.length} old jobs`);
                            loadAll();
                          },
                        });
                      },
                    },
                    {
                      label: "Ban All Inactive 30d",
                      desc: "Ban users with no activity in 30 days",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
                      action: () => {
                        const inactive =
                          users?.filter((u) => !u.active30 && !u.banned && u.jobCount > 0) || [];
                        if (inactive.length === 0) {
                          push("No inactive users", "error");
                          return;
                        }
                        setConfirm({
                          title: `Ban ${inactive.length} inactive users?`,
                          body: "These users haven't been active in 30 days.",
                          confirmLabel: `Ban ${inactive.length} users`,
                          danger: true,
                          onConfirm: async () => {
                            setConfirm(null);
                            for (const u of inactive) {
                              try {
                                await banAdminUser({
                                  data: { accessToken: token, userId: u.id, banned: true },
                                });
                              } catch (e) {}
                            }
                            push(`Banned ${inactive.length} inactive users`);
                            loadAll();
                          },
                        });
                      },
                    },
                    {
                      label: "Refresh All Data",
                      desc: "Force reload all admin data",
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
                      action: loadAll,
                    },
                  ].map((op) => (
                    <div
                      key={op.label}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 16,
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{op.icon}</span>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                          {op.label}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{op.desc}</div>
                      <button
                        onClick={op.action}
                        style={{
                          marginTop: 4,
                          padding: "8px 16px",
                          borderRadius: 9999,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "transparent",
                          color: "#9CA3AF",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 500,
                          textAlign: "left",
                          transition: "all 150ms ease",
                        }}
                      >
                        Execute →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ MODERATION ══ */}
          {tab === "moderation" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                className="admin-card"
              >
                <SectionHead title="Currently Banned Users" />
                {users?.filter((u) => u.banned).length === 0 ? (
                  <div style={{ fontSize: 13, color: "#6b7280" }}>No banned users currently</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {users
                      ?.filter((u) => u.banned)
                      .map((u) => (
                        <div
                          key={u.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 14px",
                            background: "rgba(239,68,68,0.05)",
                            borderRadius: 16,
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "#f87171", fontWeight: 500 }}>
                              {u.email}
                            </div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>
                              Banned · {u.jobCount} jobs
                            </div>
                          </div>
                          <button
                            onClick={() => handleBanUser(u)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 9999,
                              border: "none",
                              background: "rgba(34,197,94,0.15)",
                              color: "#4ade80",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 500,
                              transition: "all 150ms ease",
                            }}
                          >
                            ✓ Unban
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 9999,
                              border: "none",
                              background: "rgba(239,68,68,0.12)",
                              color: "#f87171",
                              cursor: "pointer",
                              fontSize: 12,
                              transition: "all 150ms ease",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* jobs with AI description */}
              <div
                className="admin-card"
              >
                <SectionHead title="Jobs with AI Descriptions" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(stats?.jobs || [])
                    .filter((j) => j.ai_description)
                    .slice(0, 15)
                    .map((j) => (
                      <div
                        key={j.id}
                        style={{
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#9CA3AF",
                            marginBottom: 4,
                          }}
                        >
                          {j.title || j.id.slice(0, 10)} · {j.userEmail}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            fontStyle: "italic",
                            lineHeight: 1.5,
                          }}
                        >
                          "{j.ai_description}"
                        </div>
                      </div>
                    ))}
                  {!(stats?.jobs || []).some((j) => j.ai_description) && (
                    <div style={{ fontSize: 13, color: "#6b7280" }}>No AI descriptions yet</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ BROADCAST ══ */}
          {tab === "broadcast" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                className="admin-card"
                style={{ padding: 24 }}
              >
                <SectionHead title="Send Announcement" />
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Type your announcement to all users…"
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "#0A0A0A",
                    color: "#fff",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button
                    onClick={handleSendAnnouncement}
                    disabled={!announcement.trim()}
                    style={{
                      padding: "10px 24px",
                      borderRadius: 9999,
                      border: "none",
                      background: announcement.trim() ? "#D97736" : "rgba(255,255,255,0.05)",
                      color: announcement.trim() ? "#030303" : "#6b7280",
                      cursor: announcement.trim() ? "pointer" : "not-allowed",
                      fontSize: 13,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 150ms ease",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Post Announcement
                  </button>
                </div>
              </div>

              {announcements.length > 0 && (
                <div
                  className="admin-card"
                >
                  <SectionHead title="Announcement History" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {announcements.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          padding: "12px 14px",
                          background: "rgba(217,119,6,0.05)",
                          borderRadius: 16,
                          border: "1px solid rgba(217,119,6,0.1)",
                        }}
                      >
                        <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>{a.msg}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                          {fmtDate(a.time)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ SYSTEM ══ */}
          {tab === "system" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                  gap: 14,
                }}
              >
                <StatCard label="DB Users" value={stats?.totalUsers} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>} color="#3b82f6" />
                <StatCard label="DB Jobs" value={stats?.totalJobs} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>} color="#D97736" />
                <StatCard
                  label="DB Subtitles"
                  value={stats?.totalSubtitles}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                  color="#22c55e"
                />
                <StatCard
                  label="Storage Files"
                  value={stats?.totalStorageFiles}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>}
                  color="#a855f7"
                />
                <StatCard
                  label="Avg Sub Duration"
                  value={`${stats?.avgSubDuration || 0}s`}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                  color="#ec4899"
                />
                <StatCard
                  label="Avg Completion"
                  value={stats?.avgCompletionMin === "N/A" ? "N/A" : `${stats?.avgCompletionMin}m`}
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
                  color="#f97316"
                />
              </div>

              <div
                className="admin-card"
              >
                <SectionHead title="Admin Info" />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["Admin Email", ADMIN_EMAIL],
                    ["Auth Status", user ? "Authenticated" : "Not authenticated"],
                    [
                      "Session Valid",
                      useAuthStore.getState().session ? "Active" : "No session",
                    ],
                    ["Supabase URL", import.meta.env.VITE_SUPABASE_URL ? "Set" : "Missing"],
                    ["Service Role Key", "Server-side only"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 16,
                      }}
                    >
                      <div style={{ width: 180, fontSize: 12, color: "#6b7280" }}>{k}</div>
                      <div style={{ fontSize: 13, color: "#9CA3AF", fontFamily: "monospace" }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="admin-card"
              >
                <SectionHead title="Quick Actions" />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={loadAll}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 9999,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "#9CA3AF",
                      cursor: "pointer",
                      fontSize: 13,
                      transition: "all 150ms ease",
                    }}
                  >
                    ↻ Reload All Data
                  </button>
                  <button
                    onClick={() => {
                      setStats(null);
                      setUsers(null);
                      loadAll();
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 9999,
                      border: "1px solid #D97736",
                      background: "transparent",
                      color: "#D97736",
                      cursor: "pointer",
                      fontSize: 13,
                      transition: "all 150ms ease",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Hard Reset + Reload
                  </button>
                  <Link to="/dashboard">
                    <button
                      style={{
                        padding: "10px 20px",
                        borderRadius: 9999,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "transparent",
                        color: "#9CA3AF",
                        cursor: "pointer",
                        fontSize: 13,
                        transition: "all 150ms ease",
                      }}
                    >
                      ← Go to App
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* dialogs & toasts */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        body={confirm?.body}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
      <Toasts />
    </div>
  );
}
