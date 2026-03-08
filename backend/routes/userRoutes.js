const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// GET /api/users/leaderboard — top users by XP
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["xp", "DESC"]],
      limit: 10
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users — list all (admin)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/progress — update current user's progress
router.put("/progress", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { xp, level, streak, solved, bugs_solved, badges } = req.body;
    if (xp !== undefined) user.xp = xp;
    if (level !== undefined) user.level = level;
    if (streak !== undefined) user.streak = streak;
    if (solved !== undefined) user.solved = solved;
    if (bugs_solved !== undefined) user.bugs_solved = bugs_solved;
    if (badges !== undefined) user.badges = badges;
    await user.save();
    const userData = user.toJSON();
    delete userData.password;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile — update personal details
router.put("/profile", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { name, bio, institution, github, linkedin } = req.body;
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (institution !== undefined) user.institution = institution;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    await user.save();
    const userData = user.toJSON();
    delete userData.password;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id/reset — reset user progress (admin)
router.put("/:id/reset", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.xp = 0; user.level = 1; user.streak = 0;
    user.solved = []; user.bugs_solved = []; user.badges = [];
    await user.save();
    const userData = user.toJSON();
    delete userData.password;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id — delete user (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.destroy();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;