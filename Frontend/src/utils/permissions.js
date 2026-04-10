const BUG_CREATOR_ROLES = ["admin", "manager", "developer", "tester"];

export function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

export function canCreateBugs(role) {
  return BUG_CREATOR_ROLES.includes(normalizeRole(role));
}
