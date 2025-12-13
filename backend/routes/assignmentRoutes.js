const express = require("express");
const Assignment = require("../models/Assignment");

const router = express.Router();

// -------------------------
// Create new assignment (Teacher)
// -------------------------
router.post("/create", async (req, res) => {
  try {
    const { title, description, dueDate, createdBy } = req.body;

    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      createdBy,
    });

    await newAssignment.save();

    res.json({ message: "Assignment created successfully", assignment: newAssignment });
  } catch (error) {
    res.status(500).json({ message: "Error creating assignment" });
  }
});

// -------------------------
// Get all assignments
// -------------------------
router.get("/all", async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments" });
  }
});

// -------------------------
// Submit assignment (Student)
// -------------------------
router.post("/submit", async (req, res) => {
  try {
    const { assignmentId, studentId, fileUrl } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    assignment.submissions.push({
      studentId,
      fileUrl,
      submittedAt: new Date(),
    });

    await assignment.save();

    res.json({ message: "Submission successful" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting assignment" });
  }
});

module.exports = router;
