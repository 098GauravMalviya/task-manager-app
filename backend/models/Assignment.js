const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  fileUrl: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Assignment", AssignmentSchema);
