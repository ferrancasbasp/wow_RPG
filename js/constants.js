
/* ================================================================
   REGISTRO DE CLASES
   ================================================================
   Las clases se definen en archivos separados bajo js/classes/.
   Cada archivo registra su clase en window.CLASS_REGISTRY.
   Aquí simplemente recogemos el resultado.

   Para añadir una nueva clase:
     1. Crea js/classes/mi_clase.js (copia shaman.js o mage.js como plantilla)
      2. Anade el tag de script de mi_clase.js en el head
     3. Registra los efectos de talentos en computedAbilities() y
        getTalentEffectText() más abajo
   ================================================================ */
const CLASS_DATA = window.CLASS_REGISTRY || {};

const FALLBACK_CLASS = {
  name: 'Clase',
  color: '#c9b27e',
  icon: '?',
  formulas: {
    hp: (s, lvl) => 40 + s.aguante * 10 + lvl * 5,
    mana: (s, lvl) => 30 + s.intelecto * 15 + lvl * 3,
    spellPower: (s) => Math.round(s.intelecto * 0.5),
    attackPower: (s) => s.fuerza * 2,
    manaRegen: (s) => Math.round(s.espiritu * 0.25 + 15),
  },
  baseStats: { fuerza: 15, agilidad: 10, intelecto: 25, aguante: 20, espiritu: 18 },
  startingLevel: 1,
  statGrowth: { fuerza: 0.5, agilidad: 0.5, intelecto: 0.5, aguante: 0.5, espiritu: 0.5 },
  armor: 0,
  magicResist: 0,
  resource: { type: 'mana', label: 'Maná', color: '#3498db', max: null, start: 'full' },
  talentBranches: [{ name: 'General', icon: '⭐', color: '#c9b27e' }],
  talents: [],
  abilities: [],
};

/* ================================================================
   DATOS POR DEFECTO
   Crea un personaje nuevo con los valores iniciales de la clase.
   ================================================================ */
function createDefaultCharacter(classKey) {
  const cls = CLASS_DATA[classKey] || CLASS_DATA.shaman || FALLBACK_CLASS;
  return {
    name: 'Nuevo Personaje',
    classKey: CLASS_DATA[classKey] ? classKey : (CLASS_DATA.shaman ? 'shaman' : classKey),
    level: cls.startingLevel || 1,
    baseStats: { ...cls.baseStats },
    talents: {},
    currentXP: 0,
    currentHP: null,
    currentMana: null,
    currentRage: 0,
    currentEnergy: 100,
    comboPoints: 0,
    trainedRanks: {},
    currentCooldowns: {},
    equipment: {
      head:      { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 }, defense: 0 },
      chest:     { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 }, defense: 0 },
      hands:     { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 } },
      legs:      { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 } },
      feet:      { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 } },
      mainHand:  { name: 'Arma básica', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 }, weaponDamage: 4 },
      offHand:   { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 }, weaponDamage: 0, defense: 0 },
      twoHand:   { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 }, weaponDamage: 0 },
    },
    activeEffects: [],
  };
}

const EFFECT_TYPES = {
  buff:   { label: 'Buff', icon: '⬆️', color: '#5fa85f' },
  debuff: { label: 'Debuff', icon: '⬇️', color: '#c45151' },
  hot:    { label: 'HoT', icon: '💚', color: '#5fa85f' },
  dot:    { label: 'DoT', icon: '🩸', color: '#c0392b' },
  status: { label: 'Estado', icon: '⛔', color: '#e8d5a3' },
  misc:   { label: 'Misc', icon: '✦', color: '#9b59b6' },
};

const BUFF_DEBUFF_STATS = [
  { key: 'fuerza', label: 'Fuerza' },
  { key: 'agilidad', label: 'Agilidad' },
  { key: 'aguante', label: 'Aguante' },
  { key: 'espiritu', label: 'Espíritu' },
  { key: 'intelecto', label: 'Intelecto' },
  { key: 'all_stats', label: 'Todos los Atributos' },
  { key: 'attackPower', label: 'Poder de Ataque' },
  { key: 'spellPower', label: 'Poder de Hechizo' },
  { key: 'spellCrit', label: 'Prob. Crítico Hechizos' },
  { key: 'physCrit', label: 'Prob. Crítico Físico' },
  { key: 'maxHP', label: 'Vida Máxima' },
  { key: 'armor', label: 'Armadura' },
  { key: 'magicResist', label: 'Armadura Mágica' },
  { key: 'poisonDamage', label: 'Daño de Veneno' },
  { key: 'evasion', label: 'Evasión' },
];

const STATUS_OPTIONS = [
  { key: 'stunned', label: 'Stunned' },
  { key: 'silenced', label: 'Silenced' },
  { key: 'rooted', label: 'Rooted' },
  { key: 'frozen', label: 'Frozen' },
];

const HOT_DOT_TARGETS = [
  { key: 'hp', label: 'Vida' },
  { key: 'mana', label: 'Maná' },
];

/* Mapeo de nombres legibles a claves internas de atributos */
const STAT_KEYS = { 'Fuerza': 'fuerza', 'Agilidad': 'agilidad', 'Intelecto': 'intelecto', 'Aguante': 'aguante', 'Espíritu': 'espiritu' };
const STAT_ICONS = { fuerza: '💪', agilidad: '🏃', intelecto: '🧠', aguante: '❤️', espiritu: '✨' };
