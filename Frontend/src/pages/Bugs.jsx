import { useState, useEffect } from "react";
import { getBugsRequest } from "../api/api";
import BugTable from "../components/BugTable";
import CreateBugModal from "../components/CreateBugModal";
import EmptyState from "../components/EmptyState";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { canCreateBugs } from "../utils/permissions";

function Bugs() {
  const { user } = useAuth();
  const hasCreatePermission = canCreateBugs(user?.role);
  const [bugs, setBugs] = useState([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createBugOpen, setCreateBugOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBugsRequest();
        setBugs(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bugs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredBugs = bugs.filter((bug) => {
    const matchSearch =
      bug.title?.toLowerCase().includes(search.toLowerCase()) ||
      bug._id?.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter ? bug.severity === severityFilter : true;
    const matchStatus = statusFilter ? bug.status === statusFilter : true;
    return matchSearch && matchSeverity && matchStatus;
  });

  const clearFilters = () => {
    setSearch("");
    setSeverityFilter("");
    setStatusFilter("");
  };

  return (
    <section>
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <h1>All Bugs</h1>
          <p className="muted-text" style={{ fontSize: "0.9rem", marginTop: "0.2rem" }}>
            {filteredBugs.length} bug{filteredBugs.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {hasCreatePermission && (
          <button className="btn btn-primary" onClick={() => setCreateBugOpen(true)}>
            <Plus size={16} strokeWidth={2.2} /> New Bug
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
        <div className="filter-row">
          <div className="filter-search-wrap">
            <span className="filter-search-icon" aria-hidden="true">
              <Search size={16} strokeWidth={2.2} />
            </span>
            <input
              type="text"
              placeholder="Search bugs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-search-input"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severity</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Fixed">Fixed</option>
            <option value="Testing">Testing</option>
            <option value="Closed">Closed</option>
            <option value="Reopened">Reopened</option>
          </select>

          {(search || severityFilter || statusFilter) && (
            <button className="btn btn-outline" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading && <div className="page-feedback">Loading bugs...</div>}
      {error && <div className="page-feedback error-text">{error}</div>}

      {!loading && !error && filteredBugs.length === 0 && (
        <EmptyState
          icon={Search}
          title="No bugs found"
          description="Try adjusting your search or filters to find what you're looking for."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      )}

      {!loading && !error && filteredBugs.length > 0 && (
        <BugTable bugs={filteredBugs} />
      )}

      {hasCreatePermission && (
        <CreateBugModal open={createBugOpen} onOpenChange={setCreateBugOpen} />
      )}
    </section>
  );
}

export default Bugs;
