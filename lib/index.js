import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';

const db = {
    sensorCollection: 'sensorData',
};

async function init() {

    const mongo = await MongoClient.connect(process.env.MONGODB_URI);
    
    const http = express();

    http.use(bodyParser.json());
    
    http.get('/api/sensor', async function(req, res) {
        try {
            const data = await mongo.collection(db.sensorCollection).distinct('sensorId');
            res.json(data);
        } catch(err) {
            console.error(err);
            res.status(500).send('Error');
        }
    });

    http.post('/api/sensor', async function(req, res) {
        try {

            const data = Object.assign({}, req.body, {
                timestamp: new Date().getTime(),
                ipAddress: req.connection.remoteAddress,
            })
            console.log(data);
            await mongo.collection(db.sensorCollection).insert(data);
            res.json({msg: 'ok'});
        } catch(err) {
            res.status(500).send('Error');
        }
    })

    http.get('/api/sensor/:id', async function(req, res) {
        try {
            const sensorId = req.params['id'];
            const limit = +req.query['limit'] || 10;
            const data = await mongo.collection(db.sensorCollection).find({sensorId}).sort({timestamp: -1}).limit(limit).toArray();
            res.json(data);
        } catch(err) {
            res.status(500).send('Error');
        }
    });

    http.listen(process.env.PORT, function () {
        console.log(`Example app listening on port ${process.env.PORT}!`);
    });

}

init();