const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();

// Student uploads submission
router.post("/upload", async (req, res) => {
    try {
        const { assignmentId, studentId, fileUrl } = req.body;

        const submission = new Submission({
            assignmentId,
            studentId,
            fileUrl
        });

        await submission.save();

        res.json({ message: "Submission uploaded successfully", submission });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error });
    }
});

// Teacher grades submission
router.post("/grade", async (req, res) => {
    try {
        const { submissionId, grade, feedback } = req.body;

        const submission = await Submission.findById(submissionId);
        if (!submission) return res.status(404).json({ message: "Submission not found" });

        submission.grade = grade;
        submission.feedback = feedback;

        await submission.save();

        res.json({ message: "Submission graded", submission });

    } catch (error) {
        res.status(500).json({ message: "Error grading submission", error });
    }
});

// Show submissions for teacher
router.get("/all/:assignmentId", async (req, res) => {
    try {
        const submissions = await Submission.find({
            assignmentId: req.params.assignmentId
        }).populate("studentId", "username email");

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching submissions" });
    }
});

module.exports = router;
