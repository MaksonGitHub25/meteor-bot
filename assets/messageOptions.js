const {
    startKeyboard,
    adultKeyboard,
    adultSelfSwimmingKeyboard,
    childKeyboard,
    childGroupLesson,
    childCanSwimmingKeyboard,
    simpleMessageOption
} = require('./keyboards');

const messages = {
    startMessage: {
        text: 'Ви підбираєте послуги для:',
        keyboard: startKeyboard
    },
    adult: {
        text: 'Для дорослих в нас є:',
        keyboard: adultKeyboard
    },
    child: {
        text: 'Для дітей в нас є:',
        keyboard: childKeyboard
    },
    adultSelfSwimming: {
        text: 'Ви можете придбати разове відвідування або абонемент на місяць\nПідказати вартість?',
        keyboard: adultSelfSwimmingKeyboard
    },
    adultIndividualLesson: {
        text: 'Тренер навчить Вас плавати або вдосканале Ваші навички, вартість одного заняття 700,00 грн\nПодзвоніть нам, ми підберемо Вам тренера та зручний час :)',
        keyboard: simpleMessageOption
    },
    adultGroupLesson: {
        text: `Подивитись розклад та записатись можна <a href='https://my.lucky.fitness/calendar_forms/main_form?organization=1760&lang=ru&trainer=true&show_timeGrid=true&type_view=0&use_insert_lesson=false&lesson_class=3832&new_clients=false&payment_systems=false&castom_css=&select_organization=false'>тут</a>`,
        keyboard: simpleMessageOption
    },
    adultSelfSwimmingYes: {
        text: 'Разове відвідування - 300,00 грн. При наявності пенсійного посвідчення - 200,00 грн.\n\nАбонемент на місяць:\n4 відвідування - 1100,00 грн, 8 відвідувань - 2000,00 грн',
        keyboard: simpleMessageOption
    },
    adultSelfSwimmingNo: {
        text: 'еще не придумала куда его перевести',
        keyboard: simpleMessageOption
    },
    childGroupLesson: {
        text: 'Який вік Вашої дитини?',
        keyboard: childGroupLesson
    },
    childIndividualLesson: {
        text: 'Тренер навчить Вашу дитину плавати або вдосканале навички, вартість одного заняття 700,00 грн\nПодзвоніть нам, ми підберемо Вам тренера та зручний час :)',
        keyboard: simpleMessageOption
    },
    childSelfSwimming: {
        text: 'null null null null null',
        keyboard: simpleMessageOption
    },
    'age 0,5-3': {
        text: 'В нас є групові заняття немовлят разом з мамою або татом\nПодивитись розклад та записатись можна тут ↓\n/посилання /',
        keyboard: simpleMessageOption
    },
    'age 3-5': {
        text: 'В нас є групові заняття в малій вані глибиною 60 см, в групі до 5 діточок\nПодивитись розклад та записатись можна тут ↓\n/посилання /',
        keyboard: simpleMessageOption
    },
    'age 5-7': {
        text: 'Пропонуємо групові заняття в малій ванні\nПодивитись розклад та записатись можна тут ↓\n/посилання /',
        keyboard: simpleMessageOption
    },
    'age 7-14': {
        text: 'Ваша дитина вміє плавати?',
        keyboard: childCanSwimmingKeyboard
    },
    childSwimmingYes: {
        text: 'Пропонуємо групові заняття у великій ванні\nПодивитись розклад та записатись можна тут ↓\n/посилання /',
        keyboard: simpleMessageOption
    },
    childSwimmingNo: {
        text: 'Пропонуємо групові заняття в малій ванні\nПодивитись розклад та записатись можна тут ↓\n/посилання /',
        keyboard: simpleMessageOption
    },
};

module.exports = messages;