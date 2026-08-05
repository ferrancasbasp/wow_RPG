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
        { rank: 1, level: 1,  min: 10, max: 14 },
        { rank: 2, level: 8,  min: 18, max: 24 },
        { rank: 3, level: 16, min: 30, max: 40 },
        { rank: 4, level: 24, min: 48, max: 60 },
        { rank: 5, level: 32, min: 72, max: 90 },
      ] },

    { id: 'ambush', name: 'Ambush', icon: '🗡️',
      school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
      baseDamage: 40, spellPowerRatio: 0, costEnergy: 60, castType: 'instant', cooldown: 0,
      description: 'Requiere estar en sigilo. Ataque sorpresa que genera 2 puntos de combo.',
      requiresStealth: true,
      generatesCombo: 2,
      damageRanges: [
        { rank: 1, level: 1,  min: 28, max: 40 },
        { rank: 2, level: 8,  min: 50, max: 68 },
        { rank: 3, level: 16, min: 85, max: 110 },
        { rank: 4, level: 24, min: 140, max: 175 },
        { rank: 5, level: 32, min: 210, max: 255 },
      ] },

    { id: 'garrote', name: 'Garrote', icon: '🩹',
      school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
      baseDamage: 10, spellPowerRatio: 0, costEnergy: 45, castType: 'instant', cooldown: 0,
      description: 'Requiere estar en sigilo. Estrangula al enemigo causando sangrado prolongado.',
      requiresStealth: true,
      generatesCombo: 1,
      noWeaponScaling: true,
      damageRanges: [
        { rank: 1, level: 1,  min: 4, max: 6 },
        { rank: 2, level: 8,  min: 8, max: 12 },
        { rank: 3, level: 16, min: 16, max: 22 },
        { rank: 4, level: 24, min: 28, max: 36 },
        { rank: 5, level: 32, min: 44, max: 56 },
      ],
      inflictsEffects: [
        { type: 'dot', name: 'Garrote', value: 8, duration: 6 },
      ],
      dotScales: true,
      dotRanges: [
        { rank: 1, level: 1,  value: 6,  duration: 6 },
        { rank: 2, level: 8,  value: 12, duration: 6 },
        { rank: 3, level: 16, value: 22, duration: 6 },
        { rank: 4, level: 24, value: 36, duration: 6 },
        { rank: 5, level: 32, value: 54, duration: 6 },
      ] },

    { id: 'backstab', name: 'Backstab', icon: '🔪',
      school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
      baseDamage: 30, spellPowerRatio: 0, costEnergy: 60, castType: 'instant', cooldown: 0,
      description: 'Requiere estar detrás del enemigo. Daño elevado que genera 1 punto de combo.',
      requiresBehind: true,
      generatesCombo: 1,
      damageRanges: [
        { rank: 1, level: 1,  min: 22, max: 32 },
        { rank: 2, level: 8,  min: 40, max: 54 },
        { rank: 3, level: 16, min: 70, max: 90 },
        { rank: 4, level: 24, min: 115, max: 145 },
        { rank: 5, level: 32, min: 175, max: 215 },
      ] },

    { id: 'sprint', name: 'Sprint', icon: '🏃',
      school: 'Físico', type: 'utility', requiredLevel: 1,
      costEnergy: 0, castType: 'instant', cooldown: 6,
      description: 'Acción gratuita que te permite moverte en el turno.',
      buff: null, applySelf: false },

    { id: 'poison_weapon', name: 'Veneno Mortal', icon: '🧪',
      school: 'Físico', type: 'utility', requiredLevel: 1,
      costEnergy: 0, castType: 'instant', cooldown: 0,
      description: 'Envenena tu arma. Los ataques hacen daño extra y pasan a ser de tipo mágico.',
      buff: { stat: 'poisonDamage', duration: 5, applySelf: true },
      buffRanks: [
        { rank: 1, level: 1,  value: 8,  costEnergy: 0 },
        { rank: 2, level: 10, value: 16, costEnergy: 0 },
        { rank: 3, level: 20, value: 28, costEnergy: 0 },
        { rank: 4, level: 30, value: 44, costEnergy: 0 },
      ] },

    { id: 'evasion', name: 'Evasión', icon: '💨',
      school: 'Físico', type: 'utility', requiredLevel: 8,
      costEnergy: 0, castType: 'instant', cooldown: 10,
      description: 'Aumenta tu probabilidad de esquivar ataques físicos temporalmente.',
      buff: { stat: 'evasion', duration: 3, applySelf: true },
      buffRanks: [
        { rank: 1, level: 8,  value: 50, costEnergy: 0 },
        { rank: 2, level: 18, value: 70, costEnergy: 0 },
        { rank: 3, level: 28, value: 90, costEnergy: 0 },
      ] },
  ],
};
