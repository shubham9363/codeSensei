const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const { generateOTP, sendOTP } = require("../utils/email");

// POST /api/auth/signup — creates unverified user, sends OTP email
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const userExists = await User.findOne({ where: { email } });
    if (userExists && userExists.verified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hashed = await bcrypt.hash(password, 10);

    if (userExists && !userExists.verified) {
      // Update existing unverified user
      userExists.name = name;
      userExists.password = hashed;
      userExists.role = role || "student";
      userExists.otp = otp;
      userExists.otp_expires = otpExpires;
      await userExists.save();
    } else {
      await User.create({
        name, email, password: hashed,
        role: role || "student",
        otp, otp_expires: otpExpires,
        verified: false
      });
    }

    // Send OTP email
    await sendOTP(email, otp);

    res.json({ message: "OTP sent to your email", email, requiresVerification: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp — verify email with OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verified) return res.status(400).json({ message: "Email already verified" });

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otp_expires && new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Mark verified, clear OTP
    user.verified = true;
    user.otp = null;
    user.otp_expires = null;
    await user.save();

    // Auto-login after verification
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const userData = user.toJSON();
    delete userData.password;
    delete userData.otp;
    delete userData.otp_expires;

    res.json({ message: "Email verified!", token, user: userData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/resend-otp — resend OTP to email
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verified) return res.status(400).json({ message: "Already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otp_expires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTP(email, otp);
    res.json({ message: "New OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login — only verified users can login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.verified) {
      // Resend OTP for unverified users
      const otp = generateOTP();
      user.otp = otp;
      user.otp_expires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOTP(email, otp);
      
      return res.status(403).json({
        message: "Email not verified. A new OTP has been sent.",
        requiresVerification: true,
        email
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    user.last_login = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const userData = user.toJSON();
    delete userData.password;
    delete userData.otp;
    delete userData.otp_expires;

    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me — get current user from token
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["password", "otp", "otp_expires"] }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;