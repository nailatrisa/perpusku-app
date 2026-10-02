function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Harus login terlebih dahulu.', data: null });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses.', data: null });
    }
    return next();
  };
}

module.exports = { authorize };