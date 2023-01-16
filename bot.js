require('dotenv').config();
const messages = require('./assets/messageOptions');
const { shouldAddHTMLParse, saveClientInDB, saveMessageInDB } = require('./assets/functions');

const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
const mongodbURL = process.env.mongodbURL;

const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.TOKEN;

const history = [];
let botQueries = 0;

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
    let queryAnswer = query.data;

    history.push(queryAnswer);
    botQueries++;

    const message = {
        callbackData: queryAnswer,
        from_id: query.from.id,
        from_name: query.from.username || query.from.id,
        date: new Date().toLocaleString(query.message.date)
    };

    saveMessageInDB(message);
    handleCallbackQuery(query, queryAnswer);
});

async function handleCallbackQuery(query, queryAnswer) {
    const messageOption = {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
    };

    const message = messages[queryAnswer];


    if (history.length === 0) {
        queryAnswer = 'startMessage';
        history.push('startMessage');

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
        history.push('startMessage');
        queryAnswer = 'startMessage';

        handleCallbackQuery(query, queryAnswer);
        return;
    }

    if (shouldAddHTMLParse(queryAnswer)) {
        Object.assign(messageOption, { parse_mode: 'HTML' });
    }


    await bot.editMessageText(message.text, messageOption);
    await bot.editMessageReplyMarkup({ inline_keyboard: message.keyboard }, messageOption);
}

// ------------------------------------------

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

bot.onText(/\/clear_db_messages/, (msg) => {
    MongoClient.connect(mongodbURL, (err, db) => {
        if (err) throw err;

        const dbo = db.db('meteorBot');

        dbo.collection('messages').deleteMany({ $all: Object }, (err, obj) => {
            if (err) throw err;
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