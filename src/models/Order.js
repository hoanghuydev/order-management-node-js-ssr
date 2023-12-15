const mongoose = require('mongoose');
const { Schema } = mongoose;
const OrderSchema = new Schema({
    userId: { type: String, default: null },
    orderCode: { type: String, unique: true },
    shopId: { type: String, default: null },
    shopName: { type: String, default: null },
    purchaseAccount: { type: String },
    voucher: { type: Number, default: 0 },
    orderValue: { type: Number, default: 0 },
    status: { type: String, default: 'Chờ' },
    wageCode: { type: String, default: null },
    wageAmount: { type: Number, default: 0 },
    buyerPay: { type: Number, default: 0 },
    payFee: { type: Number, default: 0 },
    staticFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
});
module.exports = mongoose.model('orders', OrderSchema);
