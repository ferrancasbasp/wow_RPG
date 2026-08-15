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

window.NPC_REGISTRY['defias_looter'] = {
  name: 'Defias Looter',
  icon: '🗡️',
  imageUrl: 'img/enemies/defias_looter.jpg',
  level: 6,
  hp: 175,
  armor: 25,
  magicResist: 5,
  attacks: [
    { name: 'Backstab', min: 8, max: 14, type: 'physical' },
    { name: 'Slash', min: 6, max: 11, type: 'physical' },
    { name: 'Pickpocket Strike', min: 5, max: 10, type: 'physical' },
  ],
};

window.NPC_REGISTRY['defias_evoker'] = {
  name: 'Defias Evoker',
  icon: '✨',
  imageUrl: 'img/enemies/defias_evoker.jpg',
  level: 7,
  hp: 198,
  armor: 10,
  magicResist: 20,
  attacks: [
    { name: 'Fire Bolt', min: 10, max: 16, type: 'magical' },
    { name: 'Frost Nova', min: 7, max: 12, type: 'magical' },
    { name: 'Arcane Missiles', min: 5, max: 9, type: 'magical' },
  ],
};

window.NPC_REGISTRY['riverpaw_gnoll'] = {
  name: 'Riverpaw Gnoll',
  icon: '🪓',
  imageUrl: 'img/enemies/gnoll_riverpaw.jpg',
  level: 6,
  hp: 210,
  armor: 25,
  magicResist: 5,
  attacks: [
    { name: 'Cleave', min: 9, max: 15, type: 'physical' },
    { name: 'Strike', min: 7, max: 12, type: 'physical' },
  ],
};

window.NPC_REGISTRY['riverpaw_bone_chanter'] = {
  name: 'Riverpaw Bone Chanter',
  icon: '🦴',
  imageUrl: 'img/enemies/gnoll_bone_chanter.jpg',
  level: 13,
  hp: 475,
  armor: 35,
  magicResist: 25,
  attacks: [
    { name: 'Bone Strike', min: 16, max: 26, type: 'physical' },
    { name: 'Shadow Bolt', min: 12, max: 22, type: 'magical' },
    { name: 'Cursed Howl', min: 10, max: 30, type: 'magical' },
  ],
};
