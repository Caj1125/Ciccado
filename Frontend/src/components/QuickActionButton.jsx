import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateBugModal from "./CreateBugModal";
import { useAuth } from "../context/AuthContext";
import { canCreateBugs } from "../utils/permissions";
import { BarChart3, Bug, Plus, X } from "lucide-react";

const actions = [
  { icon: Bug, label: "New Bug", color: "fab-action-btn--blue", key: "bug" },
  { icon: BarChart3, label: "Reports", color: "fab-action-btn--green", key: "reports" },
];

function QuickActionButton() {
  const { user } = useAuth();
  const hasCreatePermission = canCreateBugs(user?.role);
  const [open, setOpen] = useState(false);
  const [createBugOpen, setCreateBugOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (key) => {
    setOpen(false);
    if (key === "bug" && hasCreatePermission) setCreateBugOpen(true);
    if (key === "reports") navigate("/reports");
  };

  const visibleActions = hasCreatePermission
    ? actions
    : actions.filter((action) => action.key !== "bug");

  return (
    <>
      <div className="fab-container">
        {open && (
          <div className="fab-actions">
            {visibleActions.map((action) => (
              <button
                key={action.key}
                className={`fab-action-btn ${action.color}`}
                onClick={() => handleAction(action.key)}
              >
                <action.icon size={16} strokeWidth={2.1} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          className={`fab-main ${open ? "fab-main--red" : "fab-main--blue"}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Quick actions"}
        >
          <span className={`fab-icon${open ? " fab-icon--rotated" : ""}`}>
            {open ? <X size={18} strokeWidth={2.4} /> : <Plus size={18} strokeWidth={2.4} />}
          </span>
        </button>
      </div>

      {hasCreatePermission && (
        <CreateBugModal open={createBugOpen} onOpenChange={setCreateBugOpen} />
      )}
    </>
  );
}

export default QuickActionButton;
