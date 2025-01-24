const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供認證令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'X9Kj#mP2$nL8@vB4*qR7', (err, user) => {
    if (err) {
      return res.status(403).json({ message: '認證令牌無效' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };