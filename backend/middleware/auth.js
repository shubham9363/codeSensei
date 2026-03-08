const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token provided" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token expired or invalid" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

const mentorOrAdmin = (req, res, next) => {
  if (req.userRole !== "mentor" && req.userRole !== "admin") {
    return res.status(403).json({ message: "Mentor or Admin access required" });
  }
  next();
};

module.exports = { auth, adminOnly, mentorOrAdmin };
