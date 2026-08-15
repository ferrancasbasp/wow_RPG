window.NPC_REGISTRY = window.NPC_REGISTRY || {};

window.NPC_REGISTRY['mottled_boar'] = {
  name: 'Mottled Boar',
  icon: '🐗',
  imageUrl: 'img/enemies/boar_young.jpg',
  level: 3,
  hp: 85,
  armor: 10,
  magicResist: 0,
  attacks: [
    { name: 'Charge', min: 4, max: 7, type: 'physical' },
    { name: 'Bite', min: 3, max: 5, type: 'physical' },
  ],
};

window.NPC_REGISTRY['dire_boar'] = {
  name: 'Dire Boar',
  icon: '🐗',
  imageUrl: 'img/enemies/boar_dire.jpg',
  level: 5,
  hp: 152,
  armor: 20,
  magicResist: 5,
  attacks: [
    { name: 'Charge', min: 7, max: 12, type: 'physical' },
    { name: 'Bite', min: 5, max: 9, type: 'physical' },
  ],
};

window.NPC_REGISTRY['great_goretusk'] = {
  name: 'Great Goretusk',
  icon: '🐗',
  imageUrl: 'img/enemies/boar_goretusk.jpg',
  level: 12,
  hp: 412,
  armor: 40,
  magicResist: 10,
  attacks: [
    { name: 'Gore', min: 14, max: 22, type: 'physical' },
    { name: 'Savage Bite', min: 10, max: 18, type: 'physical' },
    { name: 'Trample', min: 8, max: 26, type: 'physical' },
  ],
};

window.NPC_REGISTRY['elder_goretusk'] = {
  name: 'Elder Goretusk',
  icon: '🐗',
  imageUrl: 'img/enemies/boar_elder_goretusk.jpg',
  level: 15,
  hp: 585,
  armor: 55,
  magicResist: 15,
  attacks: [
    { name: 'Gore', min: 20, max: 32, type: 'physical' },
    { name: 'Savage Bite', min: 15, max: 25, type: 'physical' },
    { name: 'Trample', min: 12, max: 38, type: 'physical' },
  ],
};
