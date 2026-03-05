/**
 * Role Authorization Middleware
 * Allows access only to specified roles
 */

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {

      // Ensure authMiddleware ran
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No authenticated user found",
        });
      }

      const userRole = req.user.role;

      // Debug (TEMPORARY)
      console.log("USER ROLE:", userRole);
      console.log("ALLOWED ROLES:", allowedRoles);

      // Validate role
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Role not defined",
        });
      }

      // Check permissions
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      next();

    } catch (error) {
      console.error("Authorization error:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};