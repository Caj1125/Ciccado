const express = require("express");
const router = express.Router();
const {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
  changeStatus,
  assignBug,
  addComment,
} = require("../controllers/bugController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const { ROLES } = require("../utils/constants");

// All bug routes require authentication
router.use(protect);

router
  .route("/")
  .post(createBug)
  .get(getBugs);

router
  .route("/:id")
  .get(getBugById)
  .put(updateBug)
  .delete(authorize(ROLES.ADMIN), deleteBug);

router.patch("/:id/status", changeStatus);
router.patch("/:id/assign", authorize(ROLES.MANAGER, ROLES.ADMIN), assignBug);
router.post("/:id/comments", addComment);

module.exports = router;
