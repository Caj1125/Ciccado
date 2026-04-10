const express = require("express");
const router = express.Router();

const {
  createSubtask,
  getSubtasksByBugId,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask,
} = require("../controllers/subtaskController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.post("/", createSubtask);
router.get("/:bugId", getSubtasksByBugId);
router.put("/:id", updateSubtask);
router.patch("/:id/status", updateSubtaskStatus);
router.delete("/:id", deleteSubtask);

module.exports = router;
