// Enhanced: fixed column order, added StatusBadge + PriorityBadge from Figma
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

function BugTable({ bugs }) {
  if (!bugs.length) {
    return <p className="page-feedback">No bugs found.</p>;
  }

  return (
    <div className="table-container card">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned</th>
            <th>Project</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((bug) => (
            <tr key={bug._id} className="table-row-hover">
              <td>
                <Link to={`/bugs/${bug._id}`} className="table-link">
                  {bug.title}
                </Link>
              </td>
              <td>
                <span className={`badge badge-${bug.severity?.toLowerCase()}`}>
                  {bug.severity}
                </span>
              </td>
              <td>
                <StatusBadge status={bug.status} />
              </td>
              <td>
                <PriorityBadge priority={bug.priority} />
              </td>
              <td>{bug.assignedTo?.name || "Unassigned"}</td>
              <td>{bug.project?.name || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BugTable;
