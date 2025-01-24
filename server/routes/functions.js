// server/routes/functions.js
const router = require('express').Router();
const functionController = require('../controllers/functionController');
const { authenticateToken } = require('../middleware/auth');

// Function management routes
router.get('/', authenticateToken, (req, res) => functionController.getAllFunctions(req, res));
router.post('/', authenticateToken, (req, res) => functionController.createFunction(req, res));
router.get('/:moduleId', authenticateToken, (req, res) => functionController.getModuleFunctions(req, res));
router.patch('/:id', authenticateToken, (req, res) => functionController.updateFunctionStatus(req, res));
router.put('/:id', authenticateToken, (req, res) => functionController.updateFunction(req, res));
router.delete('/:id', authenticateToken, (req, res) => functionController.deleteFunction(req, res));

module.exports = router;