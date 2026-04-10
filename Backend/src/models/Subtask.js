const mongoose = require("mongoose");
const { SUBTASK_STATUS } = require("../utils/constants");

const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Subtask title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: SUBTASK_STATUS,
      default: "Pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "assignedTo is required"],
    },
    bugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bug",
      required: [true, "bugId is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subtask", subtaskSchema);
