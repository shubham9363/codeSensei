require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const bugRoutes = require("./routes/bugRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(buildPath));
  
  // Safe wildcard fallback for Express 5 compatibility (avoids path-to-regexp PathError)
  app.use((req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("CodeSensei Backend API Running");
  });
}

// Connect DB & Start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 CodeSensei server running on port ${PORT}`);
  });
});