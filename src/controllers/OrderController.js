const excelToJson = require('convert-excel-to-json');
const fs = require('fs-extra');

const { multipleMongooseToObj, mongooseToObj } = require('../util/mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Shop = require('../models/Shop');
class OrderController {
    async renderMyOrders(req, res) {
        try {
            const user = req.session.user;
            const [myOrders, orderWaitConfirm, orderWaitPay, orderDone, me] =
                await Promise.all([
                    Order.find({ userId: user._id }),
                    Order.find({ userId: user._id, status: 'Chờ xác nhận' }),
                    Order.find({ userId: user._id, status: 'Chờ thanh toán' }),
                    Order.find({ userId: user._id, status: 'Đã thanh toán' }),
                    User.findOne({ _id: req.session.user._id }),
                ]);

            const countOrderWaitConfirm = orderWaitConfirm.length;
            const countOrderWaitPay = orderWaitPay.length;
            const countOrderDone = orderDone.length;
            const investmentMoney = myOrders.reduce(
                (total, order) => total + order.buyerPay,
                0
            );
            return res.render('orders/me', {
                me: mongooseToObj(me),
                myOrders: multipleMongooseToObj(myOrders),
                investmentMoney,
                countOrderWaitConfirm,
                countOrderWaitPay,
                countOrderDone,
                tab: 'orders/me',
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    async renderOrderManager(req, res, next) {
        try {
            const [orders, shops, me] = await Promise.all([
                Order.find({
                    status: { $ne: 'Chờ người dùng nhập' },
                }),
                Shop.find({}),
                User.findOne({ _id: req.session.user._id }),
            ]);
            return res.render('orders/manager', {
                orders: multipleMongooseToObj(orders),
                shops: multipleMongooseToObj(shops),
                me: mongooseToObj(me),
                tab: 'orders/manager',
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    async renderOrderHide(req, res, next) {
        try {
            const [orders, me] = await Promise.all([
                Order.find({
                    status: 'Chờ người dùng nhập',
                }),
                User.findOne({ _id: req.session.user._id }),
            ]);
            return res.render('orders/hide', {
                orders: multipleMongooseToObj(orders),
                me: mongooseToObj(me),
                tab: 'orders/manager',
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    async renderCreateOrder(req, res, next) {
        try {
            const [shops, me] = await Promise.all([
                Shop.find({}),
                User.findOne({ _id: req.session.user._id }),
            ]);

            return res.render('orders/create', {
                shops: multipleMongooseToObj(shops),
                me: mongooseToObj(me),
                tab: 'orders/create',
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    async renderOrderEdit(req, res, next) {
        try {
            const [orderInfo, shops, me] = await Promise.all([
                Order.findOne({ _id: req.params.orderId }),
                Shop.find({}),
                User.findOne({ _id: req.session.user._id }),
            ]);
            if (orderInfo && me) {
                return res.render('orders/edit', {
                    shops: multipleMongooseToObj(shops),
                    order: mongooseToObj(orderInfo),
                    me: mongooseToObj(me),
                    tab: 'orders/me',
                });
            } else {
                res.redirect('/error');
            }
        } catch (error) {
            console.log(error);
        }
    }
    async editOrder(req, res, next) {
        try {
            const order = await Order.findOne({ _id: req.params.orderId });
            if (order) {
                const {
                    orderCode,
                    shopInfo,
                    purchaseAccount,
                    voucher,
                    orderValue,
                    buyerPay,
                    payFee,
                    staticFee,
                    status,
                    wageAmount,
                } = req.body;
                const [shopId, shopName] = shopInfo.split('/');
                await Order.updateOne(
                    { _id: order._id },
                    {
                        $set: {
                            status,
                            userId: order.userId,
                            purchaseAccount,
                            orderCode,
                            shopId,
                            shopName,
                            voucher,
                            buyerPay,
                            orderValue,
                            staticFee,
                            payFee,
                            wageAmount,
                            wageCode: voucher / 1000 + '/' + orderValue / 1000,
                        },
                    }
                );
                res.redirect('/orders/manager');
            } else {
                res.redirect('/error');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    async deleteOrder(req, res, next) {
        try {
            const order = await Order.findOne({ _id: req.params.orderId });
            if (
                (order && order.userId === req.session.user._id) ||
                req.session.user.admin
            ) {
                await Order.findByIdAndDelete(req.params.orderId);
                if (req.session.user.admin)
                    return res.redirect('/orders/manager');
                return res.redirect('/orders/me');
            } else {
                return res.redirect('/error');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    async payOrder(req, res) {
        const { orderIds } = req.body;
        try {
            if (typeof orderIds === 'string') {
                const updatePromises = [
                    new Promise((resolve, reject) => {
                        Order.updateOne(
                            { _id: orderIds },
                            {
                                $set: {
                                    status: 'Đã thanh toán',
                                },
                            }
                        )
                            .exec() // Chuyển đổi kết quả thành promise
                            .then(() =>
                                resolve(`Đã cập nhật đơn hàng ${orderId}`)
                            )
                            .catch((error) =>
                                reject(
                                    `Lỗi khi cập nhật đơn hàng ${orderId}: ${error}`
                                )
                            );
                    }),
                ];
            } else {
                const updatePromises = orderIds.map((orderId) => {
                    return new Promise((resolve, reject) => {
                        Order.updateOne(
                            { _id: orderId },
                            {
                                $set: {
                                    status: 'Đã thanh toán',
                                },
                            }
                        )
                            .exec() // Chuyển đổi kết quả thành promise
                            .then(() =>
                                resolve(`Đã cập nhật đơn hàng ${orderId}`)
                            )
                            .catch((error) =>
                                reject(
                                    `Lỗi khi cập nhật đơn hàng ${orderId}: ${error}`
                                )
                            );
                    });
                });
            }

            await Promise.all(updatePromises);
            return res.redirect('/orders/manager');
        } catch (error) {
            console.error(
                'Có lỗi xảy ra trong quá trình xử lý thanh toán:',
                error
            );
            throw new Error(error);
        }
    }

    async createOrder(req, res, next) {
        try {
            const { orderCode, purchaseAccount, shopId } = req.body;
            const orderExits = await Order.findOne({ orderCode });
            const shop = await Shop.findOne({ _id: shopId });
            if (!orderExits) {
                const newOrder = new Order({
                    userId: req.session.user._id,
                    purchaseAccount,
                    orderCode,
                    shopId,
                    shopName: shop?.name,
                    status: 'Chờ xác nhận',
                });
                await newOrder.save().then((s) => {
                    console.log(s);
                });
                return res.redirect('/orders/me');
            } else if (
                orderExits &&
                orderExits.userId === null &&
                orderExits.status === 'Chờ người dùng nhập'
            ) {
                await Order.updateOne(
                    { orderCode },
                    {
                        $set: {
                            status: 'Chờ thanh toán',
                            userId: req.session.user._id,
                        },
                    }
                );
                return res.redirect('/orders/me');
            } else {
                return res.redirect('/orders/create?sucess=false');
            }
        } catch (error) {
            return res.send('Vui lòng kiểm tra lại đơn hàng');
        }
    }
    async deleteAllOrder(req, res, next) {
        await Order.deleteMany({});
        res.redirect('/orders/manager');
    }
    async updateOrders(req, res) {
        try {
            if (req.file?.filename == null || req.file?.filename == undefined) {
                return res.send('No files');
            } else {
                const filePath = '/tmp/' + req.file?.filename;
                if (!fs.existsSync(filePath)) {
                    return res.send({ error: 'File not found' });
                }
                const result = excelToJson({
                    sourceFile: filePath,
                    header: {
                        // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
                        rows: 1, // 2, 3, 4, etc.
                    },
                    columnToKey: {
                        '*': '{{columnHeader}}',
                    },
                });
                fs.remove(filePath);
                const orders = result.orders;
                const ordersCompleted = orders.filter(
                    (order) => order['Trạng Thái Đơn Hàng'] === 'Hoàn thành'
                );
                const shop = await Shop.findById(req.body.shopId);
                console.log(shop);
                //  Lấy orders từ file sang object
                const ordersData = ordersCompleted.map((order) => {
                    if (order['Trạng Thái Đơn Hàng'] === 'Hoàn thành') {
                        return new Order({
                            orderCode: order['Mã đơn hàng'],
                            purchaseAccount: order['Người Mua'],
                            voucher: Number(order['Mã giảm giá của Shopee']),
                            orderValue: Number(
                                order['Tổng giá bán (sản phẩm)']
                            ),
                            shopName: shop.name,
                            shopId: shop._id,
                            status: 'Chờ người dùng nhập',

                            buyerPay: Number(
                                order['Tổng số tiền người mua thanh toán']
                            ),
                            payFee: Number(order['Phí thanh toán']),
                            staticFee: Number(order['Phí cố định']),
                            wageCode:
                                Number(order['Mã giảm giá của Shopee'] / 1000) +
                                '/' +
                                Number(order['Tổng giá bán (sản phẩm)'] / 1000),
                        }).toObject();
                    }
                });

                // + orderValue của các orderCode trùng nhau

                const orderMap = ordersData.reduce((acc, order) => {
                    const existingOrderIndex = acc.findIndex(
                        (o) => o.orderCode === order.orderCode
                    );

                    if (existingOrderIndex !== -1) {
                        // If orderCode already exists in the array, accumulate orderValue
                        acc[existingOrderIndex].orderValue += order.orderValue;
                    } else {
                        // If orderCode doesn't exist, add the order to the array
                        acc.push({ ...order });
                    }
                    return acc;
                }, []);
                orderMap = orderMap.map((order) => {
                    return {
                        ...order,
                        wageCode: order.voucher + '/' + order.orderValue,
                    };
                });

                const listorderCode = orderMap.map((order) => order.orderCode);
                const [
                    doneOrders,
                    waitPayOrder,
                    waitEnterOrder,
                    waitConfirmOrders,
                ] = await Promise.all([
                    Order.find({
                        orderCode: { $in: listorderCode },
                        userId: { $ne: null },
                        status: 'Đã thanh toán',
                    }),
                    Order.find({
                        orderCode: { $in: listorderCode },
                        userId: { $ne: null },
                        status: 'Chờ thanh toán',
                    }),
                    Order.find({
                        orderCode: { $in: listorderCode },
                        userId: null,
                        status: 'Chờ người dùng nhập',
                    }),
                    Order.find({
                        orderCode: { $in: listorderCode },
                        userId: { $ne: null },
                        status: 'Chờ xác nhận',
                    }),
                ]);

                const skiporderCodes = [
                    ...doneOrders,
                    ...waitPayOrder,
                    ...waitEnterOrder,
                ].map((doneOrder) => doneOrder.orderCode);
                const waitConfirmorderCodes = waitConfirmOrders.map(
                    (waitConfimOrder) => waitConfimOrder.orderCode
                );
                let bulkOps = [];
                for (const order of orderMap) {
                    if (skiporderCodes.includes(order.orderCode)) {
                        continue;
                    } else if (
                        waitConfirmorderCodes.includes(order.orderCode)
                    ) {
                        const filter = {
                            orderCode: order.orderCode,
                        };
                        const update = {
                            $set: {
                                shopName: order.shopName,
                                shopId: order.shopId,
                                purchaseAccount: order.purchaseAccount,
                                voucher: order.voucher,
                                orderValue: order.orderValue,
                                wageCode: order.wageCode,
                                buyerPay: order.buyerPay,
                                payFee: order.payFee,
                                staticFee: order.staticFee,
                                status: 'Chờ thanh toán',
                            },
                        };

                        bulkOps.push({
                            updateOne: {
                                filter,
                                update,
                            },
                        });
                    } else {
                        const newOrder = new Order({
                            shopName: shop.name,
                            shopId: shop._id,
                            orderCode: order.orderCode,
                            purchaseAccount: order.purchaseAccount,
                            voucher: order.voucher,
                            orderValue: order.orderValue,
                            wageCode: order.wageCode,
                            buyerPay: order.buyerPay,
                            payFee: order.payFee,
                            staticFee: order.staticFee,
                            status: order.status,
                        });
                        bulkOps.push({
                            insertOne: {
                                document: newOrder.toObject(),
                            },
                        });
                    }
                }
                try {
                    const result = await Order.bulkWrite(bulkOps);
                    console.log(
                        `${result.upsertedCount} orders inserted, ${result.modifiedCount} orders updated.`
                    );
                } catch (error) {
                    console.error('Error processing orders:', error);
                }
                return res.redirect('/orders/manager?update_order=success');
            }
        } catch (err) {
            return res.send(err);
        }
    }
}
module.exports = new OrderController();
