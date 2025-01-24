const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;
    
    const [users] = await pool.execute(
      'SELECT * FROM Users WHERE Account = ? AND Status = "Active"',
      [account]
    );

    if (users.length === 0 || password !== 'admin123') {
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }

    const user = users[0];
    const token = jwt.sign(
      { userId: user.Id, account: user.Account },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '8h' }
    );

    res.json({ 
      token,
      user: {
        userId: user.Id,
        account: user.Account,
        name: user.Name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '系統錯誤' });
  }
};