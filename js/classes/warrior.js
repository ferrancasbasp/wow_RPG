window.CLASS_REGISTRY = window.CLASS_REGISTRY || {};
window.CLASS_REGISTRY.warrior = {
  name: 'Guerrero',
  color: '#C79C6E',
  icon: '⚔️',

  formulas: {
    hp:          (s, lvl) => 40 + s.aguante * 10 + lvl * 6,
    mana:        () => 0,
    spellPower:  () => 0,
    attackPower: (s) => s.fuerza * 2 + 20,
    manaRegen:   () => 0,
  },

  baseStats: { fuerza: 25, agilidad: 12, intelecto: 5, aguante: 22, espiritu: 8 },
  startingLevel: 1,

  statGrowth: { fuerza: 2.0, agilidad: 0.5, intelecto: 0.1, aguante: 1.5, espiritu: 0.3 },

  armor: 8,
  magicResist: 2,

  resource: {
    type: 'rage',
    label: 'Ira',
    color: '#c0392b',
    max: 100,
    start: 0,
  },

  talents: [
    { id: 'master_of_weapons', name: 'Maestría de Armas', icon: '⚔️',
      description: 'El guerrero es experto en todo tipo de armamento. Puede empuñar un arma a dos manos o combinar un arma de una mano con una off hand, y ambos contribuyen a sus stats y daño.',
      maxRank: 1, tier: 1, requires: null, passive: true, requiredLevel: 2 },
  ],

  stances: [
    { id: 'battle',      name: 'Battle',     icon: '⚔️', effect: 'damageBonus', value: 0.10 },
    { id: 'fury',        name: 'Fury',       icon: '😤', effect: 'critBonus',   value: 5 },
    { id: 'protection',  name: 'Protection', icon: '🛡️', effect: 'armorBonus',  value: 5 },
  ],

  abilities: [
    { id: 'basic_attack', name: 'Ataque Básico', icon: '👊',
      school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
      baseDamage: 20, spellPowerRatio: 0, costRage: 0, generatesRage: 5, castType: 'instant', cooldown: 0,
      description: 'Un golpe básico que genera ira. El daño depende del arma equipada.',
      damageRanges: [
        { rank: 1, level: 1, min: 16, max: 24 },
        { rank: 2, level: 6, min: 28, max: 40 },
        { rank: 3, level: 12, min: 48, max: 68 },
        { rank: 4, level: 18, min: 80, max: 110 },
        { rank: 5, level: 24, min: 130, max: 175 },
      ] },

    { id: 'heroic_strike', name: 'Golpe Heroico', icon: '⚔️',
      school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
      baseDamage: 20, spellPowerRatio: 0, costRage: 15, generatesRage: 0, castType: 'instant', cooldown: 0,
      description: 'Un golpe potente que gasta ira para hacer daño extra.',
      damageRanges: [
        { rank: 1, level: 1, min: 32, max: 48 },
        { rank: 2, level: 6, min: 52, max: 74 },
        { rank: 3, level: 12, min: 84, max: 116 },
        { rank: 4, level: 18, min: 136, max: 184 },
        { rank: 5, level: 24, min: 210, max: 280 },
      ] },

    { id: 'charge', name: 'Carga', icon: '🏃',
      school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
      baseDamage: 0, spellPowerRatio: 0, costRage: 0, generatesRage: 10, castType: 'instant', cooldown: 3,
      description: 'Carga hacia el enemigo, aturdiéndolo y generando ira.',
      damageRanges: [
        { rank: 1, level: 1, min: 0, max: 0 },
      ],
      inflictsEffects: [
        { type: 'status', name: 'Aturdido', target: 'stunned', value: 0, duration: 1 },
      ] },
  ],
};
