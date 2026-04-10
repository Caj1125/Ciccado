const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  DEVELOPER: "developer",
  TESTER: "tester",
};

const BUG_SEVERITY = ["Low", "Medium", "High", "Critical"];

const BUG_PRIORITY = ["Low", "Medium", "High", "Critical"];

const BUG_STATUS = [
  "New",
  "Assigned",
  "In Progress",
  "Fixed",
  "Testing",
  "Closed",
  "Reopened",
];

const SUBTASK_STATUS = ["Pending", "In Progress", "Completed"];

module.exports = {
  ROLES,
  BUG_SEVERITY,
  BUG_PRIORITY,
  BUG_STATUS,
  SUBTASK_STATUS,
};
