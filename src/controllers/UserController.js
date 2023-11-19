const User = require('../models/User');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { multipleMongooseToObj, mongooseToObj } = require('../util/mongoose');

class UserController {
    async renderRegister(req, res) {
        if (req.session?.user) {
            return res.redirect('/');
        } else {
            return res.render('users/register');
        }
    }
    async renderLogin(req, res) {
        if (req.session?.user) {
            return res.redirect('/');
        } else {
            return res.render('users/login');
        }
    }
    async renderManagerUser(req, res) {
        try {
            const [users, me] = await Promise.all([
                User.find({}),
                User.findById(req.session.user._id),
            ]);
            if (users && me) {
                return res.render('users/manager', {
                    users: multipleMongooseToObj(users),
                    me: mongooseToObj(me),
                    tab: 'users/manager',
                });
            }
            return res.redirect('/error');
        } catch (err) {}
    }
    async renderProfile(req, res) {
        try {
            const [banksResponse, me] = await Promise.all([
                fetch('https://api.vietqr.io/v2/banks').then((response) =>
                    response.json()
                ),
                User.findOne({ _id: req.session.user._id }),
            ]);
            const banks = banksResponse.data.map((bank) => {
                return { code: bank.code, name: bank.shortName };
            });
            return res.render('users/profile', {
                banks,
                me: mongooseToObj(me),
            });
        } catch (error) {
            console.log('error', error);
            throw new Error(error);
        }
    }
    async getUserById(req, res) {
        await User.findOne({ _id: req.params.userId }).then((user) =>
            res.status(200).json(user)
        );
    }
    async logout(req, res) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                } else {
                    return res.redirect('/users/login');
                }
            });
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
    async vertifyUser(req, res, next) {
        const { userIds } = req.body;
        try {
            const updatePromises = userIds.map((userId) => {
                return new Promise((resolve, reject) => {
                    User.updateOne(
                        { _id: userId },
                        {
                            $set: {
                                isVertify: true,
                            },
                        }
                    )
                        .exec() // Chuyển đổi kết quả thành promise
                        .then(() => resolve(`Đã cập nhật đơn hàng ${userId}`))
                        .catch((error) =>
                            reject(
                                `Lỗi khi cập nhật đơn hàng ${userId}: ${error}`
                            )
                        );
                });
            });
            await Promise.all(updatePromises);
            return res.redirect('/users/manager');
        } catch (error) {
            throw new Error(error);
        }
    }
    async updateBank(req, res) {
        try {
            const { bankCode, bankNumber, bankHolder } = req.body;
            await User.updateOne(
                { _id: req.session.user._id },
                {
                    $set: {
                        bankCode,
                        bankNumber,
                        bankHolder,
                    },
                }
            );
            return res.redirect('/');
        } catch (error) {}
    }
    async register(req, res) {
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user) {
                const saltRounds = 10;
                const salt = bcrypt.genSaltSync(saltRounds);
                const hashPassword = bcrypt.hashSync(req.body.password, salt);

                const newUser = await new User({
                    ...req.body,
                    password: hashPassword,
                });
                await newUser
                    .save()
                    .then((userInfo) => {
                        return res.render('users/vertify');
                    })
                    .catch((error) => {
                        throw new Error(error);
                    });
            } else {
                return res.render('users/register', {
                    usernameValidate: 'Username is exist',
                });
            }
        } catch (err) {
            console.error('Error during registration:', err);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Find the user by username
            const user = await User.findOne({ username });

            if (!user) {
                return res.render('users/login', {
                    usernameValidate: 'User not found',
                });
            }

            // Compare the provided password with the hashed password in the database
            const isPasswordValid = bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.render('login', {
                    passwordValidate: 'Invalid password',
                });
            }
            console.log(user.isVertify);
            // Check if the user is verified
            if (!user.isVertify) {
                return res.render('users/login', {
                    usernameValidate:
                        'User is not verified, waiting for admin confirm',
                });
            }

            req.session.user = {
                _id: user._id,
                username: user.username,
                admin: user.admin,
                fullName: user.fullName,
                bankId: user.bankId,
            };
            req.session.save();
            return res.redirect('/');
            // Send the token in the response
        } catch (err) {
            console.error('Error during login:', err);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
}
module.exports = new UserController();
