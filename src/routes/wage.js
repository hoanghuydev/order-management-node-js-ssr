const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: '/tmp/' });
const { auth, isLogin, authAdmin } = require('../middlewares/auth');
const WageController = require('../controllers/WageController');
router.get('/manager', authAdmin, WageController.renderWageManager);
router.get('/list/:userId', authAdmin, WageController.ajaxLoadWageCodeByUserId);
router.post(
    '/update',
    upload.single('file'),
    authAdmin,
    WageController.updateWageCodeByUserId
);

module.exports = router;
