const userRouter = require('./users');
const adminRouter = require('./admin');
const sitesRouter = require('./sites');
const ordersRouter = require('./orders');
const shopsRouter = require('./shops');

function route(app) {
    app.use('/admin', adminRouter);
    app.use('/users', userRouter);
    app.use('/shops', shopsRouter);
    app.use('/orders', ordersRouter);
    app.use('/', sitesRouter);
}
module.exports = route;
