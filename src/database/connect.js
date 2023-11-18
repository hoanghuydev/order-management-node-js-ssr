const mongoose = require('mongoose');
const { Schema } = mongoose;
const dotenv = require('dotenv');
dotenv.config();
async function connet() {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: 'Freelancer_Shopee_Tool_CRM',
        });
        console.log('Connnet successfully');
    } catch (error) {
        console.log('Failed to connect');
    }
}
module.exports = { connet };
