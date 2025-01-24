const pool = require('../config/database');

exports.getUsers = async (req, res) => {
  try {
    const { account, name } = req.query;
    let query = 'SELECT Id, Account, Name, Status FROM Users';
    let params = [];
    let conditions = [];

    // 只有當搜尋條件不為空字串時才添加條件
    if (account && account.trim() !== '') {
      conditions.push('LOWER(Account) LIKE LOWER(?)');
      params.push(`%${account.trim()}%`);
    }
    if (name && name.trim() !== '') {
      conditions.push('LOWER(Name) LIKE LOWER(?)');
      params.push(`%${name.trim()}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY Id';

    // 除錯日誌
    console.log('Search conditions:', { account, name });
    console.log('Final SQL Query:', query);
    console.log('Query Parameters:', params);

    const [users] = await pool.execute(query, params);
    console.log('Found users count:', users.length);

    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ 
      message: '獲取使用者列表失敗',
      error: error.message
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { account, password, name, status } = req.body;
    
    const [existing] = await pool.execute(
      'SELECT Id FROM Users WHERE Account = ?',
      [account]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: '帳號已存在' });
    }

    const [result] = await pool.execute(
      'INSERT INTO Users (Account, Password, Name, Status) VALUES (?, ?, ?, ?)',
      [account, password, name, status]
    );

    res.json({ 
      message: '使用者創建成功',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: '創建使用者失敗' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { account, password, name, status } = req.body;

    const updateFields = password
      ? [account, password, name, status, id]
      : [account, name, status, id];

    const query = password
      ? 'UPDATE Users SET Account = ?, Password = ?, Name = ?, Status = ? WHERE Id = ?'
      : 'UPDATE Users SET Account = ?, Name = ?, Status = ? WHERE Id = ?';

    await pool.execute(query, updateFields);

    res.json({ message: '使用者更新成功' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: '更新使用者失敗' });
  }
};

exports.deleteUser = async (req, res) => {
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
};