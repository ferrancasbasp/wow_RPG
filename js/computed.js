window.APP_COMPUTED = {
    // Objeto de configuración de la clase seleccionada
    classConfig() {
      return CLASS_DATA[this.character.classKey] || CLASS_DATA.shaman || FALLBACK_CLASS;
    },

    // Style binding para CSS variables de color de clase
    appStyle() {
      const color = this.classConfig.color || '#C79C6E';
      return {
        '--class-color': color,
        '--class-glow': color + '4D',
      };
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
      return result;
    },

    // Vida máxima — fórmula de clase + Aguante + nivel + buffs
    maxHP() {
      let hp = Math.round(this.classConfig.formulas.hp(this.finalStats, this.character.level));
      if (this.character.activeEffects) {
        for (const eff of this.character.activeEffects) {
          if (eff.type === 'buff' && eff.target === 'maxHP') {
            if (eff.isPercent) {
              hp = Math.round(hp * (1 + eff.value / 100));
            } else {
              hp += eff.value;
            }
          }
        }
      }
      return hp;
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
      sp = Math.round(sp * (1 + stormPower * 0.10));
      sp += this.effectStatBonus('spellPower');
      return sp;
    },

    // Prob. Crítico de Hechizos (5% base + Intelecto + nivel + talentos)
    // WoW Classic: 60 Int = 1% spell crit, +0.02% por nivel
    // Talento "Llamada del Trueno" (Chamán): +1% por punto
    spellCrit() {
      const fromInt = this.finalStats.intelecto / 60;
      const fromLevel = this.character.level * 0.02;
      const fromTalent = this.talentRank('call_of_thunder') + this.talentRank('spell_crit_talent');
      const fromBuff = this.effectStatBonus('spellCrit');
      return (5 + fromInt + fromLevel + fromTalent + fromBuff).toFixed(2);
    },

    // Prob. Crítico Físico/Melee (5% base + Agilidad + nivel)
    // WoW Classic: 20 Agi = 1% melee crit, +0.02% por nivel
    meleeCrit() {
      const fromAgi = this.finalStats.agilidad / 20;
      const fromLevel = this.character.level * 0.02;
      const stanceBonus = this.warriorStance === 'fury' ? 5 : 0;
      const fromTalent = this.talentRank('cruelty');
      const fromBuff = this.effectStatBonus('physCrit');
      return (5 + fromAgi + fromLevel + stanceBonus + fromTalent + fromBuff).toFixed(2);
    },

    // Poder de Ataque (Fuerza × 2 + Nivel × 2 - 10)
    // WoW Classic: melee AP = STR×2 + level×2 - 10
    attackPower() {
      const base = this.finalStats.fuerza * 2 + this.character.level * 2 - 10;
      const fromFormula = this.classConfig.formulas.attackPower(this.finalStats);
      let total = Math.max(base, fromFormula);
      total += this.effectStatBonus('attackPower');
      return total;
    },

    // Prob. Evasión (base 5% + buffs de evasion)
    evasion() {
      let total = 5;
      total += this.effectStatBonus('evasion');
      return Math.min(95, total);
    },

    // Regen. de Maná desde Espíritu (fórmula de clase)
    manaRegen() {
      if (!this.classConfig.formulas.manaRegen) return 0;
      return this.classConfig.formulas.manaRegen(this.finalStats, this.character.level);
    },

    // Armadura física: base de clase + talentos + stance + buffs de armor activos
    armorTotal() {
      let total = this.classConfig.armor || 0;
      total += this.talentRank('anticipation');
      if (this.warriorStance === 'protection' && this.classConfig.stances) total += 5;
      if (this.character.activeEffects) {
        for (const eff of this.character.activeEffects) {
          if (eff.type === 'buff' && eff.target === 'armor') total += eff.value;
        }
      }
      return total;
    },

    // Armadura mágica: base de clase + talentos + buffs activos
    magicResistTotal() {
      let total = this.classConfig.magicResist || 0;
      total += this.talentRank('magic_resistance');
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
      return Math.max(0, this.character.level - 9);
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
      return this.classConfig.abilities.filter(a => a.type !== 'utility').map(ability => {
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

        // --- Mago Tier 1: Maestría Elemental (+1% daño todos los hechizos) ---
        const elemMastery = this.talentRank('elemental_mastery');
        if (elemMastery > 0) {
          value *= (1 + elemMastery * 0.01);
          talentNotes.push(`+${elemMastery}% Maestría`);
        }

        // --- Mago Tier 3: Poder de Escarcha (+2% daño Escarcha) ---
        if (ability.school === 'Escarcha') {
          const fp = this.talentRank('frost_power');
          if (fp > 0) {
            value *= (1 + fp * 0.02);
            talentNotes.push(`+${fp * 2}% Escarcha`);
          }
        }

        // === COSTE DE MANÁ (% del maná base) ===
        let cost = (ability.costPct || 0) * this.baseMana;
        // Chamán: Enfoque Elemental (-2% coste)
        const ef = this.talentRank('elemental_focus');
        if (ef > 0) cost *= (1 - ef * 0.02);
        // Mago Tier 1: Eficiencia Arcana (-2% coste)
        const me = this.talentRank('mana_efficiency');
        if (me > 0) cost *= (1 - me * 0.02);

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

    // Recurso dinámico (mana o rage según la clase)
    resourceConfig() {
      return this.classConfig.resource || { type: 'mana', label: 'Maná', color: '#3498db', max: null, start: 'full' };
    },

    resourceMax() {
      const rc = this.resourceConfig;
      if (rc.type === 'rage') return rc.max || 100;
      if (rc.type === 'energy') return rc.max || 100;
      return this.maxMana;
    },

    resourceActual() {
      const rc = this.resourceConfig;
      if (rc.type === 'rage') {
        return Math.max(0, Math.min(this.resourceMax, this.character.currentRage || 0));
      }
      if (rc.type === 'energy') {
        return Math.max(0, Math.min(this.resourceMax, this.character.currentEnergy ?? 100));
      }
      return this.manaActual;
    },

    resourcePercent() {
      if (this.resourceMax === 0) return 0;
      return Math.floor((this.resourceActual / this.resourceMax) * 100);
    },

    resourceLabel() {
      return this.resourceConfig.label || 'Maná';
    },

    // Habilidades entrenadas (con dados escalados por rango) — solo damage/heal
    unlockedAbilities() {
      const weaponDmg = this.totalWeaponDamage;
      const apBonus = Math.round(this.attackPower / 7);
      return this.computedAbilities.filter(a => a.type !== 'utility' && this.trainedRank(a.id) > 0).map(a => {
        const rank = this.trainedRank(a.id);
        const dmgRange = a.damageRanges ? a.damageRanges.find(dr => dr.rank === rank) : null;
        const isPhysical = a.damageType === 'physical';
        const noWeaponScaling = a.dotScales || a.baseDamage === 0 || a.noWeaponScaling;
        const dmgBonus = (isPhysical && !noWeaponScaling) ? (weaponDmg + apBonus) : 0;
        let minVal = dmgRange ? (dmgRange.min + dmgBonus) : 0;
        let maxVal = dmgRange ? (dmgRange.max + dmgBonus) : 0;
        if (a.id === 'cleave') {
          const cleaveBonus = 1 + this.talentRank('improved_cleave') * 0.20;
          minVal = Math.round(minVal * cleaveBonus);
          maxVal = Math.round(maxVal * cleaveBonus);
        }
        const dotRange = a.dotRanges ? a.dotRanges.find(dr => dr.rank === rank) : null;
        const stunRange = a.stunRanks ? a.stunRanks.find(sr => sr.rank === rank) : null;
        return {
          ...a,
          currentRank: rank,
          currentMin: minVal,
          currentMax: maxVal,
          currentDotValue: dotRange ? dotRange.value : (a.inflictsEffects ? a.inflictsEffects[0].value : 0),
          currentDotDuration: dotRange ? dotRange.duration : (a.inflictsEffects ? a.inflictsEffects[0].duration : 0),
          currentStunDuration: stunRange ? stunRange.duration : null,
          scaledCost: Math.round(a.computedCost * (1 + (rank - 1) * 0.15)),
          effectiveRageCost: this.getEffectiveRageCost(a),
          effectiveRageGen: this.getEffectiveRageGen(a),
        };
      });
    },

    // Daño de arma total según modo del warrior
    totalWeaponDamage() {
      if (!this.character.equipment) return 0;
      if (this.warriorWeaponMode === 'dualwield') {
        const main = this.character.equipment.mainHand ? this.character.equipment.mainHand.weaponDamage || 0 : 0;
        const off = this.character.equipment.offHand ? this.character.equipment.offHand.weaponDamage || 0 : 0;
        return main + off;
      } else {
        return this.character.equipment.twoHand ? this.character.equipment.twoHand.weaponDamage || 0 : 0;
      }
    },

    // Habilidades de utilidad (buffs sin dados, no envian daño al master)
    unlockedUtility() {
      const resType = this.resourceConfig.type;
      const isRage = resType === 'rage';
      const isEnergy = resType === 'energy';
      return this.classConfig.abilities.filter(a => a.type === 'utility' && this.trainedRank(a.id) > 0).map(a => {
        const rank = this.trainedRank(a.id);
        const buffRank = a.buffRanks ? a.buffRanks.find(br => br.rank === rank) : null;
        let cost;
        if (isRage) {
          cost = buffRank ? (buffRank.costRage || 0) : (a.costRage || 0);
        } else if (isEnergy) {
          cost = buffRank ? (buffRank.costEnergy || 0) : (a.costEnergy || 0);
        } else {
          const costPct = buffRank ? buffRank.costPct : a.costPct;
          cost = Math.round((costPct || 0) * this.baseMana);
        }
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
          return this.character.level >= a.requiredLevel && this.trainedRank(a.id) === 0;
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
          return a.requiredLevel > this.character.level;
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
};
