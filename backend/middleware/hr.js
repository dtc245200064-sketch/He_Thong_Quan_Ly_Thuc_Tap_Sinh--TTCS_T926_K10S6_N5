// Uses the authenticated role, never the client UI visibility.
module.exports = (req, res, next) => {
  if (!req.user || !['HR Manager', 'Admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Chỉ HR hoặc Admin được thực hiện thao tác này' });
  }
  next();
};
