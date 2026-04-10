const mongoose = require("mongoose");
const Subtask = require("../models/Subtask");
const Bug = require("../models/Bug");
const User = require("../models/User");
const { ROLES } = require("../utils/constants");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const ensureBugExists = async (bugId, res) => {
  const bug = await Bug.findById(bugId).select("assignedTo status");
  if (!bug) {
    res.status(404);
    throw new Error("Bug not found");
  }
  return bug;
};

const ensureDeveloperAssignee = async (assignedTo, res) => {
  const assignee = await User.findById(assignedTo).select("role");
  if (!assignee) {
    res.status(404);
    throw new Error("Assignee user not found");
  }
  if (assignee.role !== ROLES.DEVELOPER) {
    res.status(400);
    throw new Error("Subtasks can only be assigned to developers");
  }
  return assignee;
};

const canManageSubtask = (user, subtask) => {
  if (user.role === ROLES.MANAGER || user.role === ROLES.ADMIN) {
    return true;
  }
  return subtask.assignedTo.toString() === user._id.toString();
};

const syncBugStatusFromSubtasks = async (bugId) => {
  const subtasks = await Subtask.find({ bugId }).select("status");

  if (!subtasks.length) {
    return;
  }

  const allCompleted = subtasks.every((subtask) => subtask.status === "Completed");
  const allPending = subtasks.every((subtask) => subtask.status === "Pending");
  const anyInProgress = subtasks.some((subtask) => subtask.status === "In Progress");

  let nextBugStatus = null;
  if (allCompleted) {
    nextBugStatus = "Fixed";
  } else if (allPending) {
    nextBugStatus = "Assigned";
  } else if (anyInProgress || !allCompleted) {
    nextBugStatus = "In Progress";
  }

  if (!nextBugStatus) {
    return;
  }

  const bug = await Bug.findById(bugId).select("status");
  if (!bug) {
    return;
  }

  if (bug.status !== nextBugStatus) {
    bug.status = nextBugStatus;
    await bug.save();
  }
};

// @desc    Create a subtask
// @route   POST /api/subtasks
// @access  Private (Manager or user assigned to bug)
const createSubtask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, bugId } = req.body;

    if (!title || !assignedTo || !bugId) {
      res.status(400);
      throw new Error("title, assignedTo and bugId are required");
    }

    if (!isValidObjectId(bugId) || !isValidObjectId(assignedTo)) {
      res.status(400);
      throw new Error("Invalid bugId or assignedTo");
    }

    const bug = await ensureBugExists(bugId, res);
    await ensureDeveloperAssignee(assignedTo, res);

    const isManager = req.user.role === ROLES.MANAGER || req.user.role === ROLES.ADMIN;
    const isAssignedToBug =
      bug.assignedTo && bug.assignedTo.toString() === req.user._id.toString();

    if (!isManager && !isAssignedToBug) {
      res.status(403);
      throw new Error("Not authorized to create a subtask for this bug");
    }

    if (!isManager && assignedTo.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only managers can assign subtasks to other users");
    }

    const subtask = await Subtask.create({
      title,
      description,
      assignedTo,
      bugId,
    });

    await syncBugStatusFromSubtasks(bugId);

    const populatedSubtask = await Subtask.findById(subtask._id)
      .populate("assignedTo", "name email")
      .populate("bugId", "title status");

    res.status(201).json(populatedSubtask);
  } catch (error) {
    next(error);
  }
};

// @desc    Get subtasks by bug id
// @route   GET /api/subtasks/:bugId
// @access  Private
const getSubtasksByBugId = async (req, res, next) => {
  try {
    const { bugId } = req.params;

    if (!isValidObjectId(bugId)) {
      res.status(400);
      throw new Error("Invalid bugId");
    }

    const bug = await Bug.findById(bugId).select("assignedTo");
    if (!bug) {
      res.status(404);
      throw new Error("Bug not found");
    }

    if (
      req.user.role === ROLES.DEVELOPER &&
      (!bug.assignedTo || bug.assignedTo.toString() !== req.user._id.toString())
    ) {
      res.status(403);
      throw new Error("Not authorized to view subtasks for this bug");
    }

    const subtasks = await Subtask.find({ bugId })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(subtasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subtask
// @route   PUT /api/subtasks/:id
// @access  Private (Manager/Admin or assigned subtask user)
const updateSubtask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid subtask id");
    }

    const subtask = await Subtask.findById(id);
    if (!subtask) {
      res.status(404);
      throw new Error("Subtask not found");
    }

    if (!canManageSubtask(req.user, subtask)) {
      res.status(403);
      throw new Error("Not authorized to update this subtask");
    }

    const isManager = req.user.role === ROLES.MANAGER || req.user.role === ROLES.ADMIN;

    if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
      const transitionOrder = ["Pending", "In Progress", "Completed"];
      const currentIndex = transitionOrder.indexOf(subtask.status);
      const requestedIndex = transitionOrder.indexOf(req.body.status);

      if (requestedIndex === -1) {
        res.status(400);
        throw new Error("Invalid status");
      }

      if (requestedIndex < currentIndex || requestedIndex > currentIndex + 1) {
        res.status(400);
        throw new Error(
          `Invalid status transition from ${subtask.status} to ${req.body.status}`
        );
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "assignedTo")) {
      if (!isManager) {
        res.status(403);
        throw new Error("Only managers can reassign subtasks");
      }

      if (!isValidObjectId(req.body.assignedTo)) {
        res.status(400);
        throw new Error("Invalid assignedTo");
      }

      await ensureDeveloperAssignee(req.body.assignedTo, res);
    }

    const updates = { ...req.body };
    delete updates.bugId;

    const updatedSubtask = await Subtask.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email");

    await syncBugStatusFromSubtasks(subtask.bugId);

    res.json(updatedSubtask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update only subtask status
// @route   PATCH /api/subtasks/:id/status
// @access  Private (Manager/Admin or assigned subtask user)
const updateSubtaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid subtask id");
    }

    if (!status) {
      res.status(400);
      throw new Error("status is required");
    }

    const subtask = await Subtask.findById(id);
    if (!subtask) {
      res.status(404);
      throw new Error("Subtask not found");
    }

    if (!canManageSubtask(req.user, subtask)) {
      res.status(403);
      throw new Error("Not authorized to update this subtask status");
    }

    const transitionOrder = ["Pending", "In Progress", "Completed"];
    const currentIndex = transitionOrder.indexOf(subtask.status);
    const requestedIndex = transitionOrder.indexOf(status);

    if (requestedIndex === -1) {
      res.status(400);
      throw new Error("Invalid status");
    }

    if (requestedIndex < currentIndex || requestedIndex > currentIndex + 1) {
      res.status(400);
      throw new Error(
        `Invalid status transition from ${subtask.status} to ${status}`
      );
    }

    subtask.status = status;
    await subtask.save();

    await syncBugStatusFromSubtasks(subtask.bugId);

    const populatedSubtask = await Subtask.findById(subtask._id).populate(
      "assignedTo",
      "name email"
    );

    res.json(populatedSubtask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subtask
// @route   DELETE /api/subtasks/:id
// @access  Private (Manager/Admin or assigned subtask user)
const deleteSubtask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid subtask id");
    }

    const subtask = await Subtask.findById(id);
    if (!subtask) {
      res.status(404);
      throw new Error("Subtask not found");
    }

    if (!canManageSubtask(req.user, subtask)) {
      res.status(403);
      throw new Error("Not authorized to delete this subtask");
    }

    const { bugId } = subtask;
    await subtask.deleteOne();

    await syncBugStatusFromSubtasks(bugId);

    res.json({ message: "Subtask removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubtask,
  getSubtasksByBugId,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask,
};
