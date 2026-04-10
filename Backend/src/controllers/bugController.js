const Bug = require("../models/Bug");
const Comment = require("../models/Comment");
const Subtask = require("../models/Subtask");
const User = require("../models/User");
const { ROLES } = require("../utils/constants");
const {
  notifyBugAssigned,
  notifyStatusChange,
} = require("../services/notificationService");

// @desc    Create a new bug
// @route   POST /api/bugs
// @access  Private (Tester, Manager, Admin)
const createBug = async (req, res, next) => {
  try {
    const { title, description, severity, priority, project, attachments } =
      req.body;

    const bug = await Bug.create({
      title,
      description,
      severity,
      priority,
      project,
      reportedBy: req.user._id,
      attachments,
    });

    res.status(201).json(bug);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bugs (with optional query filters)
// @route   GET /api/bugs
// @access  Private
const getBugs = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.project) filters.project = req.query.project;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.severity) filters.severity = req.query.severity;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;

    // Developers can only view bugs assigned to themselves.
    if (req.user.role === ROLES.DEVELOPER) {
      filters.assignedTo = req.user._id;
    }

    const bugs = await Bug.find(filters)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json(bugs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bug by id
// @route   GET /api/bugs/:id
// @access  Private
const getBugById = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .populate({
        path: "comments",
        populate: { path: "user", select: "name email" },
      });

    if (!bug) {
      res.status(404);
      throw new Error("Bug not found");
    }

    if (
      req.user.role === ROLES.DEVELOPER &&
      (!bug.assignedTo || bug.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      res.status(403);
      throw new Error("Not authorized to view this bug");
    }

    const subtasks = await Subtask.find({ bugId: bug._id })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    const bugPayload = bug.toObject();
    bugPayload.subtasks = subtasks;

    res.json(bugPayload);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a bug
// @route   PUT /api/bugs/:id
// @access  Private
const updateBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      res.status(404);
      throw new Error("Bug not found");
    }

    const updates = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updates, "status")) {
      updates.resolvedAt = updates.status === "Closed" ? new Date() : null;
    }

    const updatedBug = await Bug.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updatedBug);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a bug
// @route   DELETE /api/bugs/:id
// @access  Private (Admin)
const deleteBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      res.status(404);
      throw new Error("Bug not found");
    }

    // Also remove associated comments
    await Comment.deleteMany({ bug: bug._id });
    await Subtask.deleteMany({ bugId: bug._id });
    await bug.deleteOne();

    res.json({ message: "Bug removed" });
  } catch (error) {
    next(error);
  }
};

// @desc    Change bug status
// @route   PATCH /api/bugs/:id/status
// @access  Private
const changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      res.status(404);
      throw new Error("Bug not found");
    }

    const oldStatus = bug.status;
    bug.status = status;
    bug.resolvedAt = status === "Closed" ? new Date() : null;
    await bug.save();

    await notifyStatusChange({ bug, oldStatus, newStatus: status });

    res.json(bug);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign bug to a developer
// @route   PATCH /api/bugs/:id/assign
// @access  Private (Manager)
const assignBug = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      res.status(400);
      throw new Error("assignedTo is required");
    }

    const assignee = await User.findById(assignedTo).select("role");

    // ✅ FIX: use req.user instead of undefined assignedby
    const assigner = req.user;

    if (!assigner) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    // ✅ FIX: correct error + status
    if (assigner.role !== ROLES.MANAGER) {
      res.status(403);
      throw new Error("Only managers can assign bugs");
    }

    if (!assignee) {
      res.status(404);
      throw new Error("Assignee user not found");
    }

    if (assignee.role !== ROLES.DEVELOPER) {
      res.status(400);
      throw new Error("Bugs can only be assigned to developers");
    }

    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      res.status(404);
      throw new Error("Bug not found");
    }

    // ✅ FIX: check already assigned
    if (bug.assignedTo) {
      res.status(400);
      throw new Error("Bug already assigned");
    }

    bug.assignedTo = assignedTo;

    // ✅ FIX: store manager id
    bug.assignedBy = assigner._id;

    if (bug.status === "New") {
      bug.status = "Assigned";
    }

    await bug.save();

    await notifyBugAssigned({ bug, assignedTo });

    const populatedBug = await Bug.findById(bug._id)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name");

    res.json(populatedBug);
  } catch (error) {
    next(error);
  }
};
// @desc    Add a comment to a bug
// @route   POST /api/bugs/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      res.status(404);
      throw new Error("Bug not found");
    }

    const comment = await Comment.create({
      bug: bug._id,
      user: req.user._id,
      text: req.body.text,
    });

    bug.comments.push(comment._id);
    await bug.save();

    const populated = await comment.populate("user", "name email");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
  changeStatus,
  assignBug,
  addComment,
};
