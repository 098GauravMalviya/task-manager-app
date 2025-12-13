const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: String, 
  fileUrl: String,
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // teacher
  submissions: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      fileUrl: String,
      submittedAt: Date,
      grade: String,
      status: { type: String, default: "pending" } 
    },
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", taskSchema);
