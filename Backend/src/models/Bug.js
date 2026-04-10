const mongoose = require("mongoose");
const { BUG_SEVERITY, BUG_PRIORITY, BUG_STATUS } = require("../utils/constants");

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Bug title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    severity: {
      type: String,
      enum: BUG_SEVERITY,
      default: "Medium",
    },
    priority: {
      type: String,
      enum: BUG_PRIORITY,
      default: "Medium",
    },
    status: {
      type: String,
      enum: BUG_STATUS,
      default: "New",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedBy:
    {
     type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    attachments: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bugSchema.virtual("subtasks", {
  ref: "Subtask",
  localField: "_id",
  foreignField: "bugId",
});

module.exports = mongoose.model("Bug", bugSchema);
