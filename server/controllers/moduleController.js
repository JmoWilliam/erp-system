const pool = require('../config/database');

function buildTree(modules) {
  try {
    const moduleMap = new Map();
    const rootModules = [];

    // 首先將所有模組放入 map 中
    modules.forEach(module => {
      moduleMap.set(module.Id, {
        ...module,
        children: []
      });
    });

    // 建立父子關係
    modules.forEach(module => {
      const moduleWithChildren = moduleMap.get(module.Id);
      if (!module.ParentId) {
        rootModules.push(moduleWithChildren);
      } else {
        const parentModule = moduleMap.get(module.ParentId);
        if (parentModule) {
          if (!parentModule.children) {
            parentModule.children = [];
          }
          parentModule.children.push(moduleWithChildren);
        }
      }
    });

    // 排序
    return rootModules.sort((a, b) => a.SortOrder - b.SortOrder);
  } catch (error) {
    console.error('Error in buildTree:', error);
    throw error;
  }
}

exports.getNavigation = async (req, res) => {
  try {
    const [modules] = await pool.execute(`
      SELECT DISTINCT 
        m.Id,
        m.ModuleName,
        m.CodeNo,
        m.ParentId,
        m.SortOrder,
        m.Status,
        m.ComponentName,
        m.ComponentPath
      FROM Modules m
      WHERE m.Status = 'Active'
      ORDER BY m.SortOrder
    `);

    if (!modules || modules.length === 0) {
      return res.json([]);
    }

    // 在建立樹狀結構前轉換 CodeNo 為小寫
    const processedModules = modules.map(module => ({
      ...module,
      CodeNo: module.CodeNo.toLowerCase()
    }));

    const menuTree = buildTree(processedModules);
    res.json(menuTree);

  } catch (error) {
    console.error('Error in getNavigation:', error);
    res.status(500).json({
      success: false,
      message: '獲取選單失敗',
      error: error.message
    });
  }
};

exports.getAllModules = async (req, res) => {
  try {
    const { moduleName, codeNo } = req.query;
    let query = `
      SELECT m.*, pm.ModuleName as ParentModuleName 
      FROM Modules m 
      LEFT JOIN Modules pm ON m.ParentId = pm.Id
      WHERE 1=1
    `;
    let params = [];

    if (moduleName) {
      query += ' AND m.ModuleName LIKE ?';
      params.push(`%${moduleName}%`);
    }
    if (codeNo) {
      query += ' AND m.CodeNo LIKE ?';
      params.push(`%${codeNo}%`);
    }

    query += ' ORDER BY m.SortOrder';

    const [modules] = await pool.execute(query, params);
    res.json(modules);
  } catch (error) {
    console.error('Error getting modules:', error);
    res.status(500).json({
      success: false,
      message: '獲取模組列表失敗',
      error: error.message
    });
  }
};

exports.getParentModules = async (req, res) => {
  try {
    const [modules] = await pool.execute(
      'SELECT Id, ModuleName FROM Modules WHERE Status = "Active" AND ParentId IS NULL ORDER BY SortOrder'
    );
    res.json(modules);
  } catch (error) {
    console.error('Error fetching parent modules:', error);
    res.status(500).json({ message: '獲取上層模組列表失敗' });
  }
};

exports.createModule = async (req, res) => {
  const { 
    moduleName, 
    codeNo, 
    parentId, 
    sortOrder, 
    status = 'Active',
    componentName,
    componentPath 
  } = req.body;

  try {
    // 檢查代碼是否已存在
    const [existing] = await pool.execute(
      'SELECT Id FROM Modules WHERE CodeNo = ?',
      [codeNo]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: '模組代碼已存在' 
      });
    }

    // 使用更新後的 SQL 插入語句，包含新增欄位
    const [result] = await pool.execute(
      `INSERT INTO Modules (
        ModuleName, 
        CodeNo, 
        ParentId, 
        SortOrder, 
        Status,
        ComponentName,
        ComponentPath
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        moduleName, 
        codeNo, 
        parentId || null, 
        sortOrder, 
        status,
        componentName || null,
        componentPath || null
      ]
    );
    
    res.status(201).json({
      success: true,
      message: '模組新增成功',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({
      success: false,
      message: '新增模組失敗',
      error: error.message
    });
  }
};

exports.updateModule = async (req, res) => {
  const { id } = req.params;
  const { 
    moduleName, 
    codeNo, 
    parentId, 
    sortOrder, 
    status,
    componentName,
    componentPath 
  } = req.body;

  try {
    // 檢查代碼是否已存在（排除自己）
    const [existing] = await pool.execute(
      'SELECT Id FROM Modules WHERE CodeNo = ? AND Id != ?',
      [codeNo, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: '模組代碼已存在' 
      });
    }

    // 使用更新後的 SQL 更新語句，包含新增欄位
    await pool.execute(
      `UPDATE Modules 
       SET ModuleName = ?, 
           CodeNo = ?, 
           ParentId = ?, 
           SortOrder = ?, 
           Status = ?,
           ComponentName = ?,
           ComponentPath = ?
       WHERE Id = ?`,
      [
        moduleName, 
        codeNo, 
        parentId || null, 
        sortOrder, 
        status,
        componentName || null,
        componentPath || null,
        id
      ]
    );

    res.json({ 
      success: true,
      message: '模組更新成功' 
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ 
      success: false,
      message: '更新模組失敗',
      error: error.message
    });
  }
};

exports.updateModuleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.execute(
      'UPDATE Modules SET Status = ? WHERE Id = ?',
      [status, id]
    );
    res.json({
      success: true,
      message: '模組狀態更新成功'
    });
  } catch (error) {
    console.error('Error updating module status:', error);
    res.status(500).json({
      success: false,
      message: '更新模組狀態失敗',
      error: error.message
    });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查是否有子模組
    const [children] = await pool.execute(
      'SELECT Id FROM Modules WHERE ParentId = ?',
      [id]
    );

    if (children.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: '此模組下有子模組，無法刪除' 
      });
    }

    // 檢查是否有關聯的功能
    const [functions] = await pool.execute(
      'SELECT Id FROM Functions WHERE ModuleId = ?',
      [id]
    );

    if (functions.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: '此模組下有功能項目，無法刪除' 
      });
    }

    await pool.execute('DELETE FROM Modules WHERE Id = ?', [id]);

    res.json({ 
      success: true,
      message: '模組刪除成功' 
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ 
      success: false,
      message: '刪除模組失敗' 
    });
  }
};

exports.getMenuRoutes = async (req, res) => {
  try {
    const [modules] = await pool.execute(`
      SELECT 
        m.Id,
        m.ModuleName,
        m.CodeNo,
        m.ParentId,
        m.Status,
        m.ComponentName,
        m.ComponentPath,
        pm.CodeNo as ParentCodeNo
      FROM Modules m
      LEFT JOIN Modules pm ON m.ParentId = pm.Id
      WHERE m.Status = 'Active'
        AND m.ComponentName IS NOT NULL
    `);

    const routes = modules.map(module => ({
      path: `${module.ParentCodeNo ? module.ParentCodeNo.toLowerCase() : 'sys'}/${module.CodeNo.toLowerCase()}`,
      name: module.ModuleName,
      componentName: module.ComponentName,
      componentPath: module.ComponentPath || `pages/system/${module.ComponentName}`,
      moduleId: module.Id,
      parentId: module.ParentId
    }));

    console.log('Generated routes:', routes);
    res.json(routes);
  } catch (error) {
    console.error('Error in getMenuRoutes:', error);
    res.status(500).json({
      success: false,
      message: '獲取選單路由失敗',
      error: error.message
    });
  }
};