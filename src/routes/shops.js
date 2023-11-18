const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Fee = require('../models/Fee');
const { auth, authAdmin } = require('../middlewares/auth');
const ShopController = require('../controllers/ShopController');

router.get('/manager', authAdmin, ShopController.renderShopManager);
router.get('/edit/:shopId', authAdmin, ShopController.renderEditShop);
router.put('/edit/:shopId', authAdmin, ShopController.editShop);
router.delete('/delete/:shopId', authAdmin, ShopController.deleteShop);
router.post('/create', authAdmin, ShopController.createShop);

module.exports = router;
