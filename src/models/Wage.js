const mongoose = require('mongoose');
const { Schema } = mongoose;
const WageSchema = new Schema({
    code: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    shopType: { type: String },
    userId: { type: String },
});
module.exports = mongoose.model('wages', WageSchema);
