 import { useState, useEffect } from "react";
import { getDevelopersRequest } from "../api/api";
import { Bug, CheckCircle2, Mail } from "lucide-react";

const AVATAR_COLORS = [
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#fce7f3", text: "#be185d" },
  { bg: "#fef3c7", text: "#b45309" },
  { bg: "#fee2e2", text: "#b91c1c" },
];

function getAvatarColors(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDevelopersRequest()
      .then(setMembers)
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load team")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-feedback">Loading team...</div>;
  if (error) return <div className="page-feedback error-text">{error}</div>;

  return (
    <section>
      <div className="page-header">
        <h1>Team</h1>
        <p className="muted-text" style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Manage your team members and their bug assignments
        </p>
      </div>

      {members.length === 0 ? (
        <div className="page-feedback">
          No developers found. Register some developer accounts first.
        </div>
      ) : (
        <div className="cards-grid">
          {members.map((member, index) => {
            const colors = getAvatarColors(index);
            return (
              <article className="card team-card" key={member._id}>
                <div className="team-card-inner">
                  <div
                    className="team-avatar"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {getInitials(member.name)}
                  </div>

                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-role muted-text">{member.role}</p>

                  <div className="team-email muted-text">
                    <Mail size={15} strokeWidth={2} />
                    {member.email}
                  </div>

                  <div className="team-stats">
                    <div className="team-stat">
                      <span className="team-stat-icon" style={{ color: "#f97316" }}>
                        <Bug size={15} strokeWidth={2.1} />
                      </span>
                      <span className="team-stat-label">Developer</span>
                    </div>
                    <div className="team-stat">
                      <span className="team-stat-icon" style={{ color: "#22c55e" }}>
                        <CheckCircle2 size={15} strokeWidth={2.1} />
                      </span>
                      <span className="team-stat-label">Active</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Team;
