const {
  startKeyboard,
  adultKeyboard,
  adultSelfSwimmingKeyboard,
  childKeyboard,
  childGroupLesson,
  childCanSwimmingKeyboard,
  simpleMessageOption
} = require('./assets/keyboards');
const MongoClient = require('mongodb').MongoClient;

const TelegramBot = require('node-telegram-bot-api');
const TOKEN = '5962733251:AAGVCKRPtc1x2ACElgVZTG1G_kS7NNFl8wA';

const mongodbURL = 'mongodb://127.0.0.1:27017/';
const history = [];
let botQueries = 0;
let queryMessageId;

const bot = new TelegramBot(TOKEN, { polling: true });

// -------------------------------------------------------------

bot.onText(/\/start/, async msg => {
  const chatId = msg.chat.id;

  saveClientInDB(msg);

  history.splice(0);
  botQueries++;
  queryMessageId = msg.message_id + 3;

  await bot.sendMessage(chatId, 'Вас вітає бот босейну "Метеор" :)');
  await bot.sendMessage(
    chatId,
    'Я можу Вам розповісти про наші послуги та допомогти з вибором'
  );
  await bot.sendMessage(chatId, 'Ви підбираєте послуги для:', {
    reply_markup: { inline_keyboard: startKeyboard }
  });
});

bot.on('callback_query', query => {
  const chatId = query.message.chat.id;
  let queryAnswer = query.data;

  history.push(queryAnswer);
  botQueries++;

  handleCallbackQuery(chatId, queryAnswer);
  console.log('botQueries', botQueries);
});

async function handleCallbackQuery(chatId, queryAnswer) {
  const messageOption = {
    chat_id: chatId,
    message_id: queryMessageId
  };

  if (history.length === 0) {
    queryAnswer = 'startMessage';
  }

  try {

    switch (queryAnswer) {
      case 'startMessage':
        await bot.editMessageText('Ви підбираєте послуги для:', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: startKeyboard }, messageOption);
        break;

      case 'adult':
        await bot.editMessageText('Для дорослих в нас є:', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: adultKeyboard }, messageOption);
        break;

      case 'child':
        await bot.editMessageText('Для дітей в нас є:', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: childKeyboard }, messageOption);
        break;

      case 'adultSelfSwimming':
        await bot.editMessageText('Ви можете придбати разове відвідування або абонемент на місяць\nПідказати вартість?', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: adultSelfSwimmingKeyboard }, messageOption);
        break;

      case 'adultIndividualLesson':
        await bot.editMessageText('Тренер навчить Вас плавати або вдосканале Ваші навички, вартість одного заняття 700,00 грн\nПодзвоніть нам, ми підберемо Вам тренера та зручний час :)', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'adultGroupLesson':
        await bot.editMessageText(`Подивитись розклад та записатись можна <a href='https://my.lucky.fitness/calendar_forms/main_form?organization=1760&lang=ru&trainer=true&show_timeGrid=true&type_view=0&use_insert_lesson=false&lesson_class=3832&new_clients=false&payment_systems=false&castom_css=&select_organization=false'>тут</a>`, { ...messageOption, parse_mode: 'HTML' });
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'adultSelfSwimmingYes':
        await bot.editMessageText('Разове відвідування - 300,00 грн. При наявності пенсійного посвідчення - 200,00 грн.\n\nАбонемент на місяць:\n4 відвідування - 1100,00 грн, 8 відвідувань - 2000,00 грн', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'adultSelfSwimmingNo':
        await bot.editMessageText('еще не придумала куда его перевести', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'childGroupLesson':
        await bot.editMessageText('Який вік Вашої дитини?', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: childGroupLesson }, messageOption);
        break;

      case 'childIndividualLesson':
        await bot.editMessageText('Тренер навчить Вашу дитину плавати або вдосканале навички, вартість одного заняття 700,00 грн\nПодзвоніть нам, ми підберемо Вам тренера та зручний час :)', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'childSelfSwimming':
        await bot.editMessageText('null null null null null', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'age 0,5-3':
        await bot.editMessageText('В нас є групові заняття немовлят разом з мамою або татом\nПодивитись розклад та записатись можна тут ↓\n/посилання /', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'age 3-5':
        await bot.editMessageText('В нас є групові заняття в малій вані глибиною 60 см, в групі до 5 діточок\nПодивитись розклад та записатись можна тут ↓\n/посилання /', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'age 5-7':
        await bot.editMessageText('Пропонуємо групові заняття в малій ванні\nПодивитись розклад та записатись можна тут ↓\n/посилання /', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'age 7-14':
        await bot.editMessageText('Ваша дитина вміє плавати?', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: childCanSwimmingKeyboard }, messageOption);
        break;

      case 'childSwimmingYes':
        await bot.editMessageText('Пропонуємо групові заняття у великій ванні\nПодивитись розклад та записатись можна тут ↓\n/посилання /', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'childSwimmingNo':
        await bot.editMessageText('Пропонуємо групові заняття в малій ванні\nПодивитись розклад та записатись можна тут ↓\n/посилання /', messageOption);
        await bot.editMessageReplyMarkup({ inline_keyboard: simpleMessageOption }, messageOption);
        break;

      case 'stepBack':
        history.splice(history.length - 2, 2);
        queryAnswer = history[history.length - 1];

        handleCallbackQuery(chatId, queryAnswer);
        break;

      case 'resetMessage':
        history.splice(0);

        handleCallbackQuery(chatId, queryAnswer);
        break;

      default:
        break;
    }

  } catch (error) {
    console.log(error);
  }
}

function saveClientInDB(message) {
  const client = {
    id: message.from.id,
    name: message.from.first_name,
    username: message.from.username || message.from.id
  };

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

bot.onText(/\/clear_db/, (msg) => {
  MongoClient.connect(mongodbURL, (err, db) => {
    if (err) throw err;

    const dbo = db.db('meteorBot');

    dbo.collection('users').deleteMany({ username: /[a-z]/gmi }, (err, obj) => {
      if (err) throw err;

      console.log(obj);
      console.log(`deleted ${obj.deletedCount} document`);
      db.close();
    });
  });
});

//* сделать учет количества запросов на бота
//* сделать чтоб сообщение не отправлялось, а едителось
// делать коммиты без node_modules

// сделать кластер для mongodb
// переписать код на {текст сообщения, клавиатура}