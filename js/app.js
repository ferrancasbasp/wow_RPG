const { createApp } = Vue;

createApp({
  data: window.APP_DATA,
  computed: window.APP_COMPUTED,
  methods: window.APP_METHODS,
  mounted() {
    try {
      const saved = localStorage.getItem('ttrpg_wow_character_v14');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.classKey && CLASS_DATA[parsed.classKey]) {
          this.character = parsed;
          if (!this.character.talents) this.character.talents = {};
          if (this.character.currentXP === undefined) this.character.currentXP = 0;
          if (this.character.currentHP === undefined) this.character.currentHP = null;
          if (this.character.currentMana === undefined) this.character.currentMana = null;
          if (this.character.currentRage === undefined) this.character.currentRage = 0;
          if (this.character.currentEnergy === undefined) this.character.currentEnergy = 100;
          if (this.character.comboPoints === undefined) this.character.comboPoints = 0;
          if (!this.character.trainedRanks) this.character.trainedRanks = {};
          if (!this.character.currentCooldowns) this.character.currentCooldowns = {};
          if (!this.character.equipment) this.character.equipment = this.defaultEquipment();
          const eq = this.character.equipment;
          if (eq.weapon && !eq.mainHand) { eq.mainHand = eq.weapon; delete eq.weapon; }
          if (eq.offhand && !eq.offHand) { eq.offHand = eq.offhand; delete eq.offhand; }
          if (eq.dualwield) { delete eq.dualwield; }
          if (!eq.mainHand) eq.mainHand = { name: 'Arma básica', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 }, weaponDamage: 3 };
          if (eq.mainHand.weaponDamage === undefined) eq.mainHand.weaponDamage = 3;
          if (!eq.offHand) eq.offHand = { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 }, weaponDamage: 0, defense: 0 };
          if (!eq.twoHand) eq.twoHand = { name: '', bonus: { fuerza: 0, agilidad: 0, intelecto: 0, aguante: 0, espiritu: 0 }, weaponDamage: 0 };
          if (!this.character.activeEffects) this.character.activeEffects = [];
          if (!this.character.baseStats) this.character.baseStats = { ...CLASS_DATA[parsed.classKey].baseStats };
          if (!this.character.level || this.character.level < 1) this.character.level = 1;
          if (this.character.level > (window.MAX_LEVEL || 60)) this.character.level = window.MAX_LEVEL || 60;
          this.grantPassiveTalents();
        }
      }
    } catch (e) {
      console.error('Error loading saved character:', e);
    }
    this.updateClassColor();
  },
  watch: {
    'character.classKey'() {
      this.updateClassColor();
    },
  },
}).mount('#app');
