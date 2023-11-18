const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Fee = require('../models/Fee');
const { auth, authAdmin } = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
    if (req.session.user.admin) {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/orders/me');
    }
});
router.get('/error', auth, async (req, res) => {
    return res.render('error');
});
router.get('/*', auth, async (req, res) => {
    return res.render('404');
});
module.exports = router;
