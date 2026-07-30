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
  color: '#69CCF0',
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
    manaRegen:   (s, lvl) => Math.round(s.espiritu * 0.8 + lvl * 0.3),
  },

  /* Atributos base al crear un personaje de esta clase (nivel 1) */
  baseStats: { fuerza: 3, agilidad: 3, intelecto: 20, aguante: 14, espiritu: 18 },
  startingLevel: 1,

  /* Crecimiento de stats por nivel (valores de WoW Classic) */
  statGrowth: { fuerza: 0.05, agilidad: 0.05, intelecto: 1.8, aguante: 0.5, espiritu: 0.9 },

  /* ---------------------------------------------------------------
     TALENTOS — una sola rama
     --------------------------------------------------------------- */

  talents: [
    { id: 'ignite', name: 'Ignitar', icon: '🔥', iconImg: 'img/talents/mage/ignite.jpg',
      description: 'Tus hechizos de Fuego dejan un daño adicional del 4% por punto durante 3 seg.',
      maxRank: 5, tier: 1, requires: null },

    { id: 'frostbite', name: 'Congelación', icon: '❄️', iconImg: 'img/talents/mage/frostbite.jpg',
      description: 'Tus hechizos de Escarcha tienen un 2% de probabilidad por punto de congelar al objetivo.',
      maxRank: 3, tier: 1, requires: null },

    { id: 'arcane_concentration', name: 'Concentración Arcana', icon: '✨', iconImg: 'img/talents/mage/arcane_concentration.jpg',
      description: 'Tus hechizos Arcanos tienen un 2% de probabilidad por punto de ser gratuitos.',
      maxRank: 5, tier: 1, requires: null },

    { id: 'improved_fireball', name: 'Bola de Fuego Mejorada', icon: '🔥', iconImg: 'img/talents/mage/improved_fireball.jpg',
      description: 'Aumenta el daño de Bola de Fuego un 5% por punto.',
      maxRank: 3, tier: 2, requires: { id: 'ignite', points: 2 } },

    { id: 'ice_shards', name: 'Fragmentos de Hielo', icon: '🧊', iconImg: 'img/talents/mage/ice_shards.jpg',
      description: 'Aumenta el daño crítico de tus hechizos de Escarcha un 10% por punto.',
      maxRank: 3, tier: 2, requires: { id: 'frostbite', points: 1 } },

    { id: 'arcane_mind', name: 'Mente Arcana', icon: '🔮', iconImg: 'img/talents/mage/arcane_mind.jpg',
      description: 'Aumenta tu Intelecto total un 3% por punto.',
      maxRank: 5, tier: 2, requires: { id: 'arcane_concentration', points: 2 } },

    { id: 'fire_power', name: 'Poder de Fuego', icon: '🌋', iconImg: 'img/talents/mage/fire_power.jpg',
      description: 'Aumenta el daño de todos tus hechizos de Fuego un 5% por punto.',
      maxRank: 3, tier: 3, requires: { id: 'improved_fireball', points: 2 } },

    { id: 'spell_power', name: 'Poder Arcano', icon: '💫', iconImg: 'img/talents/mage/spell_power.jpg',
      description: 'Aumenta tu Poder de Hechizo total un 10% por punto.',
      maxRank: 2, tier: 3, requires: { id: 'arcane_mind', points: 3 } },
  ],

  /* ---------------------------------------------------------------
     HABILIDADES — 3 escuelas (Fuego, Escarcha, Arcano)
     --------------------------------------------------------------- */
  abilities: [
    { id: 'fireball', name: 'Bola de Fuego', icon: '🔥', iconImg: 'img/abilities/mage/fireball.jpg',
      school: 'Fuego', type: 'damage', requiredLevel: 1,
      baseDamage: 60, spellPowerRatio: 1.0, baseCost: 40, castType: 'cast', cooldown: 0,
      description: 'Lanza una bola de fuego que explota al impactar.',
      dice: { count: 5, sides: 6, bonus: 15 } },

    { id: 'fire_blast', name: 'Explosión de Fuego', icon: '💥', iconImg: 'img/abilities/mage/fire_blast.jpg',
      school: 'Fuego', type: 'damage', requiredLevel: 4,
      baseDamage: 35, spellPowerRatio: 0.429, baseCost: 25, castType: 'instant', cooldown: 1,
      description: 'Una explosión instantánea de llamas al objetivo.',
      dice: { count: 3, sides: 4, bonus: 8 } },

    { id: 'frostbolt', name: 'Descarga de Escarcha', icon: '❄️', iconImg: 'img/abilities/mage/frostbolt.jpg',
      school: 'Escarcha', type: 'damage', requiredLevel: 6,
      baseDamage: 45, spellPowerRatio: 0.814, baseCost: 35, castType: 'cast', cooldown: 0,
      description: 'Lanza un proyectil de hielo que ralentiza al objetivo.',
      dice: { count: 4, sides: 6, bonus: 10 } },

    { id: 'ice_barrier', name: 'Barrera de Hielo', icon: '🧊', iconImg: 'img/abilities/mage/ice_barrier.jpg',
      school: 'Escarcha', type: 'heal', requiredLevel: 10,
      baseDamage: 80, spellPowerRatio: 0.5, baseCost: 30, castType: 'instant', cooldown: 3,
      description: 'Crea un escudo de hielo que absorbe daño.',
      dice: { count: 4, sides: 8, bonus: 20 } },

    { id: 'arcane_missiles', name: 'Misiles Arcanos', icon: '✨', iconImg: 'img/abilities/mage/arcane_missiles.jpg',
      school: 'Arcano', type: 'damage', requiredLevel: 14,
      baseDamage: 50, spellPowerRatio: 0.571, baseCost: 45, castType: 'cast', cooldown: 1,
      description: 'Dispara misiles de energía arcana al objetivo cada segundo.',
      dice: { count: 3, sides: 8, bonus: 12 } },

    { id: 'arcane_explosion', name: 'Explosión Arcana', icon: '🔮', iconImg: 'img/abilities/mage/arcane_explosion.jpg',
      school: 'Arcano', type: 'damage', requiredLevel: 18,
      baseDamage: 30, spellPowerRatio: 0.357, baseCost: 30, castType: 'instant', cooldown: 2,
      description: 'Estalla energía arcana alrededor del mago dañando a todos los enemigos cercanos.',
      dice: { count: 2, sides: 10, bonus: 8 } },
  ],
};
