// server/controllers/functionController.js
const pool = require('../config/database');

exports.getAllFunctions = async (req, res) => {
  try {
    const { functionName, codeNo } = req.query;
    let query = `
      SELECT 
        f.Id,
        f.FunctionName,
        f.CodeNo,
        f.ModuleId,
        m.ModuleName,
        f.SortOrder,
        f.Status,
        f.CreatedAt,
        f.UpdatedAt
      FROM Functions f
      LEFT JOIN Modules m ON f.ModuleId = m.Id
      WHERE 1=1
    `;
    let params = [];

    if (functionName) {
      query += ' AND f.FunctionName LIKE ?';
      params.push(`%${functionName}%`);
    }
    if (codeNo) {
      query += ' AND f.CodeNo LIKE ?';
      params.push(`%${codeNo}%`);
    }

    query += ' ORDER BY m.SortOrder, f.SortOrder';

    const [functions] = await pool.execute(query, params);
    res.json(functions);
  } catch (error) {
    console.error('Error getting functions:', error);
    res.status(500).json({ 
      success: false,
      message: '獲取功能列表失敗', 
      error: error.message 
    });
  }
};

exports.createFunction = async (req, res) => {
  const { functionName, codeNo, moduleId, sortOrder, status = 'Active' } = req.body;
  try {
    // 檢查代碼是否已存在
    const [existing] = await pool.execute(
      'SELECT Id FROM Functions WHERE CodeNo = ?',
      [codeNo]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: '功能代碼已存在' 
      });
    }

    // 檢查選擇的模組是否存在
    const [module] = await pool.execute(
      'SELECT Id FROM Modules WHERE Id = ?',
      [moduleId]
    );

    if (module.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: '所選模組不存在' 
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO Functions (FunctionName, CodeNo, ModuleId, SortOrder, Status) VALUES (?, ?, ?, ?, ?)',
      [functionName, codeNo, moduleId, sortOrder, status]
    );

    res.status(201).json({ 
      success: true,
      message: '功能新增成功',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating function:', error);
    res.status(500).json({ 
      success: false,
      message: '新增功能失敗', 
      error: error.message 
    });
  }
};

exports.updateFunction = async (req, res) => {
  const { id } = req.params;
  const { functionName, codeNo, moduleId, sortOrder, status } = req.body;
  try {
    // 檢查功能是否存在
    const [existing] = await pool.execute(
      'SELECT Id FROM Functions WHERE Id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: '功能不存在' 
      });
    }

    // 檢查代碼是否重複（排除自己）
    const [duplicateCode] = await pool.execute(
      'SELECT Id FROM Functions WHERE CodeNo = ? AND Id != ?',
      [codeNo, id]
    );

    if (duplicateCode.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: '功能代碼已存在' 
      });
    }

    // 檢查模組是否存在
    const [module] = await pool.execute(
      'SELECT Id FROM Modules WHERE Id = ?',
      [moduleId]
    );

    if (module.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: '所選模組不存在' 
      });
    }

    await pool.execute(`
      UPDATE Functions 
      SET FunctionName = ?, 
          CodeNo = ?, 
          ModuleId = ?, 
          SortOrder = ?,
          Status = ?,
          UpdatedAt = CURRENT_TIMESTAMP
      WHERE Id = ?
    `, [functionName, codeNo, moduleId, sortOrder, status, id]);

    res.json({ 
      success: true,
      message: '功能更新成功' 
    });
  } catch (error) {
    console.error('Error updating function:', error);
    res.status(500).json({ 
      success: false,
      message: '更新功能失敗', 
      error: error.message 
    });
  }
};

exports.deleteFunction = async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查功能是否存在
    const [existing] = await pool.execute(
      'SELECT Id FROM Functions WHERE Id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: '功能不存在' 
      });
    }

    // 檢查是否有相關的角色權限記錄
    const [permissions] = await pool.execute(
      'SELECT Id FROM RolePermissions WHERE FunctionId = ?',
      [id]
    );

    if (permissions.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: '此功能已被角色使用，無法刪除' 
      });
    }

    // 執行刪除
    await pool.execute('DELETE FROM Functions WHERE Id = ?', [id]);

    res.json({ 
      success: true,
      message: '功能刪除成功' 
    });
  } catch (error) {
    console.error('Error deleting function:', error);
    res.status(500).json({ 
      success: false,
      message: '刪除功能失敗', 
      error: error.message 
    });
  }
};

exports.updateFunctionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    // 檢查功能是否存在
    const [existing] = await pool.execute(
      'SELECT Id FROM Functions WHERE Id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: '功能不存在' 
      });
    }

    await pool.execute(
      'UPDATE Functions SET Status = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = ?',
      [status, id]
    );
    
    res.json({ 
      success: true,
      message: '功能狀態更新成功' 
    });
  } catch (error) {
    console.error('Error updating function status:', error);
    res.status(500).json({ 
      success: false,
      message: '更新功能狀態失敗', 
      error: error.message 
    });
  }
};