// server/routes/auth.js
const router = require('express').Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 先確認 username 和 password 是否存在
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: '請輸入帳號和密碼' 
      });
    }

    const [users] = await pool.execute(
      'SELECT * FROM Users WHERE Account = ? AND Status = ?',
      [username, 'Active']
    );

    // 檢查用戶是否存在
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: '帳號或密碼錯誤' 
      });
    }

    const user = users[0];

    // 驗證密碼 (注意：實際應用中應該使用加密密碼)
    if (user.Password !== password) {
      return res.status(401).json({ 
        success: false,
        message: '帳號或密碼錯誤' 
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.Id, 
        username: user.Account 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // 返回成功響應
    res.json({
      success: true,
      token,
      user: {
        id: user.Id,
        username: user.Account,
        name: user.Name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登入失敗，請稍後再試'
    });
  }
});

// 驗證 token 的路由
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '未提供 token' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const [users] = await pool.execute(
      'SELECT Id, Account, Name FROM Users WHERE Id = ? AND Status = ?',
      [decoded.userId, 'Active']
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '使用者不存在或已被停用' 
      });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.Id,
        username: user.Account,
        name: user.Name
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'token 無效或已過期' 
    });
  }
});

module.exports = router;