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

    { id: 'improved_heroic_strike', name: 'Golpe Heroico Mejorado', icon: '⚔️',
      description: 'Reduce el coste de ira de Golpe Heroico en 1 por punto.',
      maxRank: 5, tier: 1, requires: null },

    { id: 'anticipation', name: 'Anticipación', icon: '🛡️',
      description: 'Aumenta tu armadura física en 1 por punto.',
      maxRank: 5, tier: 1, requires: null },

    { id: 'improved_bloodrage', name: 'Blood Rage Mejorada', icon: '🩸',
      description: 'Aumenta la ira otorgada por Blood Rage en 3 por punto.',
      maxRank: 2, tier: 2, requires: null },

    { id: 'improved_charge', name: 'Carga Mejorada', icon: '🏃',
      description: 'Aumenta la ira generada por Carga en 2 por punto.',
      maxRank: 2, tier: 2, requires: null },

    { id: 'cruelty', name: 'Crueldad', icon: '💢',
      description: 'Aumenta tu probabilidad de crítico físico un 1% por punto.',
      maxRank: 5, tier: 2, requires: null },
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
      school: 'Físico', type: 'damage', requiredLevel: 4, damageType: 'physical',
      baseDamage: 0, spellPowerRatio: 0, costRage: 0, generatesRage: 10, castType: 'instant', cooldown: 3,
      description: 'Carga hacia el enemigo, aturdiéndolo y generando ira.',
      damageRanges: [
        { rank: 1, level: 4,  min: 0, max: 0 },
      ],
      inflictsEffects: [
        { type: 'status', name: 'Aturdido', target: 'stunned', value: 0, duration: 1 },
      ],
      stunRanks: [
        { rank: 1, level: 4,  duration: 1 },
        { rank: 2, level: 20, duration: 2 },
        { rank: 3, level: 36, duration: 3 },
      ] },

    { id: 'rend', name: 'Desgarrar', icon: '🩸',
      school: 'Físico', type: 'damage', requiredLevel: 6, damageType: 'physical',
      baseDamage: 10, spellPowerRatio: 0, costRage: 5, generatesRage: 0, castType: 'instant', cooldown: 0,
      description: 'Causa sangrado al enemigo. No escala con arma, solo con nivel.',
      damageRanges: [
        { rank: 1, level: 6,  min: 4,  max: 6 },
        { rank: 2, level: 12, min: 8,  max: 12 },
        { rank: 3, level: 18, min: 16, max: 22 },
        { rank: 4, level: 24, min: 28, max: 36 },
      ],
      inflictsEffects: [
        { type: 'dot', name: 'Desgarrar', value: 8, duration: 5 },
      ],
      dotScales: true,
      dotRanges: [
        { rank: 1, level: 6,  value: 4,  duration: 5 },
        { rank: 2, level: 12, value: 8,  duration: 5 },
        { rank: 3, level: 18, value: 16, duration: 5 },
        { rank: 4, level: 24, value: 28, duration: 5 },
      ] },

    { id: 'shout', name: 'Grito de Batalla', icon: '📢',
      school: 'Físico', type: 'utility', requiredLevel: 8,
      costRage: 10, castType: 'instant', cooldown: 0,
      description: 'Aumenta el Poder de Ataque de todo el equipo.',
      buff: { stat: 'attackPower', duration: 6, applySelf: true },
      buffRanks: [
        { rank: 1, level: 8,  value: 30, costRage: 10 },
        { rank: 2, level: 18, value: 60, costRage: 10 },
        { rank: 3, level: 28, value: 100, costRage: 10 },
      ] },

    { id: 'taunt', name: 'Desafiar', icon: '🗯️',
      school: 'Físico', type: 'utility', requiredLevel: 4,
      costRage: 0, castType: 'instant', cooldown: 4,
      description: 'Obliga al enemigo a atacarte durante su próximo turno.',
      buff: null, applySelf: false },

    { id: 'bloodrage', name: 'Blood Rage', icon: '🩸',
      school: 'Físico', type: 'utility', requiredLevel: 2,
      costRage: 0, castType: 'instant', cooldown: 10,
      description: 'Pierde 15% de vida máxima y gana 20 de ira. No usable en estancia Defensiva.',
      buff: null, applySelf: false,
      blockedStance: 'protection',
      healthCostPct: 0.15,
      rageGain: 20 },

    { id: 'last_stand', name: 'Última Esperanza', icon: '🛡️',
      school: 'Físico', type: 'utility', requiredLevel: 18,
      costRage: 0, castType: 'instant', cooldown: 10,
      description: 'Aumenta tu vida máxima un 20% durante 4 turnos. El % de vida actual se mantiene.',
      buff: { stat: 'maxHP', duration: 4, applySelf: true, isPercent: true },
      buffRanks: [
        { rank: 1, level: 18, value: 20, costRage: 0 },
      ] },

    { id: 'group_last_stand', name: 'Muro de Hierro', icon: '🏰',
      school: 'Físico', type: 'utility', requiredLevel: 36,
      costRage: 0, castType: 'instant', cooldown: 8,
      description: 'Aumenta la vida máxima de todo el grupo un 20% durante 4 turnos. Cada jugador debe aplicarse el buff manualmente.',
      buff: { stat: 'maxHP', duration: 4, applySelf: false, isPercent: true },
      buffRanks: [
        { rank: 1, level: 36, value: 20, costRage: 0 },
      ] },
  ],
};
