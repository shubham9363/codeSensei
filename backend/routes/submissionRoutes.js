const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// POST /api/submissions — create
router.post("/", auth, async (req, res) => {
  try {
    const { problem_id, code, status, type, passed } = req.body;
    const submission = await Submission.create({
      user_id: req.userId,
      problem_id, code,
      status: status || "submitted",
      type: type || "problem",
      passed: passed || false
    });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/submissions — list all (for mentor/admin)
router.get("/", auth, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      order: [["submitted_at", "DESC"]],
      limit: 50
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/submissions/my — current user's submissions
router.get("/my", auth, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { user_id: req.userId },
      order: [["submitted_at", "DESC"]]
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/submissions/:id/feedback — add feedback
router.put("/:id/feedback", auth, async (req, res) => {
  try {
    const sub = await Submission.findByPk(req.params.id);
    if (!sub) return res.status(404).json({ message: "Submission not found" });
    sub.feedback = req.body.feedback;
    sub.status = "reviewed";
    await sub.save();
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;