const router = require('express').Router();
const moduleController = require('../controllers/moduleController');
const functionController = require('../controllers/functionController');
const { authenticateToken } = require('../middleware/auth');

// Navigation menu route
router.get('/navigation', authenticateToken, (req, res) => moduleController.getNavigation(req, res));
router.get('/menu-routes', authenticateToken, (req, res) => moduleController.getMenuRoutes(req, res)); // 新增這行

// Module management routes
router.get('/', authenticateToken, (req, res) => moduleController.getAllModules(req, res));
router.get('/parents', authenticateToken, (req, res) => moduleController.getParentModules(req, res));
router.post('/', authenticateToken, (req, res) => moduleController.createModule(req, res));
router.put('/:id', authenticateToken, (req, res) => moduleController.updateModule(req, res));
router.patch('/:id', authenticateToken, (req, res) => moduleController.updateModuleStatus(req, res));
router.delete('/:id', authenticateToken, (req, res) => moduleController.deleteModule(req, res));
router.get('/menu-routes', authenticateToken, (req, res) => moduleController.getMenuRoutes(req, res));

// Function management routes
router.get('/functions', authenticateToken, (req, res) => functionController.getAllFunctions(req, res));
router.get('/:moduleId/functions', authenticateToken, (req, res) => functionController.getModuleFunctions(req, res));
router.post('/functions', authenticateToken, (req, res) => functionController.createFunction(req, res));
router.patch('/functions/:id', authenticateToken, (req, res) => functionController.updateFunctionStatus(req, res));
router.put('/functions/:id', authenticateToken, (req, res) => functionController.updateFunction(req, res));
router.delete('/functions/:id', authenticateToken, (req, res) => functionController.deleteFunction(req, res));

module.exports = router;