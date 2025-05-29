// src/modules/user-management/middlewares/user.middleware.js

const dotenv = require('dotenv');  

dotenv.config();

const jwt = require('jsonwebtoken');  


const JWT_SECRET = process.env.JWT_SECRET;
// Vérifier le token JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: unauthorized role" });
    }
    next();
  };
};

// Exporter les middlewares avec module.exports
module.exports = { verifyToken, authorizeRoles };
