const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.user_type_id)) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
      }
      next();
    };
  };
  
  module.exports = { authorizeRoles };
  