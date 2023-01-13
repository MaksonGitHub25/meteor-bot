require('dotenv').config();
const messages = require('./assets/messageOptions');
const MongoClient = require('mongodb').MongoClient;

const TelegramBot = require('node-telegram-bot-api');
const { ObjectId } = require('mongodb');
const TOKEN = process.env.TOKEN;

const mongodbURL = process.env.mongodbURL;
const history = [];
let botQueries = 0;
let queryMessageId;

const bot = new TelegramBot(TOKEN, { polling: true });

// -------------------------------------------------------------

// сделать флексовый метод для пуша, чтоб нормально пушилось

bot.onText(/\/start/, async msg => {
    const chatId = msg.chat.id;

    const client = {
        id: msg.from.id,
        name: msg.from.first_name,
        username: msg.from.username || msg.from.id
    };

    const message = {
        text: msg.text,
        from_id: msg.from.id,
        from_name: msg.from.username || msg.from.id,
        date: new Date().toLocaleString(msg.date)
    };

    await saveClientInDB(client);
    await saveNewMessage(message);

    history.splice(0);
    botQueries++;
    queryMessageId = msg.message_id + 3;

    const sendingMessage = messages['startMessage'];

    // await bot.sendMessage(chatId, 'Вас вітає бот босейну "Метеор" :)');
    // await bot.sendMessage(
    //     chatId,
    //     'Я можу Вам розповісти про наші послуги та допомогти з вибором'
    // );
    // await bot.sendMessage(chatId, sendingMessage.text, {
    //     reply_markup: { inline_keyboard: sendingMessage.keyboard }
    // });
});

bot.on('callback_query', query => {
    const chatId = query.message.chat.id;
    let queryAnswer = query.data;

    history.push(queryAnswer);
    botQueries++;

    handleCallbackQuery(chatId, queryAnswer);
});

async function handleCallbackQuery(chatId, queryAnswer) {
    const messageOption = {
        chat_id: chatId,
        message_id: queryMessageId
    };

    if (history.length === 0) {
        queryAnswer = 'startMessage';
    }

    if (queryAnswer === undefined) {
        queryAnswer = history[history.length - 1];

        handleCallbackQuery(chatId, queryAnswer);
        return;
    }

    if (queryAnswer === 'stepBack') {
        history.splice(history.length - 2, 2);
        queryAnswer = history[history.length - 1];

        handleCallbackQuery(chatId, queryAnswer);
        return;
    }

    if (queryAnswer === 'resetMessage') {
        history.splice(0);

        handleCallbackQuery(chatId, queryAnswer);
        return;
    }

    if (shouldAddHTMLParse(queryAnswer)) {
        Object.assign(messageOption, { parse_mode: 'HTML' });
    }

    const message = messages[queryAnswer];
    await bot.editMessageText(message.text, messageOption);
    await bot.editMessageReplyMarkup({ inline_keyboard: message.keyboard }, messageOption);
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

async function saveNewMessage(message) {

    /*

    fucking idea for solution

    emitter.on('checkUser', () => {
        emitter.emit('saveMessage', 'method');
    });
    emitter.on('saveMessage', (method) => {
        console.log(method);
    });
    */


    isUserAlreadyRegistred(message);
    saveMessageInDB(message, 1);
}

async function saveMessageInDB(message, method) {
    console.log('start writing new message');
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        const username = message.from_name;

        console.log('[methodOfPushInSave]', method);

        // dbo.collection('messages').updateOne(
        //     { [`${username}.from_name`]: username },
        //     { [`$${method}`]: { [`${username}`]: [message] } },
        //     { upsert: true }
        // );
    });
}

async function setupUserInDB(message) {
    console.log('start create new user');
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        const username = message.from_name;

        dbo.collection('messages').insertOne({ [username]: [message] }, (err, obj) => {
            if (err) throw err;
            // console.log('Add new user');
            console.log('create new user in setup');

            db.close();
        });
    });

    return true;
}

async function isUserAlreadyRegistred(message) {
    console.log('start check');
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        const username = message.from_name;

        dbo.collection('messages').find({ [`${username}.0.from_name`]: username }).toArray((err, res) => {
            if (err) throw err;
            // console.log(res);
            console.log('end of check');

            const methodOfPush = res.length === 0 ? 'set' : 'push'
            console.log('[methodOfPushInCheck]', methodOfPush);

            return methodOfPush;

            // if (res.length === 0) return 'set'
            // else if (res.length > 0) return 'push';
        });
    });
}

bot.onText(/\/show_db_messages/, (msg) => {
    const chatId = msg.chat.id;

    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        dbo.collection('messages').find({}).toArray((err, res) => {
            if (err) throw err;

            bot.sendMessage(chatId, JSON.stringify(res) || 'nothing here');
            db.close();
        });
    });
});

bot.onText(/\/clear_db_users/, (msg) => {
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        dbo.collection('users').deleteMany({ username: /[a-z]/gmi }, (err, obj) => {
            if (err) throw err;

            console.log(`deleted ${obj.deletedCount} document`);
            db.close();
        });
    });
});

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

// bot.on('message', msg => {
//     saveMessageInDB(msg);
// });