const pool = require('../config/database');

exports.getRoles = async (req, res) => {
  try {
    const [roles] = await pool.execute(
      'SELECT Id, RoleName, Status FROM roles ORDER BY Id'
    );
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: '獲取角色列表失敗' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { roleName, status } = req.body;
    
    const [existing] = await pool.execute(
      'SELECT Id FROM roles WHERE RoleName = ?',
      [roleName]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: '角色名稱已存在' });
    }

    const [result] = await pool.execute(
      'INSERT INTO roles (RoleName, Status) VALUES (?, ?)',
      [roleName, status]
    );

    res.json({ 
      message: '角色創建成功',
      roleId: result.insertId
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: '創建角色失敗' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, status } = req.body;

    await pool.execute(
      'UPDATE roles SET RoleName = ?, Status = ? WHERE Id = ?',
      [roleName, status, id]
    );

    res.json({ message: '角色更新成功' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: '更新角色失敗' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查角色是否存在
    const [role] = await pool.execute(
      'SELECT Id FROM roles WHERE Id = ?',
      [id]
    );

    if (role.length === 0) {
      return res.status(404).json({ message: '角色不存在' });
    }

    // 刪除角色相關的用戶關聯
    await pool.execute('DELETE FROM userroles WHERE RoleId = ?', [id]);
    
    // 刪除角色相關的功能權限
    await pool.execute('DELETE FROM rolepermissions WHERE RoleId = ?', [id]);

    // 刪除角色
    await pool.execute('DELETE FROM roles WHERE Id = ?', [id]);

    res.json({ message: '角色刪除成功' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: '刪除角色失敗' });
  }
};

exports.getRoleUsers = async (req, res) => {
  try {
    const { roleId } = req.params;
    const [users] = await pool.execute(`
      SELECT 
        u.Id,
        u.Account,
        u.Name,
        CASE WHEN ur.UserId IS NOT NULL THEN 1 ELSE 0 END as isSelected
      FROM Users u
      LEFT JOIN UserRoles ur ON u.Id = ur.UserId AND ur.RoleId = ?
      WHERE u.Status = 'Active'
      ORDER BY u.Account
    `, [roleId]);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching role users:', error);
    res.status(500).json({ 
      success: false,
      message: '獲取角色使用者失敗' 
    });
  }
};

exports.getRoleFunctions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const [functions] = await pool.execute(`
      SELECT f.Id, f.FunctionName,
             CASE WHEN rp.FunctionId IS NOT NULL THEN 1 ELSE 0 END as isSelected
      FROM functions f
      LEFT JOIN rolepermissions rp ON f.Id = rp.FunctionId AND rp.RoleId = ?
      WHERE f.Status = 'Active'
      ORDER BY f.ModuleId, f.SortOrder
    `, [roleId]);
    
    res.json(functions);
  } catch (error) {
    console.error('Error fetching role functions:', error);
    res.status(500).json({ message: '獲取角色功能權限失敗' });
  }
};

exports.updateRoleFunctions = async (req, res) => {
  const { roleId } = req.params;
  const { functionIds } = req.body;

  try {
    // 開始交易
    await pool.execute('START TRANSACTION');

    // 刪除現有的角色功能權限
    await pool.execute('DELETE FROM rolepermissions WHERE RoleId = ?', [roleId]);

    // 如果有選擇的功能，則新增權限
    if (functionIds && functionIds.length > 0) {
      const values = functionIds.map(functionId => [roleId, functionId]);
      await pool.execute(
        'INSERT INTO rolepermissions (RoleId, FunctionId) VALUES ?',
        [values]
      );
    }

    // 提交交易
    await pool.execute('COMMIT');

    res.json({ message: '角色功能權限更新成功' });
  } catch (error) {
    // 發生錯誤時回滾交易
    await pool.execute('ROLLBACK');
    console.error('Error updating role functions:', error);
    res.status(500).json({ message: '更新角色功能權限失敗' });
  }
};

exports.updateRoleUsers = async (req, res) => {
  const { roleId } = req.params;
  const { userIds } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 刪除該角色的所有現有用戶關聯
    await connection.execute(
      'DELETE FROM UserRoles WHERE RoleId = ?',
      [roleId]
    );

    // 如果有選擇的用戶，則創建新的關聯
    if (userIds && userIds.length > 0) {
      // 生成批量插入的 SQL 語句
      const placeholders = userIds.map(() => '(?, ?)').join(', ');
      const sql = `INSERT INTO UserRoles (RoleId, UserId) VALUES ${placeholders}`;
      
      // 生成參數數組，每個用戶 ID 都需要配對一個角色 ID
      const params = [];
      userIds.forEach(userId => {
        params.push(roleId, userId);
      });

      await connection.execute(sql, params);
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: '角色使用者更新成功'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating role users:', error);
    res.status(500).json({
      success: false,
      message: '更新角色使用者失敗',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

exports.getRoleModules = async (req, res) => {
  try {
    const { roleId } = req.params;
    console.log('Fetching modules for roleId:', roleId);

    // 獲取所有模組並標記是否被選中
    const [modules] = await pool.execute(`
      WITH RECURSIVE ModuleTree AS (
        -- 查詢根節點（沒有父節點的模組）
        SELECT 
          m.Id,
          m.ModuleName,
          m.CodeNo,
          m.ParentId,
          m.Status,
          m.ComponentPath,
          CAST(m.ModuleName AS CHAR(1000)) AS Path,
          0 AS Level
        FROM Modules m
        WHERE m.ParentId IS NULL AND m.Status = 'Active'

        UNION ALL

        -- 遞迴查詢子節點
        SELECT 
          m.Id,
          m.ModuleName,
          m.CodeNo,
          m.ParentId,
          m.Status,
          m.ComponentPath,
          CONCAT(mt.Path, ' > ', m.ModuleName),
          mt.Level + 1
        FROM Modules m
        INNER JOIN ModuleTree mt ON m.ParentId = mt.Id
        WHERE m.Status = 'Active'
      )
      SELECT 
        mt.*,
        CASE WHEN rp.RoleId IS NOT NULL THEN 1 ELSE 0 END as isSelected,
        CASE 
          WHEN NOT EXISTS (
            SELECT 1 
            FROM Modules sub 
            WHERE sub.ParentId = mt.Id AND sub.Status = 'Active'
          ) THEN 1 
          ELSE 0 
        END as isLeaf
      FROM ModuleTree mt
      LEFT JOIN RolePermissions rp ON mt.Id = rp.ModuleId AND rp.RoleId = ?
      ORDER BY mt.Level, mt.Path;
    `, [roleId]);

    console.log('Retrieved modules:', modules);

    // 將平面結構轉換為樹狀結構
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.ParentId === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.Id)
        }));
    };

    const tree = buildTree(modules);
    console.log('Built tree structure:', JSON.stringify(tree, null, 2));

    res.json(tree);
  } catch (error) {
    console.error('Error in getRoleModules:', error);
    res.status(500).json({
      success: false,
      message: '獲取角色模組權限失敗',
      error: error.message
    });
  }
};

exports.updateRoleModules = async (req, res) => {
  const { roleId } = req.params;
  const { moduleIds } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 刪除現有權限
    await connection.execute(
      'DELETE FROM RolePermissions WHERE RoleId = ?',
      [roleId]
    );

    // 如果有選擇的模組，則新增權限
    if (moduleIds && moduleIds.length > 0) {
      const placeholders = moduleIds.map(() => '(?, ?)').join(', ');
      const sql = `INSERT INTO RolePermissions (RoleId, ModuleId) VALUES ${placeholders}`;
      
      const params = [];
      moduleIds.forEach(moduleId => {
        params.push(roleId, moduleId);
      });

      await connection.execute(sql, params);
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: '角色模組權限更新成功'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating role modules:', error);
    res.status(500).json({
      success: false,
      message: '更新角色模組權限失敗',
      error: error.message
    });
  } finally {
    connection.release();
  }
};