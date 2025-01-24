// server/routes/roles.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleController = require('../controllers/roleController');

// 基本的角色 CRUD
router.get('/', authenticateToken, roleController.getRoles);
router.post('/', authenticateToken, roleController.createRole);
router.put('/:id', authenticateToken, roleController.updateRole);
router.delete('/:id', authenticateToken, roleController.deleteRole);

// 角色使用者管理
router.get('/:roleId/users', authenticateToken, roleController.getRoleUsers);
router.put('/:roleId/users', authenticateToken, roleController.updateRoleUsers);

// 角色模組權限管理
router.get('/:roleId/modules', authenticateToken, roleController.getRoleModules);
router.put('/:roleId/modules', authenticateToken, roleController.updateRoleModules);

module.exports = router;