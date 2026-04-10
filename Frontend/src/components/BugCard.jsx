import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

function BugCard({ bug }) {
  return (
    <Link to={`/bugs/${bug._id}`} className="bug-card-link">
      <article className="card bug-card">
        <h3>{bug.title}</h3>
        <div className="meta-row" style={{ marginTop: "0.5rem" }}>
          <PriorityBadge priority={bug.priority} />
          <StatusBadge status={bug.status} />
        </div>
        <p className="muted-text" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
          {bug.project?.name || "No project"}
        </p>
      </article>
    </Link>
  );
}

export default BugCard;
