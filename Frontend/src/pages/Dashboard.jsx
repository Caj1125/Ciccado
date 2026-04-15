import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getBugsRequest } from "../api/api";
import BugCard from "../components/BugCard";
import WelcomeBanner from "../components/WelcomeBanner";
import CreateBugModal from "../components/CreateBugModal";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import { useAuth } from "../context/AuthContext";
import { canCreateBugs } from "../utils/permissions";
import { Plus } from "lucide-react";

const STATUS_COLORS = {
  New: "#EF4444",
  Open: "#EF4444",
  Assigned: "#F97316",
  "In Progress": "#3B82F6",
  Fixed: "#22C55E",
  Testing: "#EAB308",
  Closed: "#64748B",
  Reopened: "#A855F7",
};

function Dashboard() {
  const { user } = useAuth();
  const hasCreatePermission = canCreateBugs(user?.role);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createBugOpen, setCreateBugOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBugsRequest();
        setBugs(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Computed stats
  const totalBugs = bugs.length;
  const openBugs = bugs.filter((b) => b.status !== "Closed" && b.status !== "Fixed").length;
  const fixedBugs = bugs.filter((b) => b.status === "Fixed" || b.status === "Closed").length;
  const criticalBugs = bugs.filter(
    (b) => b.severity === "Critical" || b.priority === "Critical"
  ).length;

  // Status distribution for pie chart
  const statusGroups = bugs.reduce((acc, bug) => {
    acc[bug.status] = (acc[bug.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusGroups).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || "#6B7280",
  }));

  // Severity chart data
  const severityGroups = bugs.reduce((acc, bug) => {
    acc[bug.severity] = (acc[bug.severity] || 0) + 1;
    return acc;
  }, {});
  const severityData = ["Low", "Medium", "High", "Critical"].map((s) => ({
    name: s,
    bugs: severityGroups[s] || 0,
  }));

  if (loading) return <div className="page-feedback">Loading dashboard...</div>;
  if (error) return <div className="page-feedback error-text">{error}</div>;

  return (
    <section>
      <WelcomeBanner />

      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "1rem" }}>
        <div>
          <h1>
            Dashboard{" "}
            <span className="muted-text" style={{ fontWeight: 400, fontSize: "1rem" }}>
              / {user?.role || "Overview"}
            </span>
          </h1>
          <p className="muted-text" style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Track and manage your bug reports
          </p>
        </div>
        {hasCreatePermission && (
          <button className="btn btn-primary" onClick={() => setCreateBugOpen(true)}>
            <Plus size={16} strokeWidth={2.2} /> New Bug
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <span className="stat-label">Total Bugs</span>
          <span className="stat-value">{totalBugs}</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-label">Open Bugs</span>
          <span className="stat-value">{openBugs}</span>
        </div>
        <div className="stat-card success">
          <span className="stat-label">Fixed / Closed</span>
          <span className="stat-value">{fixedBugs}</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-label">Critical</span>
          <span className="stat-value">{criticalBugs}</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Severity Bar Chart */}
        <div className="card chart-card">
          <h2>Bugs by Severity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
              />
              <Bar dataKey="bugs" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="card chart-card">
          <h2>Status Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {statusData.map((item) => (
              <div key={item.name} className="chart-legend-item">
                <span className="chart-legend-dot" style={{ backgroundColor: item.color }} />
                <span className="chart-legend-label">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bugs Table */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2>Recent Bugs</h2>
          <Link to="/bugs" className="btn btn-outline" style={{ fontSize: "0.85rem" }}>
            View all →
          </Link>
        </div>

        {bugs.length === 0 ? (
          <p className="muted-text">No bugs yet. Create your first bug!</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {bugs.slice(0, 6).map((bug) => (
                  <tr key={bug._id} className="table-row-hover">
                    <td>
                      <Link to={`/bugs/${bug._id}`} className="table-link">
                        {bug.title}
                      </Link>
                    </td>
                    <td><StatusBadge status={bug.status} /></td>
                    <td><PriorityBadge priority={bug.priority} /></td>
                    <td>{bug.assignedTo?.name || "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasCreatePermission && (
        <CreateBugModal open={createBugOpen} onOpenChange={setCreateBugOpen} />
      )}
    </section>
  );
}

export default Dashboard;
