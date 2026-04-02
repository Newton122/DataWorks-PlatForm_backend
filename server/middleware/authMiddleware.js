// middleware/authMiddleware.js
// Middleware to protect routes and check JWT

const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  // roles param can be a single role string (e.g., 'admin') or an array of roles
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (req, res, next) => {
    console.log('🔒 Auth middleware checking request to:', req.path);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded:', decoded);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient role' });
      }
      next();
    } catch (err) {
      console.log('❌ Token verification failed:', err.message);
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

module.exports = authMiddleware;
