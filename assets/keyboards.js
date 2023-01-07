const startKeyboard = [
  [
    { text: 'Дорослого', callback_data: 'adult' },
    { text: 'Дитини', callback_data: 'child' }
  ]
];

const adultKeyboard = [
  [{ text: 'Самостійне плавання', callback_data: 'adultSelfSwimming' }],
  [{ text: 'Індивідуальні заняття', callback_data: 'adultIndividualLesson' }],
  [{ text: 'Групові заняття', callback_data: 'adultGroupLesson' }],
  [
    { text: '◀️', callback_data: 'stepBack' },
    { text: '⏪', callback_data: 'resetMessage' }
  ]
];

const adultSelfSwimmingKeyboard = [
  [
    { text: 'Так', callback_data: 'adultSelfSwimmingYes' },
    { text: 'Ні', callback_data: 'adultSelfSwimmingNo' }
  ],
  [
    { text: '◀️', callback_data: 'stepBack' },
    { text: '⏪', callback_data: 'resetMessage' }
  ]
];

const childKeyboard = [
  [{ text: 'Групові заняття', callback_data: 'childGroupLesson' }],
  [{ text: 'Індивідуальні заняття', callback_data: 'childIndividualLesson' }],
  [{ text: 'Самостійне плавання', callback_data: 'childSelfSwimming' }],
  [
    { text: '◀️', callback_data: 'stepBack' },
    { text: '⏪', callback_data: 'resetMessage' }
  ]
];

const childGroupLesson = [
  [{ text: '0,5-3 роки', callback_data: 'age 0,5-3' }],
  [{ text: '3-5 років', callback_data: 'age 3-5' }],
  [{ text: '5-7 років', callback_data: 'age 5-7' }],
  [{ text: '7-14 років', callback_data: 'age 7-14' }],
  [
    { text: '◀️', callback_data: 'stepBack' },
    { text: '⏪', callback_data: 'resetMessage' }
  ]
];

const childCanSwimmingKeyboard = [
  [
    { text: 'Так', callback_data: 'childSwimmingYes' },
    { text: 'Ні', callback_data: 'childSwimmingNo' }
  ],
  [
    { text: '◀️', callback_data: 'stepBack' },
    { text: '⏪', callback_data: 'resetMessage' }
  ]
];

const simpleMessageOption = [
  [
    { text: '◀️', callback_data: 'stepBack' },
    { text: '⏪', callback_data: 'resetMessage' }
  ]
];

module.exports = {
  startKeyboard,
  adultKeyboard,
  adultSelfSwimmingKeyboard,
  childKeyboard,
  childGroupLesson,
  childCanSwimmingKeyboard,
  simpleMessageOption
};
