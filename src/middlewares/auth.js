const User = require('../models/User');

const isLogin = async (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        console.log('Authentication');
        return res.redirect('/users/login');
    }
};
const auth = async (req, res, next) => {
    try {
        if (req.session && req.session.user) {
            const userSession = req.session.user;
            const user = await User.findOne({ _id: userSession._id });

            if (
                user.bankCode === null ||
                user.bankNumber == null ||
                user.bankHolder == null
            ) {
                return res.redirect('/users/profile');
            } else {
                next();
            }
        } else {
            console.log('Authentication');
            return res.redirect('/users/login');
        }
    } catch (error) {
        throw new Error(error);
    }
};
const authWithUserId = async (req, res, next) => {
    auth(req, res, async () => {
        if (req.params.userId == req.session.user._id || req.user.admin) {
            next();
        } else {
            return res.send('You are not allowed to access');
        }
    });
};
const authAdmin = async (req, res, next) => {
    auth(req, res, async () => {
        if (req.session.user.admin) {
            next();
        } else {
            return res.redirect('/orders/me');
        }
    });
};
module.exports = { auth, authAdmin, authWithUserId, isLogin };
