/**
 * Role Authorization Middleware
 * Allows access only to specified roles
 *
 * Usage:
 * authorizeRoles("ADMIN")
 * authorizeRoles("ADMIN", "RECEPTIONIST")
 * authorizeRoles("DOCTOR")
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 1️⃣ Ensure user exists (authMiddleware must run first)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No authenticated user found",
        });
      }

      const userRole = req.user.role;

      // 2️⃣ Validate role
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Role not defined",
        });
      }

      // 3️⃣ Check if role is allowed
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};
