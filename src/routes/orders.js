const OrderController = require('../controllers/OrderController');
const { authAdmin, auth } = require('../middlewares/auth');
const multer = require('multer');
const router = require('express').Router();
const upload = multer({ dest: 'tmp/' });
router.get('/me', auth, OrderController.renderMyOrders);
router.get('/manager', authAdmin, OrderController.renderOrderManager);
router.get('/hide', authAdmin, OrderController.renderOrderHide);
router.get('/create', auth, OrderController.renderCreateOrder);
router.get('/edit/:orderId', authAdmin, OrderController.renderOrderEdit);
router.put('/edit/:orderId', authAdmin, OrderController.editOrder);
router.get('/delete-all-order', authAdmin, OrderController.deleteAllOrder);
router.delete('/delete/:orderId', auth, OrderController.deleteOrder);
router.put('/pay', authAdmin, OrderController.payOrder);
router.post('/create', auth, OrderController.createOrder);
router.post(
    '/update',
    upload.single('file'),
    authAdmin,
    OrderController.updateOrders
);

module.exports = router;
