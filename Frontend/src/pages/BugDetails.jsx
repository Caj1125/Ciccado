import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  assignBugRequest,
  changeBugStatusRequest,
  getBugByIdRequest,
  getDevelopersRequest,
  createSubtaskRequest,
  updateSubtaskStatusRequest,
  deleteSubtaskRequest,
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import BugLifecycle from "../components/BugLifecycle";
import { ArrowLeft, CheckCircle2, Circle, ClipboardList, Clock3, Inbox, MessageSquare, Plus, Sparkles, Trash2, X } from "lucide-react";

const STATUS_OPTIONS = [
  "New", "Assigned", "In Progress", "Fixed", "Testing", "Closed", "Reopened",
];

const NEXT_SUBTASK_STATUS = {
  Pending: "In Progress",
  "In Progress": "Completed",
};

function getSubtaskBadgeClass(status) {
  if (status === "Completed") return "subtask-badge--completed";
  if (status === "In Progress") return "subtask-badge--in-progress";
  return "subtask-badge--pending";
}

function getStatusBtnClass(status) {
  if (status === "Completed") return "subtask-status-btn--completed";
  if (status === "In Progress") return "subtask-status-btn--in-progress";
  return "";
}

function BugDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bug, setBug] = useState(null);
  const [status, setStatus] = useState("");
  const [developers, setDevelopers] = useState([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ---- Subtask state ----
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskDesc, setSubtaskDesc] = useState("");
  const [subtaskAssignee, setSubtaskAssignee] = useState("");
  const [creatingSubtask, setCreatingSubtask] = useState(false);

  const canAssign = user?.role === "admin" || user?.role === "manager";
  const isManager = user?.role === "admin" || user?.role === "manager";
  const isAssignedToBug = bug?.assignedTo?._id === user?._id;
  const canCreateSubtask = isManager || isAssignedToBug;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBugByIdRequest(id);
        setBug(data);
        setStatus(data.status);
        setAssigneeId(data.assignedTo?._id || "");
        // Always load developers for subtask assignment too
        const devs = await getDevelopersRequest();
        setDevelopers(devs);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bug");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const refreshBug = async () => {
    try {
      const data = await getBugByIdRequest(id);
      setBug(data);
      setStatus(data.status);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to refresh bug");
    }
  };

  const onStatusUpdate = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await changeBugStatusRequest(id, status);
      await refreshBug();
      setMessage("Status updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const onAssign = async () => {
    if (!assigneeId) { setError("Please select a developer"); return; }
    setAssigning(true);
    setError("");
    setMessage("");
    try {
      const updated = await assignBugRequest(id, assigneeId);
      setBug(updated);
      setStatus(updated.status);
      setAssigneeId(updated.assignedTo?._id || assigneeId);
      setMessage("Bug assigned successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign bug");
    } finally {
      setAssigning(false);
    }
  };

  const onAddComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      setMessage("Comment added! (Note: wire to addCommentRequest API)");
      setComment("");
    }
  };

  // ---- Subtask Handlers ----
  const onCreateSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskTitle.trim() || !subtaskAssignee) return;
    setCreatingSubtask(true);
    setError("");
    setMessage("");
    try {
      await createSubtaskRequest({
        title: subtaskTitle.trim(),
        description: subtaskDesc.trim(),
        assignedTo: subtaskAssignee,
        bugId: id,
      });
      setSubtaskTitle("");
      setSubtaskDesc("");
      setSubtaskAssignee("");
      setShowSubtaskForm(false);
      await refreshBug();
      setMessage("Subtask created successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create subtask");
    } finally {
      setCreatingSubtask(false);
    }
  };

  const onAdvanceSubtaskStatus = async (subtask) => {
    const nextStatus = NEXT_SUBTASK_STATUS[subtask.status];
    if (!nextStatus) return;
    setError("");
    setMessage("");
    try {
      await updateSubtaskStatusRequest(subtask._id, nextStatus);
      await refreshBug();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update subtask status");
    }
  };

  const onDeleteSubtask = async (subtaskId) => {
    if (!window.confirm("Delete this subtask?")) return;
    setError("");
    setMessage("");
    try {
      await deleteSubtaskRequest(subtaskId);
      await refreshBug();
      setMessage("Subtask deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete subtask");
    }
  };

  const canManageSubtask = (subtask) => {
    if (isManager) return true;
    const assignedId = subtask.assignedTo?._id || subtask.assignedTo;
    return assignedId === user?._id;
  };

  // ---- Computed subtask stats ----
  const subtasks = bug?.subtasks || [];
  const completedCount = subtasks.filter((s) => s.status === "Completed").length;
  const progressPct = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  if (loading) return <div className="page-feedback">Loading bug details...</div>;
  if (error && !bug) return <div className="page-feedback error-text">{error}</div>;

  return (
    <section>
      {/* Back button */}
      <button
        className="btn btn-outline"
        onClick={() => navigate("/bugs")}
        style={{ marginBottom: "1rem" }}
      >
        <ArrowLeft size={16} strokeWidth={2.2} /> Back to bugs
      </button>

      {/* Bug Lifecycle Visualization */}
      <BugLifecycle
        status={bug.status}
        createdAt={bug.createdAt}
        resolvedAt={bug.resolvedAt}
      />

      {/* Two-column layout */}
      <div className="detail-grid">
        {/* LEFT: Main content */}
        <div>
          {/* Bug header */}
          <div className="card" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <StatusBadge status={bug.status} />
              <PriorityBadge priority={bug.priority} />
            </div>
            <h2>{bug.title}</h2>
            <p className="muted-text" style={{ marginTop: "0.75rem", whiteSpace: "pre-line" }}>
              {bug.description}
            </p>

            <div className="detail-list" style={{ marginTop: "1rem" }}>
              <p><strong>Severity:</strong> {bug.severity}</p>
              <p><strong>Priority:</strong> {bug.priority}</p>
              <p><strong>Project:</strong> {bug.project?.name || "-"}</p>
              <p>
                <strong>Reporter:</strong>{" "}
                {bug.reportedBy?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* ===== SUBTASKS SECTION ===== */}
          <div className="card subtask-section" style={{ marginBottom: "1rem" }}>
            <div className="subtask-section-header">
              <h3>
                <ClipboardList size={18} strokeWidth={2.2} /> Subtasks
                <span className="subtask-count">{subtasks.length}</span>
              </h3>
              {canCreateSubtask && (
                <button
                  className="btn-add-subtask"
                  onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                >
                  {showSubtaskForm ? (
                    <>
                      <X size={16} strokeWidth={2.2} /> Cancel
                    </>
                  ) : (
                    <>
                      <Plus size={16} strokeWidth={2.2} /> Add Subtask
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {subtasks.length > 0 && (
              <div className="subtask-progress">
                <div className="subtask-progress-bar">
                  <div
                    className="subtask-progress-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="subtask-progress-label">
                  <span>{completedCount} of {subtasks.length} completed</span>
                  <span className="subtask-progress-pct">{progressPct}%</span>
                </div>
              </div>
            )}

            {/* Creation Form */}
            {showSubtaskForm && (
              <form className="subtask-form" onSubmit={onCreateSubtask}>
                <div className="subtask-form-title">
                  <Sparkles size={15} strokeWidth={2.2} /> New Subtask
                </div>
                <div className="form-group">
                  <label>Title <span className="required">*</span></label>
                  <input
                    type="text"
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={subtaskDesc}
                    onChange={(e) => setSubtaskDesc(e.target.value)}
                    placeholder="Add details (optional)"
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Assign to <span className="required">*</span></label>
                  <select
                    value={subtaskAssignee}
                    onChange={(e) => setSubtaskAssignee(e.target.value)}
                    required
                  >
                    <option value="">Select developer</option>
                    {developers.map((dev) => (
                      <option key={dev._id} value={dev._id}>
                        {dev.name} ({dev.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="subtask-form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setShowSubtaskForm(false);
                      setSubtaskTitle("");
                      setSubtaskDesc("");
                      setSubtaskAssignee("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={creatingSubtask || !subtaskTitle.trim() || !subtaskAssignee}
                  >
                    {creatingSubtask ? "Creating..." : "Create Subtask"}
                  </button>
                </div>
              </form>
            )}

            {/* Subtask List */}
            <div className="subtask-list">
              {subtasks.length === 0 && !showSubtaskForm && (
                <div className="subtask-empty">
                  <div className="subtask-empty-icon">
                    <Inbox size={26} strokeWidth={1.9} />
                  </div>
                  <p>No subtasks yet</p>
                  {canCreateSubtask && (
                    <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                      Click "Add Subtask" to break this bug into smaller tasks
                    </p>
                  )}
                </div>
              )}
              {subtasks.map((subtask) => {
                const canManage = canManageSubtask(subtask);
                const nextStatus = NEXT_SUBTASK_STATUS[subtask.status];
                return (
                  <div key={subtask._id} className="subtask-item">
                    {/* Status circle button */}
                    <button
                      className={`subtask-status-btn ${getStatusBtnClass(subtask.status)}`}
                      onClick={() => canManage && nextStatus && onAdvanceSubtaskStatus(subtask)}
                      disabled={!canManage || !nextStatus}
                      title={
                        nextStatus
                          ? `Mark as ${nextStatus}`
                          : "Completed"
                      }
                    >
                      {subtask.status === "Completed" ? (
                        <CheckCircle2 size={16} strokeWidth={2.2} />
                      ) : subtask.status === "In Progress" ? (
                        <Circle size={12} strokeWidth={2.4} />
                      ) : null}
                    </button>

                    {/* Body */}
                    <div className="subtask-body">
                      <div className={`subtask-title ${subtask.status === "Completed" ? "subtask-title--completed" : ""}`}>
                        {subtask.title}
                      </div>
                      {subtask.description && (
                        <div className="subtask-desc">{subtask.description}</div>
                      )}
                      <div className="subtask-meta">
                        <span className={`subtask-badge ${getSubtaskBadgeClass(subtask.status)}`}>
                          {subtask.status}
                        </span>
                        {subtask.assignedTo && (
                          <span className="subtask-assignee">
                            <span className="subtask-assignee-avatar">
                              {(subtask.assignedTo.name || "?")[0].toUpperCase()}
                            </span>
                            {subtask.assignedTo.name || subtask.assignedTo.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {canManage && (
                      <div className="subtask-actions">
                        <button
                          className="subtask-action-btn subtask-action-btn--danger"
                          onClick={() => onDeleteSubtask(subtask._id)}
                          title="Delete subtask"
                        >
                          <Trash2 size={15} strokeWidth={2.2} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Timeline */}
          {bug.comments && bug.comments.length > 0 && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>
                <Clock3 size={17} strokeWidth={2.1} /> Activity
              </h3>
              <div className="timeline">
                {bug.comments.map((c, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-avatar">
                      {c.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <strong>{c.user?.name || "User"}</strong>
                        <span className="muted-text" style={{ fontSize: "0.8rem" }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.9rem" }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Comment */}
          <div className="card">
            <h3 style={{ marginBottom: "0.75rem" }}>
              <MessageSquare size={17} strokeWidth={2.1} /> Add Comment
            </h3>
            <form onSubmit={onAddComment}>
              <div className="form-group">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comment..."
                  rows={3}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setComment("")}
                  disabled={!comment.trim()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!comment.trim()}
                >
                  Add Comment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Sidebar actions */}
        <div>
          {/* Status Update */}
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Update Status</h3>
            <div className="form-group">
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary btn-block" onClick={onStatusUpdate} disabled={saving}>
              {saving ? "Saving..." : "Save Status"}
            </button>
          </div>

          {/* Assign Developer */}
          {canAssign && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h3 style={{ marginBottom: "0.75rem" }}>Assign Developer</h3>
              <div className="form-group">
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                  <option value="">Select developer</option>
                  {developers.map((dev) => (
                    <option key={dev._id} value={dev._id}>
                      {dev.name} ({dev.email})
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary btn-block" onClick={onAssign} disabled={assigning}>
                {assigning ? "Assigning..." : "Assign"}
              </button>
            </div>
          )}

          {/* Bug Metadata */}
          <div className="card">
            <h3 style={{ marginBottom: "0.75rem" }}>Details</h3>
            <div className="detail-list">
              <div>
                <p className="muted-text" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                  Assigned To
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <div className="avatar-circle">
                    {bug.assignedTo?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span>{bug.assignedTo?.name || "Unassigned"}</span>
                </div>
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <p className="muted-text" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                  Reporter
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <div className="avatar-circle avatar-circle--purple">
                    {bug.reportedBy?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span>{bug.reportedBy?.name || "Unknown"}</span>
                </div>
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <p className="muted-text" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Created</p>
                <p style={{ marginTop: "0.25rem" }}>{new Date(bug.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {message && <p className="success-text" style={{ marginTop: "1rem" }}>{message}</p>}
          {error && <p className="error-text" style={{ marginTop: "1rem" }}>{error}</p>}
        </div>
      </div>
    </section>
  );
}

export default BugDetails;
