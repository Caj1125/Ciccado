

const notifyBugAssigned = async ({ bug, assignedTo }) => {
  console.log(
    `[Notification] Bug "${bug.title}" assigned to user ${assignedTo}`
  );
};

const notifyStatusChange = async ({ bug, oldStatus, newStatus }) => {
  console.log(
    `[Notification] Bug "${bug.title}" status changed from ${oldStatus} to ${newStatus}`
  );
};

module.exports = {
  notifyBugAssigned,
  notifyStatusChange,
};
