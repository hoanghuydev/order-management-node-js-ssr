const mongoose = require('mongoose');
const { Schema } = mongoose;
const WageSchema = new Schema({
    code: { type: String, default: '' },
    amout: { type: Number, default: 0 },
    shopType: { type: String },
});
module.exports = mongoose.model('wages', WageSchema);
