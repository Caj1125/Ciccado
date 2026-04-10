import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBugRequest, getProjectsRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { canCreateBugs } from "../utils/permissions";

function CreateBug() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasCreatePermission = canCreateBugs(user?.role);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "Medium",
    priority: "Medium",
    project: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasCreatePermission) {
      return;
    }

    const loadProjects = async () => {
      try {
        const data = await getProjectsRequest();
        setProjects(data);
        if (data.length) {
          setForm((prev) => ({ ...prev, project: data[0]._id }));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load projects");
      }
    };
    loadProjects();
  }, [hasCreatePermission]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!hasCreatePermission) {
      setError("You do not have permission to create bugs.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createBugRequest(form);
      navigate("/bugs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create bug");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Create Bug</h1>
      </div>

      {!hasCreatePermission && (
        <div className="page-feedback error-text" style={{ marginBottom: "1rem" }}>
          You do not have permission to create bugs.
        </div>
      )}

      {hasCreatePermission && (
      <form className="card form-card" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Short, descriptive title..."
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detailed description of the bug..."
            required
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Severity</label>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Project</label>
          <select
            value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
            required
          >
            {!projects.length && <option value="">No projects available</option>}
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Bug"}
        </button>
      </form>
      )}
    </section>
  );
}

export default CreateBug;
