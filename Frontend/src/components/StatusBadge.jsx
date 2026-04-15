const statusConfig = {
  // Figma status values
  open: { label: "Open", className: "badge-status-new" },
  in_progress: { label: "In Progress", className: "badge-status-in-progress" },
  fixed: { label: "Fixed", className: "badge-status-fixed" },
  closed: { label: "Closed", className: "badge-status-closed" },

  Open: { label: "Open", className: "badge-status-new" },
  New: { label: "New", className: "badge-status-new" },
  Assigned: { label: "Assigned", className: "badge-status-assigned" },
  "In Progress": { label: "In Progress", className: "badge-status-in-progress" },
  Fixed: { label: "Fixed", className: "badge-status-fixed" },
  Testing: { label: "Testing", className: "badge-status-testing" },
  Closed: { label: "Closed", className: "badge-status-closed" },
  Reopened: { label: "Reopened", className: "badge-status-reopened" },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status || "Unknown",
    className: "badge-status",
  };

  return (
    <span className={`badge badge-status-dot ${config.className}`}>
      <span className="badge-dot" />
      {config.label}
    </span>
  );
}

export default StatusBadge;
