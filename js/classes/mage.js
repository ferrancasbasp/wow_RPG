/* ================================================================
   MAGO — PLANTILLA DE CLASE
   ================================================================
   Este archivo es una plantilla comentada para crear nuevas clases.
   Cópialo, renómbralo y adapta los valores.

   Estructura de un archivo de clase:
     1. Registro:        window.CLASS_REGISTRY.<clave> = { ... }
     2. Metadatos:       name, color, icon
     3. Fórmulas:        hp, mana, spellPower, attackPower, manaRegen
     4. Atributos base:  baseStats, startingLevel
     5. Talentos:        array de objetos con id, name, effects, requires
     6. Habilidades:     array de objetos con damage, cost, scaling

   Recuerda anadir el tag de script de mage.js en index.html

   Y registrar los efectos de talentos en index.html:
     - computedAbilities() → cómo afecta al daño/coste
     - getTalentEffectText() → texto que se muestra en la tarjeta
   ================================================================ */

window.CLASS_REGISTRY = window.CLASS_REGISTRY || {};
window.CLASS_REGISTRY.mage = {
  /* --- METADATOS --- */
  name: 'Mago',
  color: '#3FC7EB',
  icon: '🔥',
  iconImg: 'img/classes/mage.jpg',

  /* ---------------------------------------------------------------
     FÓRMULAS DE DERIVACIÓN
     (s, lvl) → s = atributos finales, lvl = nivel
     --------------------------------------------------------------- */
  formulas: {
    hp:          (s, lvl) => 30 + s.aguante * 8 + lvl * 4,
    mana:        (s, lvl) => 50 + s.intelecto * 20 + lvl * 5,
    spellPower:  (s)      => Math.round(s.intelecto * 0.7),
    attackPower: (s)      => 0,
    manaRegen:   (s)      => Math.round(s.espiritu * 0.25 + 15),
  },

  /* Atributos base al crear un personaje de esta clase (nivel 1) */
  baseStats: { fuerza: 3, agilidad: 3, intelecto: 20, aguante: 14, espiritu: 18 },
  startingLevel: 1,

  /* Crecimiento de stats por nivel (valores de WoW Classic) */
  statGrowth: { fuerza: 0.05, agilidad: 0.05, intelecto: 1.8, aguante: 0.5, espiritu: 0.9 },

  armor: 0,
  magicResist: 5,

  resource: {
    type: 'mana',
    label: 'Maná',
    color: '#3498db',
    max: null,
    start: 'full',
  },

  /* ---------------------------------------------------------------
     TALENTOS — una sola rama
     --------------------------------------------------------------- */

  talents: [
    /* === TIER 1 (nivel 10) === */
    { id: 'elemental_mastery', name: 'Maestría Elemental', icon: '🔥', iconImg: 'img/talents/mage/ignite.jpg',
      description: 'Aumenta el daño de todos tus hechizos un 1% por punto.',
      maxRank: 5, tier: 1, requires: null },

    { id: 'mana_efficiency', name: 'Eficiencia Arcana', icon: '✨', iconImg: 'img/talents/mage/arcane_concentration.jpg',
      description: 'Reduce el coste de maná de todos tus hechizos un 2% por punto.',
      maxRank: 5, tier: 1, requires: null },

    /* === TIER 2 (nivel 15) === */
    { id: 'improved_arcane_intellect', name: 'Intelecto Arcano Mejorado', icon: '🧠', iconImg: 'img/talents/mage/arcane_mind.jpg',
      description: 'Aumenta el efecto de Intelecto Arcano un 15% por punto.',
      maxRank: 2, tier: 2, requires: null },

    { id: 'improved_frost_armor', name: 'Armadura Mejorada', icon: '🧊', iconImg: 'img/talents/mage/frostbite.jpg',
      description: 'Aumenta el efecto de Armadura de Escarcha un 10% por punto.',
      maxRank: 3, tier: 2, requires: null },

    { id: 'improved_blink', name: 'Traslación Mejorada', icon: '💨', iconImg: 'img/talents/mage/spell_power.jpg',
      description: 'Reduce el cooldown de Traslación 1 turno por punto.',
      maxRank: 2, tier: 2, requires: null },

    { id: 'magic_resistance', name: 'Resistencia Mágica', icon: '🛡️', iconImg: 'img/talents/mage/ice_shards.jpg',
      description: 'Aumenta tu armadura mágica +1 por punto.',
      maxRank: 3, tier: 2, requires: null },

    /* === TIER 3 (nivel 20) === */
    { id: 'improved_fire_blast', name: 'Explosión Rápida', icon: '💥', iconImg: 'img/talents/mage/improved_fireball.jpg',
      description: 'Reduce el cooldown de Explosión de Fuego 1 turno por punto.',
      maxRank: 2, tier: 3, requires: null },

    { id: 'frost_power', name: 'Poder de Escarcha', icon: '❄️', iconImg: 'img/talents/mage/frostbite.jpg',
      description: 'Aumenta el daño de tus hechizos de Escarcha un 2% por punto.',
      maxRank: 3, tier: 3, requires: null },

    { id: 'spell_crit_talent', name: 'Crítico de Hechizos', icon: '🎯', iconImg: 'img/talents/mage/spell_power.jpg',
      description: 'Aumenta tu probabilidad de crítico con hechizos un 1% por punto.',
      maxRank: 3, tier: 3, requires: null },

    { id: 'clearcasting', name: 'Claridad Arcana', icon: '🔮', iconImg: 'img/talents/mage/arcane_concentration.jpg',
      description: 'Tus hechizos tienen un 2% de probabilidad por punto de ser gratuitos al lanzarlos.',
      maxRank: 5, tier: 3, requires: null },
  ],

  /* ---------------------------------------------------------------
     HABILIDADES — 3 escuelas (Fuego, Escarcha, Arcano)
     --------------------------------------------------------------- */
  abilities: [
    { id: 'fireball', name: 'Bola de Fuego', icon: '🔥', iconImg: 'img/abilities/mage/fireball.jpg',
      school: 'Fuego', type: 'damage', requiredLevel: 1,
      baseDamage: 60, spellPowerRatio: 1.0, costPct: 0.09, castType: 'cast', cooldown: 0,
      description: 'Lanza una bola de fuego que explota al impactar.',
      damageRanges: [
        { rank: 1, level: 1,  min: 23,  max: 37 },
        { rank: 2, level: 6,  min: 36,  max: 56 },
        { rank: 3, level: 12, min: 62,  max: 98 },
        { rank: 4, level: 18, min: 104, max: 166 },
        { rank: 5, level: 24, min: 165, max: 265 },
      ] },

    { id: 'fire_blast', name: 'Explosión de Fuego', icon: '💥', iconImg: 'img/abilities/mage/fire_blast.jpg',
      school: 'Fuego', type: 'damage', requiredLevel: 4,
      baseDamage: 35, spellPowerRatio: 0.429, costPct: 0.05, castType: 'instant', cooldown: 3,
      description: 'Una explosión instantánea de llamas al objetivo.',
      damageRanges: [
        { rank: 1, level: 4,  min: 16, max: 26 },
        { rank: 2, level: 10, min: 30, max: 50 },
        { rank: 3, level: 16, min: 56, max: 90 },
        { rank: 4, level: 22, min: 99, max: 159 },
      ] },

    { id: 'frostbolt', name: 'Descarga de Escarcha', icon: '❄️', iconImg: 'img/abilities/mage/frostbolt.jpg',
      school: 'Escarcha', type: 'damage', requiredLevel: 6,
      baseDamage: 45, spellPowerRatio: 0.814, costPct: 0.08, castType: 'cast', cooldown: 0,
      description: 'Lanza un proyectil de hielo que ralentiza al objetivo.',
      damageRanges: [
        { rank: 1, level: 6,  min: 22,  max: 26 },
        { rank: 2, level: 12, min: 37,  max: 43 },
        { rank: 3, level: 18, min: 63,  max: 73 },
        { rank: 4, level: 24, min: 104, max: 120 },
      ] },

    { id: 'ice_barrier', name: 'Barrera de Hielo', icon: '🧊', iconImg: 'img/abilities/mage/ice_barrier.jpg',
      school: 'Escarcha', type: 'heal', requiredLevel: 10,
      baseDamage: 80, spellPowerRatio: 0.5, costPct: 0.03, castType: 'instant', cooldown: 3,
      description: 'Crea un escudo de hielo que absorbe daño.',
      damageRanges: [
        { rank: 1, level: 10, min: 60,  max: 60 },
        { rank: 2, level: 18, min: 120, max: 120 },
        { rank: 3, level: 26, min: 200, max: 200 },
      ] },

    { id: 'arcane_missiles', name: 'Misiles Arcanos', icon: '✨', iconImg: 'img/abilities/mage/arcane_missiles.jpg',
      school: 'Arcano', type: 'damage', requiredLevel: 14,
      baseDamage: 50, spellPowerRatio: 0.571, costPct: 0.10, castType: 'cast', cooldown: 1,
      description: 'Dispara misiles de energía arcana al objetivo cada segundo.',
      damageRanges: [
        { rank: 1, level: 14, min: 32,  max: 32 },
        { rank: 2, level: 20, min: 56,  max: 56 },
        { rank: 3, level: 26, min: 92,  max: 92 },
      ] },

    { id: 'arcane_explosion', name: 'Explosión Arcana', icon: '🔮', iconImg: 'img/abilities/mage/arcane_explosion.jpg',
      school: 'Arcano', type: 'damage', requiredLevel: 18, aoe: true,
      baseDamage: 30, spellPowerRatio: 0.357, costPct: 0.07, castType: 'instant', cooldown: 2,
      description: 'Estalla energía arcana alrededor del mago dañando a todos los enemigos cercanos.',
      damageRanges: [
        { rank: 1, level: 18, min: 87,  max: 105 },
        { rank: 2, level: 24, min: 143, max: 173 },
      ] },

    { id: 'arcane_intellect', name: 'Intelecto Arcano', icon: '🧠', iconImg: 'img/abilities/mage/arcane_mind.jpg',
      school: 'Arcano', type: 'utility', requiredLevel: 1,
      costPct: 0.06, castType: 'instant', cooldown: 0,
      description: 'Aumenta el Intelecto del objetivo. Aplica manualmente el buff en la hoja.',
      buff: { stat: 'intelecto', duration: 30 },
      buffRanks: [
        { rank: 1, level: 1,  value: 2,  costPct: 0.06 },
        { rank: 2, level: 14, value: 7,  costPct: 0.07 },
        { rank: 3, level: 28, value: 10, costPct: 0.08 },
        { rank: 4, level: 42, value: 15, costPct: 0.09 },
        { rank: 5, level: 56, value: 20, costPct: 0.10 },
      ] },

    { id: 'frost_armor', name: 'Armadura de Escarcha', icon: '🧊', iconImg: 'img/abilities/mage/ice_barrier.jpg',
      school: 'Escarcha', type: 'utility', requiredLevel: 4,
      costPct: 0.30, castType: 'instant', cooldown: 0,
      description: 'Crea una barrera de hielo que aumenta tu armadura física.',
      buff: { stat: 'armor', duration: 30, applySelf: true },
      buffRanks: [
        { rank: 1, level: 4,  value: 5,  costPct: 0.30 },
        { rank: 2, level: 14, value: 7,  costPct: 0.30 },
        { rank: 3, level: 24, value: 9,  costPct: 0.30 },
        { rank: 4, level: 34, value: 11, costPct: 0.30 },
        { rank: 5, level: 44, value: 13, costPct: 0.30 },
        { rank: 6, level: 54, value: 15, costPct: 0.30 },
      ] },

    { id: 'blink', name: 'Traslación', icon: '💨', iconImg: 'img/abilities/mage/arcane_explosion.jpg',
      school: 'Arcano', type: 'utility', requiredLevel: 15,
      costPct: 0.10, castType: 'instant', cooldown: 4,
      description: 'Te teletransportas instantáneamente, escapando de efectos de control.',
      buff: null, applySelf: false },
  ],
};
