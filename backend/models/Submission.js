const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fileUrl: String,
    submittedAt: { type: Date, default: Date.now },
    grade: { type: String, default: null },
    feedback: { type: String, default: null }
});

module.exports = mongoose.model("Submission", submissionSchema);
