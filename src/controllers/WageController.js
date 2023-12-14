const User = require('../models/User');
const Wage = require('../models/Wage');
const fs = require('fs-extra');
const excelToJson = require('convert-excel-to-json');
const { multipleMongooseToObj, mongooseToObj } = require('../util/mongoose');

class WageController {
    async renderWageManager(req, res) {
        try {
            const [me, users] = await Promise.all([
                User.findOne({ _id: req.session.user._id }),
                User.find({ isVertify: true }),
            ]);
            return res.render('wage/manager', {
                me: mongooseToObj(me),
                users: multipleMongooseToObj(users),
                tab: 'wage/manager',
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).render({ error: 'Internal Server Error' });
        }
    }
    async ajaxLoadWageCodeByUserId(req, res) {
        try {
            console.log(req.params.userId);
            const wagesByUserId = await Wage.find({
                userId: req.params.userId,
            });
            return res.render('wage/wagesByUserId', {
                layout: false,
                wagesByUserId: multipleMongooseToObj(wagesByUserId),
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    async updateWageCodeByUserId(req, res) {
        try {
            if (req.file?.filename == null || req.file?.filename == undefined) {
                return res.send('No files');
            } else {
                const { shopType, userId } = req.body;
                const filePath = '/tmp/' + req.file?.filename;
                if (!fs.existsSync(filePath)) {
                    return res.send({ error: 'File not found' });
                }
                // await User.deleteMany({ userId });
                const result = excelToJson({
                    sourceFile: filePath,
                    header: {
                        rows: 1,
                    },
                    columnToKey: {
                        '*': '{{columnHeader}}',
                    },
                });
                fs.remove(filePath);
                const wages = result.Sheet1;
                let bulkOps = [];
                for (const wageCode of wages) {
                    const filter = { code: wageCode['Mã'], shopType, userId };
                    const update = {
                        $set: {
                            code: wageCode['Mã'],
                            amount: Number(wageCode['Công']) * 1000,
                            shopType,
                            userId,
                        },
                    };
                    const newWageCode = bulkOps.push({
                        updateOne: {
                            filter,
                            update,
                            upsert: true,
                        },
                    });
                }
                const result1 = await Wage.bulkWrite(bulkOps);
                console.log(
                    `${result1.upsertedCount} Wages inserted, ${result1.modifiedCount} Wages updated.`
                );
                return res.redirect('/wage/manager');
                // return res.status(200).json({ wages });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
module.exports = new WageController();
