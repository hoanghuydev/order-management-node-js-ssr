const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
dotenv.config();

const app = express();
const db = require('./database/connect');
const route = require('./routes');
db.connet();
// set default folder
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URL,
            dbName: 'Freelancer_Shopee_Tool_CRM',
            ttl: 1 * 24 * 60 * 60,
        }),
        resave: false,
        saveUninitialized: true,
    })
);
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '../public')));

app.use(
    express.urlencoded({
        extended: true,
    })
);
// import lib giúp code html từ file khác

app.engine(
    'hbs',
    hbs.engine({
        extname: 'hbs',
        defaultLayout: 'main',
        partialsDir: [
            //  path to your partials
            path.join(__dirname, 'views/partials'),
        ],
        helpers: {
            eq: function (a, b, options) {
                if (a === b) {
                    return options.fn(this);
                }
                return options.inverse(this);
            },
            noteq: function (a, b, options) {
                if (a === b) {
                    return options.inverse(this);
                }
                return options.fn(this);
            },
            eq2var: function (a, b, c, options) {
                if (a === b || a === c) {
                    return options.fn(this);
                }
                return options.inverse(this);
            },
            noteq2var: function (a, b, options) {
                if (a === b || a === c) {
                    return options.inverse(this);
                }
                return options.fn(this);
            },
            bar: function () {
                return 'BAR!';
            },
        },
    })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));
//  log từ client lên node server
// app.use(morgan("combined"));
route(app);

app.listen(process.env.PORT, () => {
    console.log(`Server on`);
});
