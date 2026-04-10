import { useState, useEffect } from "react";
import { createBugRequest, getProjectsRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { canCreateBugs } from "../utils/permissions";
import { X } from "lucide-react";

function CreateBugModal({ open, onOpenChange }) {
  const { user } = useAuth();
  const hasCreatePermission = canCreateBugs(user?.role);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "Medium",
    priority: "Medium",
    project: "",
  });

  useEffect(() => {
    if (open && hasCreatePermission) {
      setError("");
      setSuccess("");
      getProjectsRequest()
        .then((data) => {
          setProjects(data);
          if (data.length) {
            setFormData((prev) => ({ ...prev, project: data[0]._id }));
          }
        })
        .catch(() => setError("Failed to load projects"));
    }
  }, [open, hasCreatePermission]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasCreatePermission) {
      setError("You do not have permission to create bugs.");
      return;
    }

    if (!formData.title.trim() || !formData.project) {
      setError("Title and project are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createBugRequest(formData);
      setSuccess(`Bug "${formData.title}" created successfully!`);
      setFormData({ title: "", description: "", severity: "Medium", priority: "Medium", project: "" });
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create bug");
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="modal-backdrop" onClick={() => onOpenChange(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Bug Report</h2>
          <button className="modal-close" onClick={() => onOpenChange(false)} aria-label="Close modal">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Title <span className="required">*</span></label>
              <input
                value={formData.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Short, descriptive title..."
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Detailed description of the bug..."
                rows={4}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Severity</label>
                <select value={formData.severity} onChange={(e) => update("severity", e.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select value={formData.priority} onChange={(e) => update("priority", e.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Project <span className="required">*</span></label>
              <select
                value={formData.project}
                onChange={(e) => update("project", e.target.value)}
                required
              >
                {!projects.length && <option value="">No projects available</option>}
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Priority pills from Figma design */}
            <div className="form-group">
              <label>Quick Priority</label>
              <div className="priority-pills">
                {["Low", "Medium", "High", "Critical"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update("priority", p)}
                    className={`priority-pill priority-pill--${p.toLowerCase()}${
                      formData.priority === p ? " priority-pill--active" : ""
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Bug"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBugModal;
