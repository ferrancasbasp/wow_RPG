window.CLASS_REGISTRY = window.CLASS_REGISTRY || {};
window.CLASS_REGISTRY.priest = {
  name: 'Priest',
  color: '#FFFFFF',
  icon: '✨',

  formulas: {
    hp:          (s, lvl) => 30 + s.aguante * 8 + lvl * 4,
    mana:        (s, lvl) => 50 + s.intelecto * 20 + lvl * 5,
    spellPower:  (s)      => Math.round(s.intelecto * 0.5),
    attackPower: (s)      => 0,
    manaRegen:   (s)      => Math.round(s.espiritu * 0.25 + 15),
  },

  baseStats: { fuerza: 5, agilidad: 5, intelecto: 22, aguante: 15, espiritu: 25 },
  startingLevel: 1,

  statGrowth: { fuerza: 0.1, agilidad: 0.1, intelecto: 1.8, aguante: 0.5, espiritu: 1.2 },

  armor: 0,
  magicResist: 8,

  resource: {
    type: 'mana',
    label: 'Maná',
    color: '#3498db',
    max: null,
    start: 'full',
  },

  talents: [],

  abilities: [
    { id: 'smite', name: 'Smite', icon: '✨',
      school: 'Sagrado', type: 'damage', requiredLevel: 1, damageType: 'magical',
      baseDamage: 15, spellPowerRatio: 0.571, costPct: 0.08, castType: 'cast', cooldown: 0,
      description: 'Daño sagrado al enemigo.',
      damageRanges: [
        { rank: 1, level: 1,  min: 10, max: 14 },
        { rank: 2, level: 6,  min: 18, max: 24 },
        { rank: 3, level: 12, min: 32, max: 42 },
        { rank: 4, level: 18, min: 54, max: 70 },
        { rank: 5, level: 24, min: 88, max: 112 },
      ] },

    { id: 'power_word_shield', name: 'Power Word: Shield', icon: '🛡️',
      school: 'Sagrado', type: 'heal', requiredLevel: 6,
      baseDamage: 50, spellPowerRatio: 0.5, costPct: 0.09, castType: 'instant', cooldown: 4,
      description: 'Absorbe daño. Se aplica como curación temporal.',
      damageRanges: [
        { rank: 1, level: 6,  min: 45, max: 45 },
        { rank: 2, level: 12, min: 80, max: 80 },
        { rank: 3, level: 18, min: 130, max: 130 },
        { rank: 4, level: 24, min: 200, max: 200 },
      ] },

    { id: 'heal', name: 'Heal', icon: '💚',
      school: 'Sagrado', type: 'heal', requiredLevel: 1,
      baseDamage: 40, spellPowerRatio: 0.857, costPct: 0.10, castType: 'cast', cooldown: 0,
      description: 'Cura al objetivo una cantidad moderada.',
      damageRanges: [
        { rank: 1, level: 1,  min: 32, max: 42 },
        { rank: 2, level: 6,  min: 56, max: 72 },
        { rank: 3, level: 12, min: 100, max: 124 },
        { rank: 4, level: 18, min: 168, max: 204 },
        { rank: 5, level: 24, min: 260, max: 312 },
      ] },

    { id: 'renew', name: 'Renew', icon: '🌿',
      school: 'Sagrado', type: 'utility', requiredLevel: 4,
      costPct: 0.07, castType: 'instant', cooldown: 0,
      description: 'HoT que cura cada turno durante 5 turnos.',
      buff: { stat: 'hot_hp', duration: 5, applySelf: true, isHot: true },
      buffRanks: [
        { rank: 1, level: 4,  value: 15, costPct: 0.07 },
        { rank: 2, level: 10, value: 25, costPct: 0.07 },
        { rank: 3, level: 16, value: 40, costPct: 0.07 },
        { rank: 4, level: 22, value: 60, costPct: 0.07 },
        { rank: 5, level: 28, value: 85, costPct: 0.07 },
      ] },

    { id: 'power_word_fortitude', name: 'Power Word: Fortitude', icon: '💪',
      school: 'Sagrado', type: 'utility', requiredLevel: 1,
      costPct: 0.06, castType: 'instant', cooldown: 0,
      description: 'Aumenta la Aguante del objetivo. Aplicar manualmente.',
      buff: { stat: 'aguante', duration: 30 },
      buffRanks: [
        { rank: 1, level: 1,  value: 3,  costPct: 0.06 },
        { rank: 2, level: 12, value: 7,  costPct: 0.07 },
        { rank: 3, level: 24, value: 10, costPct: 0.08 },
        { rank: 4, level: 36, value: 15, costPct: 0.09 },
      ] },
  ],
};
