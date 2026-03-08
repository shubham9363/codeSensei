require("dotenv").config()
const express = require("express")
const cors = require("cors")

require("dotenv").config()
require("./models/User");
require("./models/Problem");
require("./models/BugProblem");
require("./models/Submission");
require("./models/SolvedProblem");

const { connectDB } = require("./config/db")

const authRoutes = require("./routes/authRoutes")
const problemRoutes = require("./routes/problemRoutes")
const bugRoutes = require("./routes/bugRoutes")
const submissionRoutes = require("./routes/submissionRoutes")
const userRoutes = require("./routes/userRoutes")

const app = express()

// ✅ Middleware FIRST
app.use(cors())
app.use(express.json())

// ✅ Routes AFTER middleware
app.use("/api/auth", authRoutes)
app.use("/api/problems", problemRoutes)
app.use("/api/bugs", bugRoutes)
app.use("/api/submissions", submissionRoutes)
app.use("/api/users", userRoutes)

connectDB()

const path = require("path");

// Serve React build in production
if (process.env.NODE_ENV === "production" || process.env.RENDER) {
  const buildPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(buildPath));
  
  // App.use works as a fallback and avoids Express 5 wildcard regex errors
  app.use((req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  // Fallback for dev mode
  app.use((req, res) => {
    res.send("CodeSensei Backend API Running (Dev Mode)");
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});