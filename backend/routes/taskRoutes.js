const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const multer = require("multer");
const path = require("path");


// ------------------ STORAGE FOR TEACHER FILE UPLOAD ------------------
const teacherStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/assignments");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadTeacher = multer({ storage: teacherStorage });

// ------------------ STORAGE FOR STUDENT SUBMISSIONS ------------------
const studentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/submissions");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadStudent = multer({ storage: studentStorage });

// ------------------ CREATE ASSIGNMENT (TEACHER) ------------------
router.post("/create", uploadTeacher.single("file"), async (req, res) => {
  try {
    const { title, description, teacherId, deadline } = req.body;

    const fileUrl = req.file
      ? `http://localhost:3000/uploads/assignments/${req.file.filename}`
      : null;

    const newTask = new Task({
      title,
      description,
      deadline,
      fileUrl,
      createdBy: teacherId
    });

    await newTask.save();

    // 🔔 Notify ALL students about new assignment


    res.json({ message: "Assignment created", task: newTask });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});



// ------------------ STUDENT SUBMISSION ------------------
router.post("/submit", uploadStudent.single("file"), async (req, res) => {
  try {
    const { taskId, studentId } = req.body;

    const fileUrl = req.file
      ? `http://localhost:3000/uploads/submissions/${req.file.filename}`
      : null;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.submissions.push({
      studentId,
      fileUrl,
      submittedAt: new Date()
    });

    await task.save();


    res.json({ message: "Submission uploaded", task });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Submission failed" });
  }


});

// ------------------ GET ALL TASKS ------------------
router.get("/all", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).populate("submissions.studentId", "username email");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ------------------ GET SINGLE TASK ------------------
router.get("/single/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

module.exports = router;

router.put("/submission/update", async (req, res) => {
  try {
    const { taskId, submissionIndex, status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.submissions[submissionIndex].status = status;

    await task.save();

    res.json({ message: "Submission updated", task });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not update submission" });
  }
});
// ------------------ GET ALL SUBMISSIONS FOR A STUDENT ------------------
router.get("/student/:studentId", async (req, res) => {
  try {
    const tasks = await Task.find({ "submissions.studentId": req.params.studentId })
      .populate("submissions.studentId", "username email");

    res.json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch student submissions" });
  }
});