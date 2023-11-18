const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Fee = require('../models/Fee');
const { auth, authAdmin } = require('../middlewares/auth');

router.get('/orders/me');
router.get('/admin/manager/users', authAdmin, async (req, res) => {
    return res.render('404');
});
router.get('/admin/manager/orders', authAdmin, async (req, res) => {
    return res.render('404');
});

module.exports = router;
