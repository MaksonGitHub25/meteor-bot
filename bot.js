const {
  startKeyboard,
  adultKeyboard,
  adultSelfSwimmingKeyboard,
  childKeyboard,
  childGroupLesson,
  childCanSwimmingKeyboard,
  simpleMessageOption
} = require('./assets/keyboards');

const TelegramBot = require('node-telegram-bot-api');
const TOKEN = '5962733251:AAGVCKRPtc1x2ACElgVZTG1G_kS7NNFl8wA';

const bot = new TelegramBot(TOKEN, { polling: true });

const history = [];

// -------------------------------------------------------------

bot.onText(/\/start/, async msg => {
  const chatId = msg.chat.id;

  history.splice(0);

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

  //? может сделать это все через switch/case

  handleCallbackQuery(chatId, queryAnswer);

  console.log(history);
});

function handleCallbackQuery(chatId, queryAnswer) {
  if (history.length === 0) {
    queryAnswer = 'startMessage';
  }

  //? может сделать это все через switch/case

  if (queryAnswer === 'startMessage') {
    bot.sendMessage(chatId, 'Ви підбираєте послуги для:', {
      reply_markup: { inline_keyboard: startKeyboard }
    });
  }

  if (queryAnswer === 'adult') {
    bot.sendMessage(chatId, 'Для дорослих в нас є:', {
      reply_markup: { inline_keyboard: adultKeyboard }
    });
  } else if (queryAnswer === 'child') {
    bot.sendMessage(chatId, 'Для дітей в нас є:', {
      reply_markup: { inline_keyboard: childKeyboard }
    });
  }

  if (queryAnswer === 'adultSelfSwimming') {
    bot.sendMessage(
      chatId,
      'Ви можете придбати разове відвідування або абонемент на місяць\nПідказати вартість?',
      { reply_markup: { inline_keyboard: adultSelfSwimmingKeyboard } }
    );
  } else if (queryAnswer === 'adultIndividualLesson') {
    bot.sendMessage(
      chatId,
      'Тренер навчить Вас плавати або вдосканале Ваші навички, вартість одного заняття 700,00 грн\nПодзвоніть нам, ми підберемо Вам тренера та зручний час :)',
      simpleMessageOption
    );
  } else if (queryAnswer === 'adultGroupLesson') {
    bot.sendMessage(
      chatId,
      'Подивитись розклад та записатись можна тут ↓\nhttps://my.lucky.fitness/calendar_forms/main_form?organization=1760&lang=ru&trainer=true&show_timeGrid=true&type_view=0&use_insert_lesson=false&lesson_class=3832&new_clients=false&payment_systems=false&castom_css=&select_organization=false',
      //? может сделать тут ссылку в тексте через <a>???
      simpleMessageOption
    );
  }

  if (queryAnswer === 'adultSelfSwimmingYes') {
    bot.sendMessage(
      chatId,
      'Разове відвідування - 300,00 грн. При наявності пенсійного посвідчення - 200,00 грн.\n\nАбонемент на місяць:\n4 відвідування - 1100,00 грн, 8 відвідувань - 2000,00 грн',
      simpleMessageOption
    );
  } else if (queryAnswer === 'adultSelfSwimmingNo') {
    bot.sendMessage(chatId, 'еще не придумала куда его перевести', simpleMessageOption);
  }

  if (queryAnswer === 'childGroupLesson') {
    bot.sendMessage(chatId, 'Який вік Вашої дитини?', {
      reply_markup: { inline_keyboard: childGroupLesson }
    });
  } else if (queryAnswer === 'childIndividualLesson') {
    bot.sendMessage(
      chatId,
      'Тренер навчить Вашу дитину плавати або вдосканале навички, вартість одного заняття 700,00 грн\nПодзвоніть нам, ми підберемо Вам тренера та зручний час :)',
      simpleMessageOption
    );
  } else if (queryAnswer === 'childSelfSwimming') {
    bot.sendMessage(chatId, 'null null null null null', simpleMessageOption);
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  }

  if (queryAnswer === 'age 0,5-3') {
    bot.sendMessage(
      chatId,
      'В нас є групові заняття немовлят разом з мамою або татом\nПодивитись розклад та записатись можна тут ↓\n/посилання /',
      simpleMessageOption
    );
  } else if (queryAnswer === 'age 3-5') {
    bot.sendMessage(
      chatId,
      'В нас є групові заняття в малій вані глибиною 60 см, в групі до 5 діточок\nПодивитись розклад та записатись можна тут ↓\n/посилання /', 
      simpleMessageOption
    );
  } else if (queryAnswer === 'age 5-7') {
    bot.sendMessage(
      chatId,
      'Пропонуємо групові заняття в малій ванні\nПодивитись розклад та записатись можна тут ↓\n/посилання /',
      simpleMessageOption
    );
  } else if (queryAnswer === 'age 7-14') {
    bot.sendMessage(chatId, 'Ваша дитина вміє плавати?', {
      reply_markup: { inline_keyboard: childCanSwimmingKeyboard }
    });
  }

  if (queryAnswer === 'childSwimmingYes') {
    bot.sendMessage(
      chatId,
      'Пропонуємо групові заняття у великій ванні\nПодивитись розклад та записатись можна тут ↓\n/посилання /',
      simpleMessageOption
    );
  } else if (queryAnswer === 'childSwimmingNo') {
    bot.sendMessage(
      chatId,
      'Пропонуємо групові заняття в малій ванні\nПодивитись розклад та записатись можна тут ↓\n/посилання /',
      simpleMessageOption
    );
  }

  if (queryAnswer === 'stepBack') {
    history.splice(history.length - 2, 2);
    queryAnswer = history[history.length - 1];
    
    handleCallbackQuery(chatId, queryAnswer);
  } else if (queryAnswer === 'resetMessage') {
    history.splice(0);
    
    handleCallbackQuery(chatId, queryAnswer);
  }
}