const { createApp } = Vue;

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
    trainedRanks: {},
    currentCooldowns: {},
    equipment: {
      head:    { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 } },
      chest:   { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 } },
      hands:   { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 } },
      legs:    { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 } },
      feet:    { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 } },
      weapon:  { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 } },
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
  { key: 'attackPower', label: 'Poder de Ataque' },
  { key: 'spellPower', label: 'Poder de Hechizo' },
  { key: 'spellCrit', label: 'Prob. Crítico Hechizos' },
  { key: 'physCrit', label: 'Prob. Crítico Físico' },
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

/* ================================================================
   APLICACIÓN VUE 3 (Options API — más legible para prototipos)
   ================================================================ */
createApp({
  data() {
    return {
      character: createDefaultCharacter('shaman'),
      classData: CLASS_DATA,
      statKeys: STAT_KEYS,
      statIcons: STAT_ICONS,
      equipmentSlots: [
        { key: 'head',   label: 'Cabeza', icon: '🪖' },
        { key: 'chest',  label: 'Pecho',  icon: '🛡️' },
        { key: 'hands',  label: 'Manos',  icon: '🧤' },
        { key: 'legs',   label: 'Piernas', icon: '👖' },
        { key: 'feet',   label: 'Pies',   icon: '🥾' },
        { key: 'weapon', label: 'Arma',   icon: '⚔️' },
      ],
      showExportModal: false,
      showTalentModal: false,
      hoveredTalent: null,
      showEquipment: false,
      showEffectsPanel: false,
      effectTypes: EFFECT_TYPES,
      buffDebuffStats: BUFF_DEBUFF_STATS,
      statusOptions: STATUS_OPTIONS,
      hotDotTargets: HOT_DOT_TARGETS,
      newEffect: { type: 'buff', name: '', target: 'aguante', value: 0, duration: 1 },
      toastMessage: '',
      xpInputAmount: null,
      levelUpFlash: false,
      turnNumber: 1,
      turnDamage: 0,
      hpLossAmount: null,
    };
  },

  computed: {
    // Objeto de configuración de la clase seleccionada
    classConfig() {
      return CLASS_DATA[this.character.classKey] || CLASS_DATA.shaman || FALLBACK_CLASS;
    },

    // Atributos finales = base + crecimiento por nivel + equipo + efectos
    // + talentos que modifican atributos
    finalStats() {
      const growth = this.classConfig.statGrowth || {};
      const level = this.character.level;
      const result = {};
      for (const key of Object.values(STAT_KEYS)) {
        const perLevel = growth[key] || 0;
        result[key] = this.character.baseStats[key] + Math.floor((level - 1) * perLevel);
        result[key] += this.gearStatBonus(key);
        result[key] += this.effectStatBonus(key);
      }
      // Mago: Mente Arcana (+3% Intelecto por punto)
      const arcaneMind = this.talentRank('arcane_mind');
      if (arcaneMind > 0) {
        result.intelecto = Math.round(result.intelecto * (1 + arcaneMind * 0.03));
      }
      return result;
    },

    // Vida máxima — fórmula de clase + Aguante + nivel
    maxHP() {
      return Math.round(this.classConfig.formulas.hp(this.finalStats, this.character.level));
    },

    // Maná máximo — fórmula de clase + Intelecto + nivel
    maxMana() {
      return Math.round(this.classConfig.formulas.mana(this.finalStats, this.character.level));
    },

    // Maná base (sin equipo, solo stats base + nivel) — para calcular coste de hechizos
    baseMana() {
      const lvl = this.character.level;
      const growth = this.classConfig.statGrowth || {};
      const baseInt = (this.classConfig.baseStats.intelecto || 0) + Math.floor((lvl - 1) * (growth.intelecto || 0));
      const baseStatsForMana = { ...this.classConfig.baseStats, intelecto: baseInt };
      return Math.round(this.classConfig.formulas.mana(baseStatsForMana, lvl));
    },

    // Poder de Hechizo base desde Intelecto
    baseSpellPower() {
      return this.classConfig.formulas.spellPower(this.finalStats);
    },

    // Poder de Hechizo final con talentos aplicados
    // Chamán: Poder de Tormenta (+10% por punto)
    // Mago: Poder Arcano (+10% por punto)
    spellPower() {
      let sp = this.baseSpellPower;
      const stormPower = this.talentRank('storm_power');
      const mageSpellPower = this.talentRank('spell_power');
      sp = Math.round(sp * (1 + stormPower * 0.10 + mageSpellPower * 0.10));
      return sp;
    },

    // Prob. Crítico de Hechizos (5% base + Intelecto + nivel + talentos)
    // WoW Classic: 60 Int = 1% spell crit, +0.02% por nivel
    // Talento "Llamada del Trueno" (Chamán): +1% por punto
    spellCrit() {
      const fromInt = this.finalStats.intelecto / 60;
      const fromLevel = this.character.level * 0.02;
      const fromTalent = this.talentRank('call_of_thunder');
      return (5 + fromInt + fromLevel + fromTalent).toFixed(2);
    },

    // Prob. Crítico Físico/Melee (5% base + Agilidad + nivel)
    // WoW Classic: 20 Agi = 1% melee crit, +0.02% por nivel
    meleeCrit() {
      const fromAgi = this.finalStats.agilidad / 20;
      const fromLevel = this.character.level * 0.02;
      return (5 + fromAgi + fromLevel).toFixed(2);
    },

    // Poder de Ataque (Fuerza × 2 + Nivel × 2 - 10)
    // WoW Classic: melee AP = STR×2 + level×2 - 10
    attackPower() {
      const base = this.finalStats.fuerza * 2 + this.character.level * 2 - 10;
      const fromFormula = this.classConfig.formulas.attackPower(this.finalStats);
      return Math.max(base, fromFormula);
    },

    // Regen. de Maná desde Espíritu (fórmula de clase)
    manaRegen() {
      if (!this.classConfig.formulas.manaRegen) return 0;
      return this.classConfig.formulas.manaRegen(this.finalStats, this.character.level);
    },

    // Armadura física: base de clase + buffs de armor activos
    armorTotal() {
      let total = this.classConfig.armor || 0;
      if (this.character.activeEffects) {
        for (const eff of this.character.activeEffects) {
          if (eff.type === 'buff' && eff.target === 'armor') total += eff.value;
        }
      }
      return total;
    },

    // Armadura mágica: base de clase + buffs activos
    magicResistTotal() {
      let total = this.classConfig.magicResist || 0;
      if (this.character.activeEffects) {
        for (const eff of this.character.activeEffects) {
          if (eff.type === 'buff' && eff.target === 'magicResist') total += eff.value;
        }
      }
      return total;
    },

    // % de reducción de daño físico (armadura / (armadura + 50))
    // Simplificación: cada punto de armadura reduce 2% del daño, máximo 50%
    physReduction() {
      return Math.min(50, this.armorTotal * 2);
    },

    // % de reducción de daño mágico
    magicReduction() {
      return Math.min(75, this.magicResistTotal * 3);
    },

    // Puntos de talento gastados (suma de todos los rangos)
    spentTalentPoints() {
      if (!this.character.talents) return 0;
      return Object.values(this.character.talents).reduce((s, v) => s + v, 0);
    },

    // Puntos totales: 1 por nivel desde nivel 10
    totalTalentPoints() {
      return Math.max(0, this.character.level - 4);
    },

    // Disponibles = totales − gastados
    availableTalentPoints() {
      return this.totalTalentPoints - this.spentTalentPoints;
    },

    // Lista de tiers del árbol (1, 2, 3...) para iterar en la UI
    tiers() {
      return [...new Set(this.classConfig.talents.map(t => t.tier))].sort();
    },

    // Agrupar talentos por rama con metadatos para el árbol estilo WoW
    talentBranchesData() {
      const branches = this.classConfig.talentBranches || [{ name: 'General', icon: '⭐', color: '#c9b27e' }];
      return branches.map((branch, idx) => {
        const talents = this.classConfig.talents
          .filter(t => (t.branch || 0) === idx)
          .sort((a, b) => a.tier - b.tier);
        return { ...branch, index: idx, talents };
      });
    },

    /* ============================================================
       HABILIDADES CON DAÑO/COSTE CALCULADO EN TIEMPO REAL
       ============================================================
       Esta es la propiedad reactiva más importante. Cada vez que
       cambian los atributos, el nivel o los talentos, Vue recalculate
       automáticamente el daño y coste de cada habilidad.

       Para añadir modificadores por nuevos talentos, añade bloques
       if/switch aquí siguiendo el patrón existente.
       ============================================================ */
    computedAbilities() {
      return this.classConfig.abilities.map(ability => {
        // === DAÑO BASE ===
        // Fórmula: dañoBase + (poderHechizo × ratio)
        let value = ability.baseDamage + this.spellPower * ability.spellPowerRatio;
        let talentNotes = [];

        // --- Talento: Convección (+3% daño todos los hechizos) ---
        const convection = this.talentRank('convection');
        if (convection > 0) {
          value *= (1 + convection * 0.03);
          talentNotes.push(`+${convection * 3}% Conv.`);
        }

        // --- Talento: Maestría de Rayos (+5% daño Naturaleza) ---
        if (ability.school === 'Naturaleza') {
          const lm = this.talentRank('lightning_mastery');
          if (lm > 0) {
            value *= (1 + lm * 0.05);
            talentNotes.push(`+${lm * 5}% Maestría`);
          }
        }

        // --- Talento: Descarga Mejorada (+5% Descarga de Rayo) ---
        if (ability.id === 'lightning_bolt') {
          const ilb = this.talentRank('improved_lightning_bolt');
          if (ilb > 0) {
            value *= (1 + ilb * 0.05);
            talentNotes.push(`+${ilb * 5}% Descarga`);
          }
        }

        // --- Mago: Ignitar (+4% daño Fuego) ---
        if (ability.school === 'Fuego') {
          const ig = this.talentRank('ignite');
          if (ig > 0) {
            value *= (1 + ig * 0.04);
            talentNotes.push(`+${ig * 4}% Ignitar`);
          }
        }

        // --- Mago: Bola de Fuego Mejorada (+5% Bola de Fuego) ---
        if (ability.id === 'fireball') {
          const ifb = this.talentRank('improved_fireball');
          if (ifb > 0) {
            value *= (1 + ifb * 0.05);
            talentNotes.push(`+${ifb * 5}% Bola Fuego`);
          }
        }

        // --- Mago: Poder de Fuego (+5% daño Fuego) ---
        if (ability.school === 'Fuego') {
          const fp = this.talentRank('fire_power');
          if (fp > 0) {
            value *= (1 + fp * 0.05);
            talentNotes.push(`+${fp * 5}% P. Fuego`);
          }
        }

        // --- Mago: Fragmentos de Hielo (+10% daño crítico Escarcha) ---
        // (afecta al daño base como bonus plano por ahora)
        if (ability.school === 'Escarcha') {
          const is = this.talentRank('ice_shards');
          if (is > 0) {
            value *= (1 + is * 0.03);
            talentNotes.push(`+${is * 3}% Fragmentos`);
          }
        }

        // === COSTE DE MANÁ (% del maná base) ===
        let cost = (ability.costPct || 0) * this.baseMana;
        const ef = this.talentRank('elemental_focus');
        if (ef > 0) cost *= (1 - ef * 0.02);

        return {
          ...ability,
          computedDamage: Math.round(value),
          computedCost: Math.round(cost),
          talentNote: talentNotes.join(' · ') || null,
        };
      });
    },

    // XP necesaria para el siguiente nivel (0 si ya es nivel máximo)
    xpForNextLevel() {
      if (this.character.level >= (window.MAX_LEVEL || 60)) return 0;
      return window.xpForLevel(this.character.level);
    },

    // Nivel máximo (para el input)
    maxLevelValue() {
      return window.MAX_LEVEL || 60;
    },

    hpActual() {
      if (this.character.currentHP === null || this.character.currentHP === undefined) return this.maxHP;
      return Math.max(0, Math.min(this.maxHP, this.character.currentHP));
    },

    manaActual() {
      if (this.character.currentMana === null || this.character.currentMana === undefined) return this.maxMana;
      return Math.max(0, Math.min(this.maxMana, this.character.currentMana));
    },

    hpPercent() {
      return Math.floor((this.hpActual / this.maxHP) * 100);
    },

    manaPercent() {
      if (this.maxMana === 0) return 0;
      return Math.floor((this.manaActual / this.maxMana) * 100);
    },

    // Habilidades entrenadas (con dados escalados por rango) — solo damage/heal
    unlockedAbilities() {
      return this.computedAbilities.filter(a => a.type !== 'utility' && this.trainedRank(a.id) > 0).map(a => {
        const rank = this.trainedRank(a.id);
        const dmgRange = a.damageRanges ? a.damageRanges.find(dr => dr.rank === rank) : null;
        return {
          ...a,
          currentRank: rank,
          currentMin: dmgRange ? dmgRange.min : 0,
          currentMax: dmgRange ? dmgRange.max : 0,
          scaledCost: Math.round(a.computedCost * (1 + (rank - 1) * 0.15)),
        };
      });
    },

    // Habilidades de utilidad (buffs sin dados, no envian daño al master)
    unlockedUtility() {
      return this.classConfig.abilities.filter(a => a.type === 'utility' && this.trainedRank(a.id) > 0).map(a => {
        const rank = this.trainedRank(a.id);
        const buffRank = a.buffRanks ? a.buffRanks.find(br => br.rank === rank) : null;
        const costPct = buffRank ? buffRank.costPct : a.costPct;
        const cost = Math.round(costPct * this.baseMana);
        return {
          ...a,
          currentRank: rank,
          scaledCost: cost,
          currentBuffValue: buffRank ? buffRank.value : (a.buff ? a.buff.value : 0),
          currentBuffDuration: a.buff ? a.buff.duration : 1,
          currentBuffStat: a.buff ? a.buff.stat : '',
        };
      });
    },

    // Habilidades que se pueden entrenar (tienes nivel pero no las has entrenado o hay rango nuevo)
    trainableAbilities() {
      return this.classConfig.abilities.filter(a => {
        if (a.type === 'utility') {
          if (a.buffRanks) {
            const maxBR = a.buffRanks.filter(br => this.character.level >= br.level).length;
            return maxBR > this.trainedRank(a.id);
          }
        }
        const maxRank = this.maxAvailableRank(a);
        const trained = this.trainedRank(a.id);
        return maxRank > 0 && trained < maxRank;
      });
    },

    // Habilidades bloqueadas (no tienes nivel)
    lockedAbilities() {
      return this.classConfig.abilities.filter(a => {
        if (a.type === 'utility') {
          if (a.buffRanks) return a.buffRanks[0].level > this.character.level;
        }
        return this.maxAvailableRank(a) === 0;
      });
    },

    // Hay algo que entrenar?
    canTrain() {
      return this.trainableAbilities.length > 0;
    },

    // Porcentaje de progreso hacia el siguiente nivel
    xpProgressPercent() {
      if (this.xpForNextLevel === 0) return 100;
      const current = this.character.currentXP || 0;
      return Math.min(100, Math.floor((current / this.xpForNextLevel) * 100));
    },

    // JSON para exportar
    exportedJson() {
      return JSON.stringify(this.character, null, 2);
    },
  },

  methods: {
    /* ==================== RANGOS DE HABILIDADES ==================== */

    maxAvailableRank(ability) {
      if (ability.damageRanges) {
        let rank = 0;
        for (const dr of ability.damageRanges) {
          if (this.character.level >= dr.level) rank = dr.rank;
        }
        return rank;
      }
      const rankLevels = [ability.requiredLevel, ability.requiredLevel + 8, ability.requiredLevel + 16, ability.requiredLevel + 24];
      let rank = 0;
      for (let i = 0; i < rankLevels.length; i++) {
        if (this.character.level >= rankLevels[i]) rank = i + 1;
      }
      return rank;
    },

    trainedRank(abilityId) {
      if (!this.character.trainedRanks) return 0;
      return this.character.trainedRanks[abilityId] || 0;
    },

    /* ==================== UTILIDADES DE TALENTOS ==================== */

    talentRank(id) {
      if (!this.character.talents) return 0;
      return this.character.talents[id] || 0;
    },

    isMaxed(talent) {
      return this.talentRank(talent.id) >= talent.maxRank;
    },

    // ¿Los requisitos previos se cumplen?
    prereqMet(talent) {
      if (!talent.requires) return true;
      return this.talentRank(talent.requires.id) >= talent.requires.points;
    },

    // ¿Se puede añadir un punto? (hay puntos, no está al máx, requisitos ok)
    canAddTalent(talent) {
      return this.availableTalentPoints > 0 && !this.isMaxed(talent) && this.prereqMet(talent);
    },

    addTalentPoint(id) {
      const talent = this.classConfig.talents.find(t => t.id === id);
      if (!this.canAddTalent(talent)) return;
      this.character.talents[id] = (this.character.talents[id] || 0) + 1;
    },

    removeTalentPoint(id) {
      if (this.talentRank(id) === 0) return;
      // No permitir quitar si hay talentos dependientes con puntos
      const dependents = this.classConfig.talents.filter(
        t => t.requires && t.requires.id === id && this.talentRank(t.id) > 0
      );
      if (dependents.length > 0) {
        this.showToast('Hay talentos que dependen de este. Quítalos primero.');
        return;
      }
      this.character.talents[id]--;
      if (this.character.talents[id] === 0) delete this.character.talents[id];
    },

    talentsByTier(tier) {
      return this.classConfig.talents.filter(t => t.tier === tier);
    },

    branchSpent(branchIdx) {
      const talents = this.classConfig.talents.filter(t => (t.branch || 0) === branchIdx);
      return talents.reduce((sum, t) => sum + this.talentRank(t.id), 0);
    },

    talentNodeClass(talent) {
      const rank = this.talentRank(talent.id);
      if (rank === 0 && !this.prereqMet(talent)) return 'wow-node-locked';
      if (this.isMaxed(talent)) return 'wow-node-maxed';
      if (rank > 0) return 'wow-node-active';
      if (this.canAddTalent(talent)) return 'wow-node-available';
      return 'wow-node-grey';
    },

    talentAtBranchTier(branchIdx, tier) {
      return this.classConfig.talents.find(t => (t.branch || 0) === branchIdx && t.tier === tier) || null;
    },

    hasActiveAbove(branchIdx, tier) {
      const above = this.talentAtBranchTier(branchIdx, tier - 1);
      return above && this.talentRank(above.id) > 0;
    },

    getTalentName(id) {
      const t = this.classConfig.talents.find(t => t.id === id);
      return t ? t.name : id;
    },

    // Clase CSS para el estado visual de la tarjeta
    talentCardClass(talent) {
      const rank = this.talentRank(talent.id);
      if (rank === 0 && !this.prereqMet(talent)) return 'locked';
      if (this.isMaxed(talent)) return 'maxed';
      if (rank > 0) return 'active';
      if (this.canAddTalent(talent)) return 'available';
      return '';
    },

    // Texto del efecto actual del talento (se muestra en la tarjeta)
    // Para añadir un talento nuevo, añade su case aquí
    getTalentEffectText(talent) {
      const rank = this.talentRank(talent.id);
      if (rank === 0) return '';
      switch (talent.id) {
        case 'elemental_focus':         return `Coste de maná: −${rank * 2}%`;
        case 'convection':              return `Daño de hechizos: +${rank * 3}%`;
        case 'improved_lightning_bolt': return `Daño Descarga de Rayo: +${rank * 5}%`;
        case 'call_of_thunder':         return `Crítico de hechizos: +${rank}%`;
        case 'lightning_mastery':       return `Daño Naturaleza: +${rank * 5}%`;
        case 'storm_power':             return `Poder de Hechizo: +${rank * 10}%`;
        // --- Mago ---
        case 'ignite':                  return `Daño Fuego (DoT): +${rank * 4}%`;
        case 'frostbite':               return `Prob. congelar: +${rank * 2}%`;
        case 'arcane_concentration':    return `Hechizo gratuito: +${rank * 2}%`;
        case 'improved_fireball':       return `Daño Bola de Fuego: +${rank * 5}%`;
        case 'ice_shards':              return `Daño Escarcha: +${rank * 3}%`;
        case 'arcane_mind':             return `Intelecto: +${rank * 3}%`;
        case 'fire_power':              return `Daño Fuego: +${rank * 5}%`;
        case 'spell_power':             return `Poder de Hechizo: +${rank * 10}%`;
        default: return '';
      }
    },

    /* ==================== ATRIBUTOS Y NIVEL ==================== */

    adjustStat(key, delta) {
      const val = this.character.baseStats[key] + delta;
      if (val >= 1 && val <= 99) this.character.baseStats[key] = val;
    },

    rollDice(count, sides) {
      let total = 0;
      for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
      return total;
    },

    castSpell(ability) {
      const cost = ability.scaledCost || ability.computedCost;
      if (this.manaActual < cost) {
        this.showToast('Maná insuficiente');
        return;
      }
      if (this.getCooldown(ability.id) > 0) {
        this.showToast(ability.name + ' está en cooldown (' + this.getCooldown(ability.id) + ' turno' + (this.getCooldown(ability.id) > 1 ? 's' : '') + ')');
        return;
      }
      this.character.currentMana = this.manaActual - cost;
      const min = ability.currentMin || 0;
      const max = ability.currentMax || 0;
      let roll = min + Math.floor(Math.random() * (max - min + 1));
      const isCrit = Math.random() * 100 < parseFloat(this.spellCrit);
      if (isCrit) roll = Math.round(roll * 1.5);
      ability.lastRoll = roll;
      ability.lastCrit = isCrit;
      if (ability.cooldown > 0) {
        if (!this.character.currentCooldowns) this.character.currentCooldowns = {};
        this.character.currentCooldowns[ability.id] = ability.cooldown;
      }
      if (ability.type === 'heal') {
        this.character.currentHP = Math.min(this.maxHP, this.hpActual + roll);
        this.showToast(ability.name + ' R' + ability.currentRank + ': ' + roll + ' curación' + (isCrit ? ' ¡CRÍTICO!' : ''));
      } else {
        this.turnDamage += roll;
        this.showToast(ability.name + ' R' + ability.currentRank + ': ' + roll + ' daño' + (isCrit ? ' ¡CRÍTICO!' : ''));
        this.sendDamageEvent(ability, roll);
      }
    },

    castUtility(ability) {
      const cost = ability.scaledCost;
      if (this.manaActual < cost) {
        this.showToast('Maná insuficiente');
        return;
      }
      this.character.currentMana = this.manaActual - cost;
      if (ability.buff && ability.buff.applySelf) {
        if (!this.character.activeEffects) this.character.activeEffects = [];
        this.character.activeEffects = this.character.activeEffects.filter(e => e.name !== ability.name);
        this.character.activeEffects.push({
          id: Date.now() + Math.random(),
          type: 'buff',
          name: ability.name,
          target: ability.currentBuffStat,
          value: ability.currentBuffValue,
          duration: ability.currentBuffDuration,
        });
        this.showToast(ability.name + ' R' + ability.currentRank + ': +' + ability.currentBuffValue + ' ' + ability.currentBuffStat);
      } else {
        const buffText = '+' + ability.currentBuffValue + ' ' + ability.currentBuffStat + ' (' + ability.currentBuffDuration + ' turnos)';
        this.showToast(ability.name + ' R' + ability.currentRank + ': ' + buffText + ' — aplícalo manualmente en Efectos');
      }
    },

    sendDamageEvent(ability, damage) {
      try {
        if (typeof firebase === 'undefined' || !firebase.apps.length) return;
        const db = firebase.database();
        db.ref('damageEvents').push({
          player: this.character.name || 'Jugador',
          ability: ability.name,
          rank: ability.currentRank || 1,
          damage: damage,
          turn: this.turnNumber,
          timestamp: Date.now(),
          assigned: false,
        });
      } catch (e) {
        console.error('Firebase send error:', e);
      }
    },

    getCooldown(abilityId) {
      if (!this.character.currentCooldowns) return 0;
      return this.character.currentCooldowns[abilityId] || 0;
    },

    endTurn() {
      if (!this.character.currentCooldowns) this.character.currentCooldowns = {};
      for (const id in this.character.currentCooldowns) {
        if (this.character.currentCooldowns[id] > 0) {
          this.character.currentCooldowns[id]--;
          if (this.character.currentCooldowns[id] <= 0) delete this.character.currentCooldowns[id];
        }
      }
      const regen = Math.round(this.manaRegen * 0.5);
      this.character.currentMana = Math.min(this.maxMana, this.manaActual + regen);
      this.processEffects();
      this.turnNumber++;
      this.turnDamage = 0;
      this.showToast('Fin de turno ' + (this.turnNumber - 1) + ' · +' + regen + ' maná regenerado');
    },

    processEffects() {
      if (!this.character.activeEffects || this.character.activeEffects.length === 0) return;
      const messages = [];
      for (const eff of this.character.activeEffects) {
        if (eff.type === 'hot') {
          if (eff.target === 'mana') {
            this.character.currentMana = Math.min(this.maxMana, this.manaActual + eff.value);
          } else {
            this.character.currentHP = Math.min(this.maxHP, this.hpActual + eff.value);
          }
          messages.push('+' + eff.value + ' ' + eff.name);
        } else if (eff.type === 'dot') {
          if (eff.target === 'mana') {
            this.character.currentMana = Math.max(0, this.manaActual - eff.value);
          } else {
            this.character.currentHP = Math.max(0, this.hpActual - eff.value);
          }
          messages.push('-' + eff.value + ' ' + eff.name);
        }
      }
      this.character.activeEffects = this.character.activeEffects.map(e => {
        return { ...e, duration: e.duration - 1 };
      }).filter(e => e.duration > 0);
      if (messages.length > 0) {
        this.showToast(messages.join(' · '));
      }
    },

    onEffectTypeChange() {
      if (this.newEffect.type === 'status') {
        this.newEffect.target = 'stunned';
        this.newEffect.value = 0;
        this.newEffect.duration = 1;
        this.newEffect.name = '';
      } else if (this.newEffect.type === 'buff' || this.newEffect.type === 'debuff') {
        this.newEffect.target = 'aguante';
        this.newEffect.value = 0;
        this.newEffect.duration = 1;
        this.newEffect.name = '';
      } else if (this.newEffect.type === 'hot' || this.newEffect.type === 'dot') {
        this.newEffect.target = 'hp';
        this.newEffect.value = 0;
        this.newEffect.duration = 1;
        this.newEffect.name = '';
      } else if (this.newEffect.type === 'misc') {
        this.newEffect.target = '';
        this.newEffect.value = 0;
        this.newEffect.duration = 1;
        this.newEffect.name = '';
      }
    },

    addEffect() {
      const t = this.newEffect.type;
      if (t === 'status') {
        if (!this.character.activeEffects) this.character.activeEffects = [];
        this.character.activeEffects.push({
          id: Date.now() + Math.random(),
          type: 'status',
          name: this.statusOptions.find(s => s.key === this.newEffect.target)?.label || this.newEffect.target,
          target: this.newEffect.target,
          value: 0,
          duration: 1,
        });
      } else if (t === 'buff' || t === 'debuff') {
        if (!this.newEffect.name.trim() || !this.newEffect.value) {
          this.showToast('Faltan datos del efecto');
          return;
        }
        if (!this.character.activeEffects) this.character.activeEffects = [];
        this.character.activeEffects.push({
          id: Date.now() + Math.random(),
          type: t,
          name: this.newEffect.name.trim(),
          target: this.newEffect.target,
          value: Math.abs(this.newEffect.value),
          duration: this.newEffect.duration || 1,
        });
      } else if (t === 'hot' || t === 'dot') {
        if (!this.newEffect.name.trim() || !this.newEffect.value) {
          this.showToast('Faltan datos del efecto');
          return;
        }
        if (!this.character.activeEffects) this.character.activeEffects = [];
        this.character.activeEffects.push({
          id: Date.now() + Math.random(),
          type: t,
          name: this.newEffect.name.trim(),
          target: this.newEffect.target,
          value: Math.abs(this.newEffect.value),
          duration: this.newEffect.duration || 1,
        });
      } else if (t === 'misc') {
        if (!this.newEffect.name.trim()) {
          this.showToast('Faltan datos del efecto');
          return;
        }
        if (!this.character.activeEffects) this.character.activeEffects = [];
        this.character.activeEffects.push({
          id: Date.now() + Math.random(),
          type: 'misc',
          name: this.newEffect.name.trim(),
          target: this.newEffect.target,
          value: Math.abs(this.newEffect.value),
          duration: this.newEffect.duration || 1,
        });
      }
      this.onEffectTypeChange();
      this.showToast('Efecto añadido');
    },

    removeEffect(id) {
      this.character.activeEffects = this.character.activeEffects.filter(e => e.id !== id);
    },

    effectValueText(eff) {
      if (eff.type === 'buff') return '+' + eff.value + ' ' + eff.target;
      if (eff.type === 'debuff') return '-' + eff.value + ' ' + eff.target;
      if (eff.type === 'hot') return '+' + eff.value + ' ' + (eff.target === 'mana' ? 'maná' : 'vida') + '/turno';
      if (eff.type === 'dot') return '-' + eff.value + ' ' + (eff.target === 'mana' ? 'maná' : 'vida') + '/turno';
      if (eff.type === 'status') return eff.name;
      if (eff.type === 'misc') return (eff.value > 0 ? '+' : '') + eff.value + ' ' + eff.target;
      return '';
    },

    takeDamage(amount) {
      if (amount <= 0) return;
      this.character.currentHP = Math.max(0, this.hpActual - amount);
      this.hpLossAmount = null;
      this.showToast('-' + amount + ' vida');
    },

    trainAll() {
      if (!this.character.trainedRanks) this.character.trainedRanks = {};
      let count = 0;
      for (const ability of this.classConfig.abilities) {
        if (ability.type === 'utility' && ability.buffRanks) {
          const maxBR = ability.buffRanks.filter(br => this.character.level >= br.level).length;
          const trained = this.trainedRank(ability.id);
          if (maxBR > trained) {
            this.character.trainedRanks[ability.id] = maxBR;
            count++;
          }
        } else {
          const maxRank = this.maxAvailableRank(ability);
          const trained = this.trainedRank(ability.id);
          if (maxRank > trained) {
            this.character.trainedRanks[ability.id] = maxRank;
            count++;
          }
        }
      }
      if (count > 0) {
        this.showToast('Entrenado: ' + count + ' habilidad' + (count > 1 ? 'es' : '') + ' actualizada' + (count > 1 ? 's' : ''));
      } else {
        this.showToast('Nada que entrenar');
      }
    },

    statBonus(key) {
      return this.gearStatBonus(key) + this.effectStatBonus(key);
    },

    levelStatBonus(key) {
      return this.finalStats[key] - this.character.baseStats[key] - this.gearStatBonus(key) - this.effectStatBonus(key);
    },

    effectStatBonus(key) {
      if (!this.character.activeEffects) return 0;
      let total = 0;
      for (const eff of this.character.activeEffects) {
        if (eff.type === 'buff' && eff.target === key) total += eff.value;
        if (eff.type === 'debuff' && eff.target === key) total -= eff.value;
      }
      return total;
    },

    hasStatus(status) {
      if (!this.character.activeEffects) return false;
      return this.character.activeEffects.some(e => e.type === 'status' && e.target === status);
    },

    gearStatBonus(key) {
      if (!this.character.equipment) return 0;
      let total = 0;
      for (const slot in this.character.equipment) {
        const item = this.character.equipment[slot];
        if (item && item.bonus && item.bonus[key]) total += item.bonus[key];
      }
      return total;
    },

    defaultEquipment() {
      const emptyBonus = { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 };
      const slots = ['head', 'chest', 'hands', 'legs', 'feet', 'weapon'];
      const eq = {};
      for (const s of slots) eq[s] = { name: '', bonus: { ...emptyBonus } };
      return eq;
    },

    changeLevel(delta) {
      const n = this.character.level + delta;
      if (n >= 1 && n <= (window.MAX_LEVEL || 60)) {
        this.character.level = n;
        this.character.currentXP = 0;
      }
    },

    clampLevel() {
      const maxLvl = window.MAX_LEVEL || 60;
      if (!this.character.level || this.character.level < 1) this.character.level = 1;
      if (this.character.level > maxLvl) this.character.level = maxLvl;
      this.character.currentXP = 0;
    },

    addXP(amount) {
      if (amount <= 0) return;
      const maxLvl = window.MAX_LEVEL || 60;
      if (this.character.level >= maxLvl) {
        this.showToast('Nivel máximo alcanzado');
        return;
      }
      let xp = (this.character.currentXP || 0) + amount;
      let levelsGained = 0;
      while (this.character.level < maxLvl && xp >= this.xpForNextLevel && this.xpForNextLevel > 0) {
        xp -= this.xpForNextLevel;
        this.character.level++;
        levelsGained++;
      }
      if (this.character.level >= maxLvl) xp = 0;
      this.character.currentXP = xp;
      if (levelsGained > 0) {
        this.levelUpFlash = true;
        setTimeout(() => { this.levelUpFlash = false; }, 800);
        this.showToast('¡Nivel ' + this.character.level + '! +' + levelsGained + ' nivel' + (levelsGained > 1 ? 'es' : ''));
      } else {
        this.showToast('+' + amount + ' XP');
      }
    },

    /* ==================== CAMBIO DE CLASE ==================== */

    onClassChange() {
      const cls = CLASS_DATA[this.character.classKey];
      if (!cls) return;
      this.character.baseStats = { ...cls.baseStats };
      this.character.talents = {};
      this.character.currentXP = 0;
      this.character.currentHP = null;
      this.character.currentMana = null;
      this.character.trainedRanks = {};
      this.character.currentCooldowns = {};
      this.character.equipment = this.defaultEquipment();
      this.character.activeEffects = [];
      this.turnNumber = 1;
      this.showToast(`Clase cambiada a ${cls.name}`);
    },

    /* ==================== PERSISTENCIA ==================== */

    saveToLocalStorage() {
      try {
        localStorage.setItem('ttrpg_wow_character_v3', JSON.stringify(this.character));
        this.showToast('Ficha guardada');
      } catch (e) {
        this.showToast('Error al guardar');
      }
    },

    loadFromLocalStorage() {
      try {
        const data = localStorage.getItem('ttrpg_wow_character_v3');
        if (data) {
          this.character = JSON.parse(data);
          if (!CLASS_DATA[this.character.classKey]) this.character.classKey = Object.keys(CLASS_DATA)[0] || 'shaman';
          if (!this.character.talents) this.character.talents = {};
          if (this.character.currentXP === undefined) this.character.currentXP = 0;
          if (this.character.currentHP === undefined) this.character.currentHP = null;
          if (this.character.currentMana === undefined) this.character.currentMana = null;
          if (!this.character.trainedRanks) this.character.trainedRanks = {};
          if (!this.character.currentCooldowns) this.character.currentCooldowns = {};
          if (!this.character.baseStats) this.character.baseStats = { ...(CLASS_DATA[this.character.classKey] || FALLBACK_CLASS).baseStats };
          this.showToast('Ficha cargada');
        } else {
          this.showToast('No hay ficha guardada');
        }
      } catch (e) {
        this.showToast('Error al cargar');
      }
    },

    openExport() {
      this.showExportModal = true;
    },

    copyJson() {
      navigator.clipboard.writeText(this.exportedJson).then(() => {
        this.showToast('JSON copiado al portapapeles');
      }).catch(() => {
        this.showToast('No se pudo copiar');
      });
    },

    downloadJson() {
      const blob = new Blob([this.exportedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (this.character.name || 'personaje').replace(/\s+/g, '_') + '_ficha.json';
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Archivo descargado');
    },

    /* ==================== RESET ==================== */

    resetCharacter() {
      if (confirm('¿Reiniciar la ficha? Se perderán los cambios sin guardar.')) {
        this.character = createDefaultCharacter(this.character.classKey);
        this.turnNumber = 1;
        this.showToast('Ficha reiniciada');
      }
    },

    /* ==================== TOAST ==================== */

    showToast(msg) {
      this.toastMessage = msg;
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this.toastMessage = ''; }, 2500);
    },
  },

  mounted() {
    try {
      const saved = localStorage.getItem('ttrpg_wow_character_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.classKey && CLASS_DATA[parsed.classKey]) {
          this.character = parsed;
          if (!this.character.talents) this.character.talents = {};
          if (this.character.currentXP === undefined) this.character.currentXP = 0;
          if (this.character.currentHP === undefined) this.character.currentHP = null;
          if (this.character.currentMana === undefined) this.character.currentMana = null;
          if (!this.character.trainedRanks) this.character.trainedRanks = {};
          if (!this.character.currentCooldowns) this.character.currentCooldowns = {};
          if (!this.character.equipment) this.character.equipment = this.defaultEquipment();
          if (!this.character.activeEffects) this.character.activeEffects = [];
          if (!this.character.baseStats) this.character.baseStats = { ...CLASS_DATA[parsed.classKey].baseStats };
          if (!this.character.level || this.character.level < 1) this.character.level = 1;
          if (this.character.level > (window.MAX_LEVEL || 60)) this.character.level = window.MAX_LEVEL || 60;
        }
      }
    } catch (e) {
      console.error('Error loading saved character:', e);
    }
  },
}).mount('#app');
