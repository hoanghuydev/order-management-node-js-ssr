const Shop = require('../models/Shop');
const User = require('../models/User');
const { mongooseToObj, multipleMongooseToObj } = require('../util/mongoose');

class ShopController {
    async renderShopManager(req, res) {
        const [shops, me] = await Promise.all([
            Shop.find({}),
            User.findOne({ _id: req.session.user._id }),
        ]);

        res.render('shops/manager', {
            me: mongooseToObj(me),
            shops: multipleMongooseToObj(shops),
            tab: 'shops/manager',
        });
    }
    async renderEditShop(req, res) {
        const [shop, me] = await Promise.all([
            Shop.findOne({ _id: req.params.shopId }),
            User.findOne({ _id: req.session.user._id }),
        ]);
        if (shop)
            return res.render('shops/edit', {
                me: mongooseToObj(me),
                shop: mongooseToObj(shop),
                tab: 'shops/manager',
            });
        res.redirect('/error');
    }
    async editShop(req, res) {
        const { name, type } = req.body;
        await Shop.updateOne(
            { _id: req.params.shopId },
            { $set: { name, type } }
        );
        res.redirect('/shops/manager');
    }
    async deleteShop(req, res) {
        await Shop.deleteOne({ _id: req.params.shopId });
        res.redirect('/shops/manager');
    }
    async createShop(req, res) {
        try {
            const { name, type } = req.body;
            const newShop = new Shop({ name, type });
            await newShop.save();
            res.redirect('/shops/manager');
        } catch (error) {
            res.render('Error' + error);
        }
    }
}
module.exports = new ShopController();
