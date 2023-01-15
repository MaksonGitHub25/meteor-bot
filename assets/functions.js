require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const mongodbURL = process.env.mongodbURL;


function shouldAddHTMLParse(answer) {
    if (answer === 'adultGroupLesson' ||
        answer === 'age 0,5-3' ||
        answer === 'age 3-5' ||
        answer === 'age 5-7' ||
        answer === 'childSwimmingYes' ||
        answer === 'childSwimmingNo') {
        return true;
    }
}

async function saveClientInDB(client) {
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');
        let users;

        dbo.collection('users').find({}).toArray((err, result) => {
            if (err) throw err;

            users = result;

            const isRepite = users.some(user => user.id === client.id);
            if (!isRepite) {
                dbo.collection('users').insertOne(client, async (err, res) => {
                    if (err) throw err;
                    db.close();
                });
            }
        });
    });
}

function saveMessageInDB(message) {
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        const username = message.from_name;

        dbo.collection('messages').find({ [`${username}.0.from_name`]: username }).toArray((err, res) => {
            if (err) throw err;

            const method = res.length === 0 ? 'set' : 'push';
            const messageForPush = method === 'set' ? [message] : message;

            dbo.collection('messages').updateOne(
                { [`${username}.from_name`]: username },
                { [`$${method}`]: { [`${username}`]: messageForPush } },
                { upsert: true }
            );
        });
    });
}

module.exports = {
    shouldAddHTMLParse,
    saveClientInDB,
    saveMessageInDB
};