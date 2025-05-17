const adminAuth = (req, res, next) => {
  // Предполагается, что middleware auth уже добавил req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' });
  }
  
  next();
};

module.exports = { adminAuth };