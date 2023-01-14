require('dotenv').config();
const messages = require('./assets/messageOptions');
const fs = require('fs');

const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
const mongodbURL = process.env.mongodbURL;

const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.TOKEN;

const history = [];
let botQueries = 0;
let queryMessageId = 'queryMessageId haven\'t set yet';

const bot = new TelegramBot(TOKEN, { polling: true });

// -------------------------------------------------------------

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    const client = {
        id: msg.from.id,
        name: msg.from.first_name,
        username: msg.from.username || msg.from.id
    };

    saveClientInDB(client);

    history.splice(0);
    botQueries++;


    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        dbo.collection('users').find({ username: msg.from.username }).toArray((err, res) => {
            if (err) throw err;
            console.log(res);

            const messageId = res[0].queryMessageId || 'queryMessageId haven\'t set yet';
            queryMessageId = typeof messageId !== 'number'
                ? messageId
                : messageId + 3;

            if (typeof queryMessageId === 'number') {
                dbo.collection('users').updateOne(
                    { username: msg.from.username },
                    { $set: { queryMessageId: queryMessageId } },
                    { upsert: true }
                );
            }
        });
    });


    const sendingMessage = messages['startMessage'];

    await bot.sendMessage(chatId, 'Вас вітає бот босейну "Метеор" :)');
    await bot.sendMessage(
        chatId,
        'Я можу Вам розповісти про наші послуги та допомогти з вибором'
    );
    await bot.sendMessage(chatId, sendingMessage.text, {
        reply_markup: { inline_keyboard: sendingMessage.keyboard }
    });
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    let queryAnswer = query.data;

    history.push(queryAnswer);
    botQueries++;

    const message = {
        callbackData: queryAnswer,
        from_id: query.from.id,
        from_name: query.from.username || query.from.id,
        date: new Date().toLocaleString(query.message.date)
    };

    await saveMessageInDB(message);
    await handleCallbackQuery(query, queryAnswer);
});

async function handleCallbackQuery(query, queryAnswer) {
    const messageOption = {
        chat_id: query.message.chat.id,
        message_id: queryMessageId
    };

    // MongoClient.connect(mongodbURL, (err, db) => {
    //     if (err) throw err;

    //     const dbo = db.db('meteorBot');

    //     dbo.collection('users').find({ username: query.from.username }).toArray((err, res) => {
    //         if (err) throw err;
    //         console.log(res);

    //         const messageId = res[0].queryMessageId || 'queryMessageId haven\'t set yet';
    //         queryMessageId = typeof messageId !== 'number'
    //             ? messageId
    //             : messageId + 3;
    //     });
    // });

    if (history.length === 0) {
        queryAnswer = 'startMessage';

        handleCallbackQuery(query, queryAnswer);
        return;
    }

    if (queryAnswer === undefined) {
        queryAnswer = history[history.length - 1];

        handleCallbackQuery(query, queryAnswer);
        return;
    }

    if (queryAnswer === 'stepBack') {
        history.splice(history.length - 2, 2);
        queryAnswer = history[history.length - 1];

        handleCallbackQuery(query, queryAnswer);
        return;
    }

    if (queryAnswer === 'resetMessage') {
        history.splice(0);

        handleCallbackQuery(query, queryAnswer);
        return;
    }

    if (shouldAddHTMLParse(queryAnswer)) {
        Object.assign(messageOption, { parse_mode: 'HTML' });
    }

    if (queryMessageId === 'queryMessageId haven\'t set yet') {
        queryAnswer = 'startMessage';

        handleCallbackQuery(query, queryAnswer);
        return;
    }

    const message = messages[queryAnswer];
    console.log(messageOption);
    // await bot.editMessageText(message.text, messageOption);
    // await bot.editMessageReplyMarkup({ inline_keyboard: message.keyboard }, messageOption);
}

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

// ------------------------------------------

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
                    console.log('1 document inserted');
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

bot.on('message', (msg) => {
    const message = {
        text: msg.text,
        from_id: msg.from.id,
        from_name: msg.from.username || msg.from.id,
        date: new Date().toLocaleString(msg.date)
    };

    saveMessageInDB(message);
});

// ------------------------------------------

async function readQueryMessageId(username) {
    console.log('start read');
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        dbo.collection('users').find({ username: username }).toArray((err, res) => {
            if (err) throw err;
            console.log(res);

            return res[0].queryMessageId || 'queryMessageId haven\'t set yet';
        });
    });
}

function writeQueryMessageId(username, queryMessageId) {
    console.log('start write');
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        dbo.collection('users').updateOne(
            { username: username },
            { $set: { queryMessageId: queryMessageId } },
            { upsert: true }
        );
    });
}

// ------------------------------------------

bot.onText(/\/clear_db_messages/, (msg) => {
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        dbo.collection('messages').deleteMany({ $all: Object }, (err, obj) => {
            if (err) throw err;

            console.log(`deleted ${obj.deletedCount} document`);
            db.close();
        });
    });
});

bot.onText(/\/delete_document (.+)/, (msg, match) => {
    const idObject = match[1];
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        dbo.collection('messages').deleteOne({ "_id": ObjectId(`${idObject}`) }, (err, obj) => {
            if (err) throw err;
            console.log(`deleted ${obj.deletedCount} document`);
            db.close();
        });
    });
});