window.NPC_REGISTRY = window.NPC_REGISTRY || {};

window.NPC_REGISTRY['young_boar'] = {
  name: 'Cerdo Joven',
  icon: '🐗',
  level: 2,
  hp: 120,
  armor: 15,
  magicResist: 0,
  attacks: [
    { name: 'Embestida', min: 5, max: 8, type: 'physical' },
  ],
};

window.NPC_REGISTRY['dire_boar'] = {
  name: 'Jabalí Feroz',
  icon: '🐗',
  level: 5,
  hp: 280,
  armor: 30,
  magicResist: 5,
  attacks: [
    { name: 'Embestida', min: 12, max: 18, type: 'physical' },
    { name: 'Mordisco', min: 8, max: 14, type: 'physical' },
  ],
};
