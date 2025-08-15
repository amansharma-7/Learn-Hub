const jwt = require("jsonwebtoken");
require("dotenv").config();

// Authenticate user using JWT
exports.auth = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.body?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token not provided",
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying token",
    });
  }
};

// Role-based access middleware generator
const authorizeRole = (role, roleName) => (req, res, next) => {
  try {
    if (req.user.accountType !== role) {
      return res.status(403).json({
        success: false,
        message: `This route is protected for ${roleName}s only`,
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `${roleName} role is not matching`,
    });
  }
};

// Specific role checks
exports.isStudent = authorizeRole("Student", "Student");
exports.isInstructor = authorizeRole("Instructor", "Instructor");
exports.isAdmin = authorizeRole("Admin", "Admin");
