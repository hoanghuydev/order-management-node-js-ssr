const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserSchema = new Schema({
    username: { type: String, unique: true, minLength: 1, maxLength: 255 },
    password: { type: String, minLength: 1 },
    fullName: { type: String },
    isVertify: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    bankCode: { type: String, default: null },
    bankNumber: { type: String, default: null },
    bankHolder: { type: String, default: null },
    wageId: { type: Array },
    purchaseAccount: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
});
module.exports = mongoose.model('users', UserSchema);
