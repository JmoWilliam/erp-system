// server/routes/vendors.js
const router = require('express').Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/auth');

// 供應商相關路由
router.get('/', authenticateToken, vendorController.getVendors);
router.get('/basic', authenticateToken, vendorController.getBasicVendors);
router.post('/', authenticateToken, vendorController.createVendor);
router.put('/:id', authenticateToken, vendorController.updateVendor);
router.patch('/:id/status', authenticateToken, vendorController.updateVendorStatus);
router.delete('/:id', authenticateToken, vendorController.deleteVendor);

module.exports = router;