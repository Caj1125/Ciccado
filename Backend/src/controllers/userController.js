const User = require("../models/User");

// @desc    Get all developers (admin/manager)
// @route   GET /api/users/developers
// @access  Private (Admin, Manager)
const getDevelopers = async (req, res, next) => {
  try {
    const developers = await User.find({ role: "developer" })
      .select("name email role")
      .sort({ name: 1 });
    res.json(developers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by id
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.role = req.body.role || user.role;
    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDevelopers,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
