window.APP_METHODS = {
    /* ==================== RANGOS DE HABILIDADES ==================== */

    maxAvailableRank(ability) {
      if (ability.damageRanges) {
        let rank = 0;
        for (const dr of ability.damageRanges) {
          if (this.character.level >= dr.level) rank = dr.rank;
        }
        return rank;
      }
      if (ability.rankLevels) {
        let rank = 0;
        for (let i = 0; i < ability.rankLevels.length; i++) {
          if (this.character.level >= ability.rankLevels[i]) rank = i + 1;
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
      if (talent.passive) return false;
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

    tierLabel(tier) {
      const labels = { 1: 'Nv. 10', 2: 'Nv. 15', 3: 'Nv. 20', 4: 'Nv. 25', 5: 'Nv. 30', 6: 'Nv. 35' };
      return labels[tier] || ('Tier ' + tier);
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
        // --- Chamán ---
        case 'elemental_focus':         return `Coste de maná: −${rank * 2}%`;
        case 'convection':              return `Daño de hechizos: +${rank * 3}%`;
        case 'improved_lightning_bolt': return `Daño Descarga de Rayo: +${rank * 5}%`;
        case 'call_of_thunder':         return `Crítico de hechizos: +${rank}%`;
        case 'lightning_mastery':       return `Daño Naturaleza: +${rank * 5}%`;
        case 'storm_power':             return `Poder de Hechizo: +${rank * 10}%`;
        // --- Mago Tier 1 ---
        case 'elemental_mastery':       return `Daño todos los hechizos: +${rank}%`;
        case 'mana_efficiency':         return `Coste de maná: −${rank * 2}%`;
        // --- Mago Tier 2 ---
        case 'improved_arcane_intellect': return `Intelecto Arcano: +${rank * 15}%`;
        case 'improved_frost_armor':    return `Armadura de Escarcha: +${rank * 10}%`;
        case 'improved_blink':          return `CD Traslación: −${rank} turno${rank > 1 ? 's' : ''}`;
        case 'magic_resistance':        return `Armadura mágica: +${rank}`;
        // --- Mago Tier 3 ---
        case 'improved_fire_blast':     return `CD Explosión de Fuego: −${rank} turno${rank > 1 ? 's' : ''}`;
        case 'frost_power':             return `Daño Escarcha: +${rank * 2}%`;
        case 'spell_crit_talent':       return `Crítico hechizos: +${rank}%`;
        case 'clearcasting':            return `Prob. hechizo gratuito: ${rank * 2}%`;
        // --- Warrior ---
        case 'master_of_weapons':       return `Pasiva: armas 1H + off o 2H equipables`;
        case 'improved_heroic_strike':  return `Coste Heroic Strike: −${rank} ira`;
        case 'anticipation':            return `Armadura: +${rank}`;
        case 'improved_bloodrage':      return `Bloodrage: +${rank * 3} ira`;
        case 'improved_charge':         return `Charge: +${rank * 2} ira`;
        case 'cruelty':                 return `Crítico físico: +${rank}%`;
        case 'improved_last_stand':     return `Last Stand cura: +${rank * 5}% vida`;
        case 'improved_cleave':         return `Cleave: +${rank * 20}% daño`;
        case 'improved_battle_shout':   return `Battle Shout: +${rank * 5}% AP, −${rank} ira`;
        // --- Rogue ---
        case 'vitality':                return `Regen energía: +${rank * 10}%`;
        case 'ruthlessness':            return `Coste finishers: −${rank * 2} energía`;
        case 'improved_backstab':       return `Coste Backstab: −${rank * 3} energía`;
        case 'opportunity':             return `Daño Backstab/Garrote/Ambush: +${rank * 4}%`;
        case 'precision':               return `Crítico físico: +${rank}%`;
        case 'endurance':               return `CD Evasión/Sprint: −${rank} turno${rank > 1 ? 's' : ''}`;
        case 'initiative':              return `Combo extra: ${rank * 15}% prob`;
        case 'energetic':               return `Energía máxima: +${rank * 4}`;
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
      const resType = this.resourceConfig.type;
      const isRage = resType === 'rage';
      const isEnergy = resType === 'energy';
      let cost;
      if (isRage) {
        cost = this.getEffectiveRageCost(ability);
      } else if (isEnergy) {
        cost = this.getEffectiveEnergyCost(ability);
      } else {
        cost = ability.scaledCost || ability.computedCost;
      }
      if (this.resourceActual < cost) {
        this.showToast(this.resourceLabel + ' insuficiente');
        return;
      }
      if (this.getCooldown(ability.id) > 0) {
        this.showToast(ability.name + ' está en cooldown (' + this.getCooldown(ability.id) + ' turno' + (this.getCooldown(ability.id) > 1 ? 's' : '') + ')');
        return;
      }
      const clearcast = (isRage || isEnergy) ? false : this.checkClearcasting();
      if (isRage) {
        this.character.currentRage = Math.min(this.resourceMax, this.resourceActual - cost);
      } else if (isEnergy) {
        this.character.currentEnergy = Math.max(0, this.resourceActual - cost);
      } else if (!clearcast) {
        this.character.currentMana = this.manaActual - cost;
      }
      const min = ability.currentMin || 0;
      const max = ability.currentMax || 0;
      let roll = min + Math.floor(Math.random() * (max - min + 1));
      const isCrit = Math.random() * 100 < parseFloat((isRage || isEnergy) ? this.meleeCrit : this.spellCrit);
      if (isCrit) roll = Math.round(roll * 1.5);
      if ((isRage || isEnergy) && this.warriorStance === 'battle') roll = Math.round(roll * 1.10);

      let comboSpent = 0;
      if (ability.spendsCombo) {
        comboSpent = this.character.comboPoints || 0;
        if (comboSpent === 0) {
          this.showToast('Sin puntos de combo');
          if (isEnergy) this.character.currentEnergy = Math.min(this.resourceMax, this.resourceActual + (ability.costEnergy || 0));
          return;
        }
        roll = roll * comboSpent;
        this.character.comboPoints = 0;
      }

      if (isRage && ability.generatesRage) {
        const baseGen = this.getEffectiveRageGen(ability);
        const rageGen = isCrit ? baseGen * 2 : baseGen;
        this.character.currentRage = Math.min(this.resourceMax, this.character.currentRage + rageGen);
      }
      ability.lastRoll = roll;
      ability.lastCrit = isCrit;
      if (ability.cooldown > 0) {
        if (!this.character.currentCooldowns) this.character.currentCooldowns = {};
        this.character.currentCooldowns[ability.id] = this.getEffectiveCooldown(ability);
      }
      let ccText = clearcast ? ' · ¡CLARIDAD ARCANA! Maná devuelto' : '';
      let rageText = '';
      if (isRage && ability.generatesRage) {
        const baseGen = this.getEffectiveRageGen(ability);
        const rageGen = isCrit ? baseGen * 2 : baseGen;
        rageText = ' · +' + rageGen + ' ira';
      }
      let comboText = '';
      if (ability.generatesCombo) {
        let comboGen = ability.generatesCombo;
        if (['sinister_strike', 'basic_attack'].includes(ability.id)) {
          const initChance = this.talentRank('initiative') * 15;
          if (Math.random() * 100 < initChance) comboGen += 1;
        }
        this.character.comboPoints = Math.min(5, (this.character.comboPoints || 0) + comboGen);
        comboText = ' · ' + this.character.comboPoints + ' combo';
      }
      if (ability.spendsCombo) {
        comboText = ' · ' + comboSpent + ' combo gastados';
      }
      if (ability.isHot) {
        this.showToast(ability.name + ' R' + ability.currentRank + ': ' + ability.hotTick + '/turno · ' + ability.hotDuration + 't (' + ability.hotTotal + ' total) — aplícalo manualmente en Efectos');
      } else if (ability.type === 'heal') {
        this.character.currentHP = Math.min(this.maxHP, this.hpActual + roll);
        this.showToast(ability.name + ' R' + ability.currentRank + ': ' + roll + ' curación' + (isCrit ? ' ¡CRÍTICO!' : '') + ccText + rageText + comboText);
      } else {
        const poisonDmg = this.getPoisonDamage();
        if (poisonDmg > 0 && ability.damageType === 'physical') {
          roll += poisonDmg;
        }
        this.turnDamage += roll;
        let poisonText = poisonDmg > 0 && ability.damageType === 'physical' ? ' (+' + poisonDmg + ' veneno)' : '';
        let dmgText = roll > 0 ? (roll + ' daño' + (isCrit ? ' ¡CRÍTICO!' : '') + poisonText) : ability.inflictsEffects ? '¡Aturde al enemigo!' : 'Lanzado';
        this.showToast(ability.name + ' R' + ability.currentRank + ': ' + dmgText + ccText + rageText + comboText);
        const hits = ability.multiHit || 1;
        for (let h = 0; h < hits; h++) {
          let hitRoll = roll;
          if (hits > 1 && h > 0) {
            hitRoll = (ability.currentMin || 0) + Math.floor(Math.random() * ((ability.currentMax || 0) - (ability.currentMin || 0) + 1));
            if (isCrit) hitRoll = Math.round(hitRoll * 1.5);
            if (isRage && this.warriorStance === 'battle') hitRoll = Math.round(hitRoll * 1.10);
            if (poisonDmg > 0 && ability.damageType === 'physical') hitRoll += poisonDmg;
            this.turnDamage += hitRoll;
          }
          this.sendDamageEvent(ability, hitRoll, h + 1, hits);
        }
      }
    },

    getPoisonDamage() {
      if (!this.character.activeEffects) return 0;
      for (const eff of this.character.activeEffects) {
        if (eff.type === 'buff' && eff.target === 'poisonDamage') return eff.value;
      }
      return 0;
    },

    hasPoison() {
      return this.getPoisonDamage() > 0;
    },

    checkClearcasting() {
      const cc = this.talentRank('clearcasting');
      if (cc <= 0) return false;
      return Math.random() * 100 < cc * 2;
    },

    getEffectiveCooldown(ability) {
      let cd = ability.cooldown;
      if (ability.id === 'fire_blast') {
        cd -= this.talentRank('improved_fire_blast');
      }
      if (ability.id === 'blink') {
        cd -= this.talentRank('improved_blink');
      }
      if (['evasion', 'sprint'].includes(ability.id)) {
        cd -= this.talentRank('endurance');
      }
      return Math.max(0, cd);
    },

    getEffectiveRageCost(ability) {
      let cost = ability.costRage || 0;
      if (ability.id === 'heroic_strike') {
        cost -= this.talentRank('improved_heroic_strike');
      }
      if (ability.id === 'shout') {
        cost -= this.talentRank('improved_battle_shout');
      }
      return Math.max(0, cost);
    },

    getEffectiveEnergyCost(ability) {
      let cost = ability.costEnergy || 0;
      if (ability.spendsCombo) {
        cost -= this.talentRank('ruthlessness') * 2;
      }
      if (ability.id === 'backstab') {
        cost -= this.talentRank('improved_backstab') * 3;
      }
      return Math.max(0, cost);
    },

    getEffectiveRageGen(ability) {
      let gen = ability.generatesRage || 0;
      if (ability.id === 'charge') {
        gen += this.talentRank('improved_charge') * 2;
      }
      return gen;
    },

    getEffectiveRageGain(ability) {
      let gain = ability.rageGain || 0;
      if (ability.id === 'bloodrage') {
        gain += this.talentRank('improved_bloodrage') * 3;
      }
      return gain;
    },

    castUtility(ability) {
      const resType = this.resourceConfig.type;
      const isRage = resType === 'rage';
      const isEnergy = resType === 'energy';
      let cost;
      if (isRage) {
        cost = ability.costRage || 0;
      } else if (isEnergy) {
        cost = this.getEffectiveEnergyCost(ability);
      } else {
        cost = ability.scaledCost || 0;
      }
      if (this.getCooldown(ability.id) > 0) {
        this.showToast(ability.name + ' está en cooldown (' + this.getCooldown(ability.id) + ' turno' + (this.getCooldown(ability.id) > 1 ? 's' : '') + ')');
        return;
      }
      if (ability.blockedStance && this.warriorStance === ability.blockedStance) {
        this.showToast(ability.name + ' no se puede usar en esta estancia');
        return;
      }
      if (isRage) {
        if (this.resourceActual < cost) {
          this.showToast('Ira insuficiente');
          return;
        }
        this.character.currentRage = Math.min(this.resourceMax, this.resourceActual - cost);
      } else if (isEnergy) {
        if (this.resourceActual < cost) {
          this.showToast('Energía insuficiente');
          return;
        }
        this.character.currentEnergy = Math.max(0, this.resourceActual - cost);
      } else {
        if (this.manaActual < cost) {
          this.showToast('Maná insuficiente');
          return;
        }
        const clearcast = this.checkClearcasting();
        if (!clearcast) {
          this.character.currentMana = this.manaActual - cost;
        }
      }
      const cd = this.getEffectiveCooldown(ability);
      if (cd > 0) {
        if (!this.character.currentCooldowns) this.character.currentCooldowns = {};
        this.character.currentCooldowns[ability.id] = cd;
      }
      if (ability.healthCostPct) {
        const healthLost = Math.round(this.maxHP * ability.healthCostPct);
        this.character.currentHP = Math.max(1, this.hpActual - healthLost);
        if (ability.rageGain && isRage) {
          const rageGain = this.getEffectiveRageGain(ability);
          this.character.currentRage = Math.min(this.resourceMax, this.character.currentRage + rageGain);
          this.showToast(ability.name + ': -' + healthLost + ' vida · +' + rageGain + ' ira');
        } else {
          this.showToast(ability.name + ': -' + healthLost + ' vida');
        }
      } else if (ability.buff && ability.buff.applySelf) {
        if (!this.character.activeEffects) this.character.activeEffects = [];
        this.character.activeEffects = this.character.activeEffects.filter(e => e.name !== ability.name);
        const hpPercentBefore = this.maxHP > 0 ? this.hpActual / this.maxHP : 1;
        let buffValue = ability.currentBuffValue;
        if (ability.id === 'shout') {
          buffValue = Math.round(buffValue * (1 + this.talentRank('improved_battle_shout') * 0.05));
        }
        const effectType = ability.buff.isHot ? 'hot' : 'buff';
        this.character.activeEffects.push({
          id: Date.now() + Math.random(),
          type: effectType,
          name: ability.name,
          target: ability.buff.isHot ? 'hp' : ability.currentBuffStat,
          value: buffValue,
          duration: ability.currentBuffDuration,
          isPercent: ability.buff.isPercent || false,
        });
        if (ability.buff.isPercent && ability.currentBuffStat === 'maxHP') {
          this.character.currentHP = Math.round(this.maxHP * hpPercentBefore);
          if (ability.id === 'last_stand') {
            const healPct = this.talentRank('improved_last_stand') * 0.05;
            if (healPct > 0) {
              const heal = Math.round(this.maxHP * healPct);
              this.character.currentHP = Math.min(this.maxHP, this.hpActual + heal);
            }
          }
        }
        this.showToast(ability.name + ' R' + ability.currentRank + ': +' + buffValue + (ability.buff.isPercent ? '%' : '') + ' ' + ability.currentBuffStat);
      } else if (ability.buff) {
        const buffText = '+' + ability.currentBuffValue + ' ' + ability.currentBuffStat + ' (' + ability.currentBuffDuration + ' turnos)';
        this.showToast(ability.name + ' R' + ability.currentRank + ': ' + buffText + ' — aplícalo manualmente en Efectos');
      } else {
        this.showToast(ability.name + ': Lanzado');
      }
    },

    sendDamageEvent(ability, damage, hitNum, totalHits) {
      try {
        if (typeof firebase === 'undefined' || !firebase.apps.length) return;
        const db = firebase.database();
        let effects = null;
        if (ability.inflictsEffects) {
          effects = ability.inflictsEffects.map(eff => {
            if (eff.type === 'dot' && ability.currentDotValue !== undefined) {
              return { ...eff, value: ability.currentDotValue, duration: ability.currentDotDuration || eff.duration };
            }
            if (eff.type === 'status' && ability.currentStunDuration !== null && ability.currentStunDuration !== undefined) {
              return { ...eff, duration: ability.currentStunDuration };
            }
            return { ...eff };
          });
        }
        const abilityName = totalHits > 1 ? ability.name + ' (' + hitNum + '/' + totalHits + ')' : ability.name;
        db.ref('damageEvents').push({
          player: this.character.name || 'Jugador',
          ability: abilityName,
          rank: ability.currentRank || 1,
          damage: damage,
          damageType: this.hasPoison() && ability.damageType === 'physical' ? 'magical' : (ability.damageType || 'magical'),
          aoe: ability.aoe || false,
          effects: effects,
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
      const resType = this.resourceConfig.type;
      if (resType === 'rage') {
        this.processEffects();
        this.turnNumber++;
        this.turnDamage = 0;
        this.showToast('Fin de turno ' + (this.turnNumber - 1));
      } else if (resType === 'energy') {
        const baseRegen = this.resourceConfig.regen || 20;
        const vitalityBonus = 1 + this.talentRank('vitality') * 0.10;
        const regen = Math.round(baseRegen * vitalityBonus);
        this.character.currentEnergy = Math.min(this.resourceMax, this.resourceActual + regen);
        this.processEffects();
        this.turnNumber++;
        this.turnDamage = 0;
        this.showToast('Fin de turno ' + (this.turnNumber - 1) + ' · +' + regen + ' energía');
      } else {
        const regen = Math.round(this.manaRegen * 0.5);
        this.character.currentMana = Math.min(this.maxMana, this.manaActual + regen);
        this.processEffects();
        this.turnNumber++;
        this.turnDamage = 0;
        this.showToast('Fin de turno ' + (this.turnNumber - 1) + ' · +' + regen + ' maná regenerado');
      }
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
      if (this.character.currentHP !== null && this.character.currentHP > this.maxHP) {
        this.character.currentHP = this.maxHP;
      }
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

    takeDamage(amount, dmgType) {
      if (amount <= 0) return;
      const type = dmgType || 'magical';
      if (type === 'physical') {
        const evadeChance = this.evasion;
        if (Math.random() * 100 < evadeChance) {
          let rageText = '';
          if (this.resourceConfig.type === 'rage') {
            const rageGain = 2 + Math.floor(Math.random() * 3);
            this.character.currentRage = Math.min(this.resourceMax, this.resourceActual + rageGain);
            rageText = ' · +' + rageGain + ' ira';
          }
          this.hpLossAmount = null;
          this.showToast('¡Esquivado!' + rageText);
          return;
        }
        const reduction = this.physReduction;
        amount = Math.round(amount * (1 - reduction / 100));
      } else {
        const reduction = this.magicReduction;
        amount = Math.round(amount * (1 - reduction / 100));
      }
      this.character.currentHP = Math.max(0, this.hpActual - amount);
      this.hpLossAmount = null;
      let rageText = '';
      if (this.resourceConfig.type === 'rage') {
        const rageGain = 2 + Math.floor(Math.random() * 3);
        this.character.currentRage = Math.min(this.resourceMax, this.resourceActual + rageGain);
        rageText = ' · +' + rageGain + ' ira';
      }
      this.showToast('-' + amount + ' vida' + rageText);
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
        } else if (ability.type === 'utility' && !ability.buffRanks) {
          if (this.character.level >= ability.requiredLevel && this.trainedRank(ability.id) === 0) {
            this.character.trainedRanks[ability.id] = 1;
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

    grantPassiveTalents() {
      if (!this.classConfig.talents) return;
      for (const talent of this.classConfig.talents) {
        if (talent.passive && this.character.level >= (talent.requiredLevel || 1)) {
          if (!this.character.talents) this.character.talents = {};
          if (!this.character.talents[talent.id]) this.character.talents[talent.id] = 1;
        }
      }
    },

    defaultEquipment() {
      const emptyBonus = { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 };
      const slots = ['head', 'chest', 'hands', 'legs', 'feet', 'mainHand', 'offHand', 'twoHand'];
      const extras = {
        head: ['defense'], chest: ['defense'],
        mainHand: ['weaponDamage'], offHand: ['weaponDamage', 'defense'], twoHand: ['weaponDamage'],
      };
      const eq = {};
      for (const s of slots) {
        const item = { name: '', bonus: { ...emptyBonus } };
        if (extras[s]) for (const f of extras[s]) item[f] = 0;
        eq[s] = item;
      }
      eq.mainHand.name = 'Arma básica';
      eq.mainHand.weaponDamage = 3;
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
      this.character.currentRage = 0;
      this.character.currentEnergy = 100;
      this.character.comboPoints = 0;
      this.character.trainedRanks = {};
      this.character.currentCooldowns = {};
      this.character.equipment = this.defaultEquipment();
      this.character.activeEffects = [];
      this.grantPassiveTalents();
      this.turnNumber = 1;
      this.showToast(`Clase cambiada a ${cls.name}`);
    },

    /* ==================== PERSISTENCIA ==================== */

    saveToLocalStorage() {
      try {
        localStorage.setItem('ttrpg_wow_character_v10', JSON.stringify(this.character));
        this.showToast('Ficha guardada');
      } catch (e) {
        this.showToast('Error al guardar');
      }
    },

    loadFromLocalStorage() {
      try {
        const data = localStorage.getItem('ttrpg_wow_character_v10');
        if (data) {
          this.character = JSON.parse(data);
          if (!CLASS_DATA[this.character.classKey]) this.character.classKey = Object.keys(CLASS_DATA)[0] || 'shaman';
          if (!this.character.talents) this.character.talents = {};
          if (this.character.currentXP === undefined) this.character.currentXP = 0;
          if (this.character.currentHP === undefined) this.character.currentHP = null;
          if (this.character.currentMana === undefined) this.character.currentMana = null;
          if (this.character.currentRage === undefined) this.character.currentRage = 0;
          if (this.character.currentEnergy === undefined) this.character.currentEnergy = 100;
          if (this.character.comboPoints === undefined) this.character.comboPoints = 0;
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

    fullRest() {
      this.character.currentHP = this.maxHP;
      this.character.comboPoints = 0;
      if (this.resourceConfig.type === 'rage') {
        this.character.currentRage = 0;
        this.showToast('Full Rest: vida al máximo, ira reseteada');
      } else if (this.resourceConfig.type === 'energy') {
        this.character.currentEnergy = this.resourceMax;
        this.showToast('Full Rest: vida y energía al máximo');
      } else {
        this.character.currentMana = this.maxMana;
        this.showToast('Full Rest: vida y maná al máximo');
      }
      this.character.currentCooldowns = {};
      this.turnNumber = 1;
      this.turnDamage = 0;
    },

    resetCharacter() {
      if (confirm('¿Reiniciar la ficha? Se perderán los cambios sin guardar.')) {
        this.character = createDefaultCharacter(this.character.classKey);
        this.turnNumber = 1;
        this.showToast('Ficha reiniciada');
      }
    },

    /* ==================== TOAST ==================== */

    updateClassColor() {
      const color = this.classConfig.color || '#C79C6E';
      const root = document.documentElement;
      root.style.setProperty('--class-color', color);
      root.style.setProperty('--class-glow', color + '4D');
    },

    showToast(msg) {
      this.toastMessage = msg;
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this.toastMessage = ''; }, 2500);
    },
};
