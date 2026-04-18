// allowedRoles example: ['admin'] or ['customer'] or ['garage', 'admin']
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user was set by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Check if user role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${allowedRoles.join(", ")} can access this.`,
      });
    }

    next(); // role is correct, allow to continue
  };
};

module.exports = { checkRole };
