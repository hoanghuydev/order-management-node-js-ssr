const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middlewares/auth');
const AdminController = require('../controllers/AdminController');
router.get('/dashboard', authAdmin, AdminController.renderDashboard);
module.exports = router;
