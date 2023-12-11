const Fee = require('../models/Fee');
const Order = require('../models/Order');
const User = require('../models/User');
const { multipleMongooseToObj, mongooseToObj } = require('../util/mongoose');

class AdminController {
    async renderDashboard(req, res) {
        try {
            const [countOrderWaitConfirm, countOrderWaitPay, fee, me] =
                await Promise.all([
                    Order.countDocuments({ status: 'Chờ xác nhận' }),
                    Order.countDocuments({ status: 'Chờ thanh toán' }),
                    Fee.findOne({ only: true }),
                    User.findOne({ _id: req.session.user._id }),
                ]);
            const profit = fee.profit;
            const isAdmin = req.session.user.admin;
            return res.render('admin/dashboard', {
                me: mongooseToObj(me),
                countOrderWaitConfirm,
                countOrderWaitPay,
                profit,
                tab: 'dashboard',
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
}
module.exports = new AdminController();
