window.NPC_REGISTRY = window.NPC_REGISTRY || {};

window.NPC_REGISTRY['mottled_boar'] = {
  name: 'Mottled Boar',
  icon: '🐗',
  imageUrl: 'img/enemies/boar_young.jpg',
  zone: 'Elwynn Forest',
  level: 3,
  hp: 85,
  armor: 10,
  magicResist: 0,
  attacks: [
    { name: 'Charge', min: 10, max: 18, type: 'physical' },
    { name: 'Bite', min: 8, max: 14, type: 'physical' },
  ],
};

window.NPC_REGISTRY['dire_boar'] = {
  name: 'Dire Boar',
  icon: '🐗',
  imageUrl: 'img/enemies/boar_dire.jpg',
  zone: 'Elwynn Forest',
  level: 5,
  hp: 152,
  armor: 20,
  magicResist: 5,
  attacks: [
    { name: 'Charge', min: 16, max: 28, type: 'physical' },
    { name: 'Bite', min: 12, max: 22, type: 'physical' },
  ],
};

window.NPC_REGISTRY['defias_looter'] = {
  name: 'Defias Looter',
  icon: '🗡️',
  imageUrl: 'img/enemies/defias_looter.jpg',
  zone: 'Westfall',
  level: 6,
  hp: 175,
  armor: 25,
  magicResist: 5,
  attacks: [
    { name: 'Backstab', min: 18, max: 30, type: 'physical' },
    { name: 'Slash', min: 14, max: 24, type: 'physical' },
    { name: 'Pickpocket Strike', min: 12, max: 20, type: 'physical' },
  ],
};

window.NPC_REGISTRY['defias_evoker'] = {
  name: 'Defias Evoker',
  icon: '✨',
  imageUrl: 'img/enemies/defias_evoker.jpg',
  zone: 'Westfall',
  level: 7,
  hp: 198,
  armor: 10,
  magicResist: 20,
  attacks: [
    { name: 'Fire Bolt', min: 42, max: 58, type: 'magical' },
    { name: 'Frost Nova', min: 32, max: 48, type: 'magical' },
    { name: 'Arcane Missiles', min: 24, max: 40, type: 'magical' },
  ],
};

window.NPC_REGISTRY['riverpaw_gnoll'] = {
  name: 'Riverpaw Gnoll',
  icon: '🪓',
  imageUrl: 'img/enemies/gnoll_riverpaw.jpg',
  zone: 'Westfall',
  level: 6,
  hp: 210,
  armor: 25,
  magicResist: 5,
  attacks: [
    { name: 'Cleave', min: 20, max: 32, type: 'physical' },
    { name: 'Strike', min: 16, max: 26, type: 'physical' },
  ],
};

window.NPC_REGISTRY['great_goretusk'] = {
  name: 'Great Goretusk',
  icon: '🐗',
  imageUrl: 'img/enemies/boar_goretusk.jpg',
  zone: 'Redridge Mountains',
  level: 12,
  hp: 412,
  armor: 40,
  magicResist: 10,
  attacks: [
    { name: 'Gore', min: 32, max: 50, type: 'physical' },
    { name: 'Savage Bite', min: 24, max: 40, type: 'physical' },
    { name: 'Trample', min: 20, max: 60, type: 'physical' },
  ],
};

window.NPC_REGISTRY['riverpaw_bone_chanter'] = {
  name: 'Riverpaw Bone Chanter',
  icon: '🦴',
  imageUrl: 'img/enemies/gnoll_bone_chanter.jpg',
  zone: 'Redridge Mountains',
  level: 13,
  hp: 475,
  armor: 35,
  magicResist: 25,
  attacks: [
    { name: 'Bone Strike', min: 36, max: 56, type: 'physical' },
    { name: 'Shadow Bolt', min: 52, max: 72, type: 'magical' },
    { name: 'Cursed Howl', min: 44, max: 88, type: 'magical' },
  ],
};

window.NPC_REGISTRY['elder_goretusk'] = {
  name: 'Elder Goretusk',
  icon: '🐗',
  imageUrl: 'img/enemies/boar_elder_goretusk.jpg',
  zone: 'Redridge Mountains',
  level: 15,
  hp: 585,
  armor: 55,
  magicResist: 15,
  attacks: [
    { name: 'Gore', min: 44, max: 68, type: 'physical' },
    { name: 'Savage Bite', min: 34, max: 54, type: 'physical' },
    { name: 'Trample', min: 28, max: 82, type: 'physical' },
  ],
};
