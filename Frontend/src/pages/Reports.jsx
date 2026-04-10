

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import { getBugsRequest } from "../api/api";
import { Download } from "lucide-react";

function Reports() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBugsRequest()
      .then(setBugs)
      .catch((err) => setError(err.response?.data?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // Priority distribution from real data
  const priorityData = ["Low", "Medium", "High", "Critical"].map((p) => ({
    name: p,
    count: bugs.filter((b) => b.priority === p).length,
  }));

  // Severity distribution from real data
  const severityData = ["Low", "Medium", "High", "Critical"].map((s) => ({
    name: s,
    count: bugs.filter((b) => b.severity === s).length,
  }));

  // Status distribution
  const statusLabels = ["New", "Assigned", "In Progress", "Fixed", "Testing", "Closed", "Reopened"];
  const statusData = statusLabels.map((s) => ({
    name: s,
    count: bugs.filter((b) => b.status === s).length,
  }));

  // Summary stats
  const avgBugsPerProject = bugs.length
    ? (bugs.length / Math.max(new Set(bugs.map((b) => b.project?._id).filter(Boolean)).size, 1)).toFixed(1)
    : 0;
  const closedRate = bugs.length
    ? Math.round((bugs.filter((b) => b.status === "Closed" || b.status === "Fixed").length / bugs.length) * 100)
    : 0;
  const criticalCount = bugs.filter((b) => b.severity === "Critical").length;
  const unassigned = bugs.filter((b) => !b.assignedTo).length;

  if (loading) return <div className="page-feedback">Loading reports...</div>;
  if (error) return <div className="page-feedback error-text">{error}</div>;

  return (
    <section>
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <h1>Reports</h1>
          <p className="muted-text" style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Analyze bug trends and project health
          </p>
        </div>
        <button className="btn btn-primary">
          <Download size={16} strokeWidth={2.2} /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <span className="stat-label">Total Bugs</span>
          <span className="stat-value">{bugs.length}</span>
        </div>
        <div className="stat-card success">
          <span className="stat-label">Resolution Rate</span>
          <span className="stat-value">{closedRate}%</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-label">Critical Bugs</span>
          <span className="stat-value">{criticalCount}</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-label">Unassigned</span>
          <span className="stat-value">{unassigned}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid" style={{ marginTop: "1.5rem" }}>
        {/* Priority Chart */}
        <div className="card chart-card">
          <h2>Bugs by Priority</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
              <Bar dataKey="count" name="Bugs" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, index) => {
                  const colors = { Low: "#22c55e", Medium: "#f59e0b", High: "#f97316", Critical: "#ef4444" };
                  return <Bar key={index} fill={colors[entry.name] || "#4f46e5"} />;
                })}
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Chart */}
        <div className="card chart-card">
          <h2>Bugs by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
              <Bar dataKey="count" name="Bugs" fill="#4f46e5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity line chart */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2>Severity Breakdown</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={severityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
            <Legend />
            <Bar dataKey="count" name="Bugs" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default Reports;
