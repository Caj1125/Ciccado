const statusConfig = {
  // Figma status values
  open: { label: "Open", className: "badge-status-open" },
  in_progress: { label: "In Progress", className: "badge-status-progress" },
  fixed: { label: "Fixed", className: "badge-status-fixed" },
  closed: { label: "Closed", className: "badge-status-closed" },

  New: { label: "New", className: "badge-status-open" },
  Assigned: { label: "Assigned", className: "badge-status-progress" },
  "In Progress": { label: "In Progress", className: "badge-status-progress" },
  Fixed: { label: "Fixed", className: "badge-status-fixed" },
  Testing: { label: "Testing", className: "badge-status-progress" },
  Closed: { label: "Closed", className: "badge-status-closed" },
  Reopened: { label: "Reopened", className: "badge-status-open" },
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
