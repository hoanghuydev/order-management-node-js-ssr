const mongoose = require('mongoose');
const { Schema } = mongoose;
const FeeSchema = new Schema({
    only: { type: Boolean, default: true },
    amount: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
});
module.exports = mongoose.model('fees', FeeSchema);
