const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { getUsers, createUser, updateUser } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getUsers);
router.post('/', authenticateToken, createUser);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查用戶是否存在
    const [user] = await pool.execute(
      'SELECT Id, Account FROM Users WHERE Id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: '使用者不存在' });
    }

    // 檢查是否為管理員帳號
    const [isAdmin] = await pool.execute(
      'SELECT Id FROM Users WHERE Id = ? AND Account = "admin"',
      [id]
    );

    if (isAdmin.length > 0) {
      return res.status(403).json({ message: '不能刪除管理員帳號' });
    }

    // 執行刪除
    await pool.execute('DELETE FROM Users WHERE Id = ?', [id]);

    res.json({ message: '使用者刪除成功' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: '刪除使用者失敗' });
  }
});

module.exports = router;