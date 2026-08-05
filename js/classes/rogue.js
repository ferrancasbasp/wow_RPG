window.CLASS_REGISTRY = window.CLASS_REGISTRY || {};
window.CLASS_REGISTRY.rogue = {
  name: 'Rogue',
  color: '#FFF569',
  icon: '🗡️',

  formulas: {
    hp:          (s, lvl) => 35 + s.aguante * 9 + lvl * 5,
    mana:        () => 0,
    spellPower:  () => 0,
    attackPower: (s) => s.fuerza * 2 + s.agilidad * 2 + 10,
    manaRegen:   () => 0,
  },

  baseStats: { fuerza: 15, agilidad: 25, intelecto: 5, aguante: 18, espiritu: 10 },
  startingLevel: 1,

  statGrowth: { fuerza: 0.5, agilidad: 2.2, intelecto: 0.1, aguante: 1.2, espiritu: 0.3 },

  armor: 4,
  magicResist: 2,

  resource: {
    type: 'energy',
    label: 'Energía',
    color: '#f1c40f',
    max: 100,
    start: 100,
    regen: 20,
  },

  talents: [],

  abilities: [
    { id: 'basic_attack', name: 'Basic Attack', icon: '👊', iconImg: 'img/abilities/rogue/basic_attack.jpg',
      school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
      baseDamage: 15, spellPowerRatio: 0, costEnergy: 0, castType: 'instant', cooldown: 0,
      description: 'Un golpe básico que no gasta energía.',
      damageRanges: [
        { rank: 1, level: 1,  min: 10, max: 16 },
        { rank: 2, level: 6,  min: 18, max: 26 },
        { rank: 3, level: 12, min: 32, max: 44 },
        { rank: 4, level: 18, min: 54, max: 72 },
        { rank: 5, level: 24, min: 88, max: 116 },
      ] },

    { id: 'sinister_strike', name: 'Sinister Strike', icon: '🗡️',
      school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
      baseDamage: 20, spellPowerRatio: 0, costEnergy: 40, castType: 'instant', cooldown: 0,
      description: 'Un golpe rápido que gasta energía y genera 1 punto de combo.',
      generatesCombo: 1,
      damageRanges: [
        { rank: 1, level: 1,  min: 18, max: 26 },
        { rank: 2, level: 6,  min: 30, max: 42 },
        { rank: 3, level: 12, min: 52, max: 70 },
        { rank: 4, level: 18, min: 84, max: 110 },
        { rank: 5, level: 24, min: 132, max: 172 },
      ] },

    { id: 'eviscerate', name: 'Eviscerate', icon: '🩸',
      school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
      baseDamage: 0, spellPowerRatio: 0, costEnergy: 35, castType: 'instant', cooldown: 0,
      description: 'Termina el combo. Gasta todos los puntos de combo. Más puntos = más daño.',
      spendsCombo: true,
      noWeaponScaling: true,
      damageRanges: [
        { rank: 1, level: 1,  min: 15,  max: 22 },
        { rank: 2, level: 8,  min: 27,  max: 38 },
        { rank: 3, level: 16, min: 45,  max: 60 },
        { rank: 4, level: 24, min: 68,  max: 88 },
        { rank: 5, level: 32, min: 102, max: 128 },
      ] },
  ],
};
