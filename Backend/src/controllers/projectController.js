const Project = require("../models/Project");

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin, Manager)
const createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;

    const project = await Project.create({
      name,
      description,
      members,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate("members", "name email role")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by id
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email role")
      .populate("createdBy", "name email");

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin, Manager)
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("members", "name email role")
      .populate("createdBy", "name email");

    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
};
