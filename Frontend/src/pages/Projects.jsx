import { useEffect, useMemo, useState } from "react";
import { getBugsRequest, getProjectsRequest, createProjectRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const [projectData, bugData] = await Promise.all([
          getProjectsRequest(),
          getBugsRequest(),
        ]);
        setProjects(projectData);
        setBugs(bugData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const bugCountByProject = useMemo(() => {
    const map = new Map();
    bugs.forEach((bug) => {
      const projectId = bug.project?._id;
      if (projectId) map.set(projectId, (map.get(projectId) || 0) + 1);
    });
    return map;
  }, [bugs]);

  const onCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setCreating(true);
    setError("");
    try {
      const created = await createProjectRequest(newProject);
      setProjects((prev) => [created, ...prev]);
      setNewProject({ name: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const canCreate = user?.role === "manager" || user?.role === "admin";

  return (
    <section>
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h1>Projects</h1>
        {canCreate && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? <><X size={16} strokeWidth={2.2} /> Cancel</> : "Create Project"}
          </button>
        )}
      </div>

      {showForm && canCreate && (
        <form className="card form-card" style={{ marginBottom: "1.5rem" }} onSubmit={onCreateProject}>
          <h3 style={{ marginBottom: "1rem" }}>New Project</h3>
          <div className="form-group">
            <label>Project Name</label>
            <input
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="Enter project name..."
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Describe the project..."
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" disabled={creating}>
            {creating ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      {loading && <div className="page-feedback">Loading projects...</div>}
      {error && !showForm && <div className="page-feedback error-text">{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <div className="page-feedback">
          No projects yet.{" "}
          {canCreate ? "Create your first project above." : "Contact your admin to set up a project."}
        </div>
      )}

      {!loading && (
        <div className="cards-grid">
          {projects.map((project) => (
            <article className="card" key={project._id}>
              <h3>{project.name}</h3>
              <p className="muted-text" style={{ marginTop: "0.35rem" }}>
                {project.description || "No description"}
              </p>
              <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
                <strong>Bugs:</strong> {bugCountByProject.get(project._id) || 0}
              </p>
              {project.createdBy && (
                <p className="muted-text" style={{ fontSize: "0.8rem", marginTop: "0.4rem" }}>
                  Created by {project.createdBy.name}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;
