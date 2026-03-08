const express = require("express");
const router = express.Router();
const BugProblem = require("../models/BugProblem");
const { auth } = require("../middleware/auth");

// GET /api/bugs — list all
router.get("/", async (req, res) => {
  try {
    const bugs = await BugProblem.findAll({ order: [["id", "ASC"]] });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bugs/:id
router.get("/:id", async (req, res) => {
  try {
    const bug = await BugProblem.findByPk(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bugs — create
router.post("/", auth, async (req, res) => {
  try {
    const { title, difficulty, points, description, buggy_code, bug_lines, hint, fix_keyword, expected_output } = req.body;
    if (!title || !buggy_code) {
      return res.status(400).json({ message: "Title and buggy code required" });
    }
    const bug = await BugProblem.create({
      title, difficulty: difficulty || "Easy", points: points || 20,
      description: description || "Find and fix the bug.",
      buggy_code, bug_lines: bug_lines || [1],
      hint: hint || "Look carefully at the logic.",
      fix_keyword: fix_keyword || "", expected_output: expected_output || ""
    });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/bugs/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const bug = await BugProblem.findByPk(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    await bug.destroy();
    res.json({ message: "Bug challenge deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;