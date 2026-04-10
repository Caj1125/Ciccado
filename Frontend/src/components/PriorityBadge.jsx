import { Circle } from "lucide-react";

const priorityConfig = {
  critical: { label: "Critical", className: "badge-critical" },
  high: { label: "High", className: "badge-high" },
  medium: { label: "Medium", className: "badge-medium" },
  low: { label: "Low", className: "badge-low" },

  Critical: { label: "Critical", className: "badge-critical" },
  High: { label: "High", className: "badge-high" },
  Medium: { label: "Medium", className: "badge-medium" },
  Low: { label: "Low", className: "badge-low" },
};

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || {
    label: priority || "Unknown",
    className: "badge-medium",
  };

  return (
    <span className={`badge ${config.className}`}>
      <Circle size={11} strokeWidth={2.5} className="priority-badge-icon" /> {config.label}
    </span>
  );
}

export default PriorityBadge;
