const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
} = require("../controllers/projectController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const { ROLES } = require("../utils/constants");

// All project routes require authentication
router.use(protect);

router
  .route("/")
  .post(authorize(ROLES.ADMIN, ROLES.MANAGER), createProject)
  .get(getProjects);

router
  .route("/:id")
  .get(getProjectById)
  .put(authorize(ROLES.ADMIN, ROLES.MANAGER), updateProject);

module.exports = router;
