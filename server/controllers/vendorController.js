// server/controllers/vendorController.js
const pool = require('../config/database');

exports.getVendors = async (req, res) => {
  try {
    const { vendorCode, companyName, uniformNo } = req.query;
    let query = `SELECT * FROM Vendors WHERE 1=1`;
    let params = [];

    if (vendorCode) {
      query += ` AND VendorCode LIKE ?`;
      params.push(`%${vendorCode}%`);
    }
    if (companyName) {
      query += ` AND CompanyName LIKE ?`;
      params.push(`%${companyName}%`);
    }
    if (uniformNo) {
      query += ` AND UniformNo LIKE ?`;
      params.push(`%${uniformNo}%`);
    }

    query += ` ORDER BY VendorCode`;

    const [vendors] = await pool.execute(query, params);
    res.json(vendors);
  } catch (error) {
    console.error('Error in getVendors:', error);
    res.status(500).json({ 
      success: false,
      message: '取得供應商資料失敗',
      error: error.message 
    });
  }
};

exports.getBasicVendors = async (req, res) => {
  try {
    const [vendors] = await pool.execute(
      'SELECT Id, VendorCode, CompanyName FROM Vendors WHERE Status = "Active" ORDER BY VendorCode'
    );
    res.json(vendors);
  } catch (error) {
    console.error('Error in getBasicVendors:', error);
    res.status(500).json({ message: '取得供應商基本資料失敗' });
  }
};

exports.createVendor = async (req, res) => {
    try {
      const formData = req.body;
      
      // 轉換數值欄位，處理空值
      const processedData = {
        ...formData,
        capital: formData.capital ? parseFloat(formData.capital) : 0,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : 0
      };
  
      // 檢查供應商代號是否已存在
      const [existing] = await pool.execute(
        'SELECT Id FROM Vendors WHERE VendorCode = ?',
        [processedData.vendorCode]
      );
  
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: '供應商代號已存在' 
        });
      }
  
      // 構建 INSERT 語句
      const fields = Object.keys(processedData);
      const values = Object.values(processedData);
      const placeholders = fields.map(() => '?').join(',');
      const query = `INSERT INTO Vendors (${fields.join(',')}) VALUES (${placeholders})`;
  
      const [result] = await pool.execute(query, values);
  
      res.status(201).json({
        success: true,
        message: '供應商新增成功',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error in createVendor:', error);
      res.status(500).json({
        success: false,
        message: '新增供應商失敗',
        error: error.message
      });
    }
  };

exports.updateVendor = async (req, res) => {
    try {
      const { id } = req.params;
      const formData = req.body;
  
      // 轉換數值欄位，處理空值
      const processedData = {
        ...formData,
        capital: formData.capital ? parseFloat(formData.capital) : 0,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : 0
      };
  
      // 檢查供應商代號是否已存在（排除自己）
      if (processedData.vendorCode) {
        const [existing] = await pool.execute(
          'SELECT Id FROM Vendors WHERE VendorCode = ? AND Id != ?',
          [processedData.vendorCode, id]
        );
  
        if (existing.length > 0) {
          return res.status(400).json({
            success: false,
            message: '供應商代號已存在'
          });
        }
      }
  
      // 構建 UPDATE 語句
      const fields = Object.keys(processedData);
      const values = [...Object.values(processedData), id];
      const setClause = fields.map(field => `${field} = ?`).join(',');
  
      const query = `UPDATE Vendors SET ${setClause} WHERE Id = ?`;
      await pool.execute(query, values);
  
      res.json({
        success: true,
        message: '供應商資料更新成功'
      });
    } catch (error) {
      console.error('Error in updateVendor:', error);
      res.status(500).json({
        success: false,
        message: '更新供應商失敗',
        error: error.message
      });
    }
  };

exports.updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(
      'UPDATE Vendors SET Status = ? WHERE Id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: '供應商狀態更新成功'
    });
  } catch (error) {
    console.error('Error in updateVendorStatus:', error);
    res.status(500).json({
      success: false,
      message: '更新供應商狀態失敗',
      error: error.message
    });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM Vendors WHERE Id = ?', [id]);

    res.json({
      success: true,
      message: '供應商刪除成功'
    });
  } catch (error) {
    console.error('Error in deleteVendor:', error);
    res.status(500).json({
      success: false,
      message: '刪除供應商失敗',
      error: error.message
    });
  }
};