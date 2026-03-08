const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const { auth } = require("../middleware/auth");

// GET /api/problems — list all
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.findAll({ order: [["id", "ASC"]] });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/problems/:id — single problem
router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/problems — create (mentor/admin)
router.post("/", auth, async (req, res) => {
  try {
    const { title, difficulty, category, points, description, examples, constraints, starter_code, solution, logic_keywords, time_complexity, space_complexity } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }
    const problem = await Problem.create({
      title, difficulty: difficulty || "Medium", category: category || "General",
      points: points || 20, description, examples: examples || [],
      constraints: constraints || [], starter_code: starter_code || "def solution():\n    pass",
      solution: solution || "", logic_keywords: logic_keywords || [],
      time_complexity: time_complexity || "O(?)", space_complexity: space_complexity || "O(?)"
    });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/problems/:id — delete (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    await problem.destroy();
    res.json({ message: "Problem deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;