const mongoose = require('mongoose');
const { Schema } = mongoose;
const ShopSchema = new Schema({
    name: { type: String, default: '' },
    type: String,
});
module.exports = mongoose.model('shops', ShopSchema);
