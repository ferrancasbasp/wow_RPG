# WoW TTRPG - Guía de Desarrollo

## Repositorio
- **GitHub**: https://github.com/ferrancasbasp/wow_RPG
- **Página**: https://ferrancasbasp.github.io/wow_RPG/
- **Master Screen**: https://ferrancasbasp.github.io/wow_RPG/master.html

## Estructura del proyecto
```
index.html              HTML template + script tags
master.html             Master screen (self-contained)
css/main.css            Todos los estilos
js/constants.js         Constantes globales (CLASS_DATA, EFFECT_TYPES, etc)
js/data.js              Data del Vue app
js/computed.js          Computed properties
js/methods.js           Métodos
js/app.js               Ensamblador (createApp + mounted + watch)
js/classes/*.js         Una clase por archivo
js/npc-registry.js      NPCs pregenerados
js/firebase-config.js   Configuración Firebase
js/xp-table.js          Tabla XP WoW Classic
img/classes/            Iconos de clase
img/abilities/<class>/  Iconos de habilidades
img/talents/<class>/    Iconos de talentos
```

## Cómo hacer cambios y pushear
```bash
cd /home/jovyan/wow_RPG
git add -A
git commit -m "Descripción del cambio"
git push origin main
```

## Añadir una nueva clase
1. Crear `js/classes/miclase.js` con `window.CLASS_REGISTRY.miclase = { ... }`
2. Añadir `<script src="js/classes/miclase.js"></script>` en `index.html` (head)
3. La clase aparece automáticamente en el dropdown

### Estructura de una clase
```js
window.CLASS_REGISTRY.miclase = {
  name: 'Nombre',
  color: '#HEXCOLOR',     // Color WoW Classic
  icon: ' Emoji',
  iconImg: 'img/classes/miclase.jpg',  // Opcional

  formulas: {
    hp: (s, lvl) => ...,
    mana: (s, lvl) => ...,
    spellPower: (s) => ...,
    attackPower: (s) => ...,
    manaRegen: (s) => ...,
  },

  baseStats: { fuerza: X, agilidad: X, intelecto: X, aguante: X, espiritu: X },
  startingLevel: 1,
  statGrowth: { fuerza: X, agilidad: X, intelecto: X, aguante: X, espiritu: X },
  armor: X,
  magicResist: X,

  resource: {
    type: 'mana' | 'rage' | 'energy',
    label: 'Maná' | 'Ira' | 'Energía',
    color: '#HEX',
    max: 100,        // null para mana (usa fórmula)
    start: 'full',   // 'full' o 0
    regen: 20,       // Solo energy
  },

  talents: [...],
  abilities: [...],
};
```

### Habilidades
```js
// Daño con damageRanges (mago, etc)
{ id: 'fireball', name: 'Fireball', icon: '🔥', iconImg: 'img/abilities/mage/fireball.jpg',
  school: 'Fuego', type: 'damage', requiredLevel: 1, damageType: 'magical',
  baseDamage: 60, spellPowerRatio: 1.0, costPct: 0.09, castType: 'cast', cooldown: 0,
  damageRanges: [{ rank: 1, level: 1, min: 14, max: 22 }, ...] }

// Daño con fórmula WoW Classic (warrior, rogue)
{ id: 'heroic_strike', name: 'Heroic Strike', icon: '⚔️',
  school: 'Físico', type: 'damage', requiredLevel: 1, damageType: 'physical',
  costRage: 15, castType: 'instant', cooldown: 0,
  weaponMultiplier: 1.0,   // 1.0 = 100% arma, 1.5 = 150%
  bonusPerRank: [11, 25, 44, 63, 92],
  rankLevels: [1, 6, 12, 18, 24] }

// Basic Attack (sin damageRanges, calcula de arma + AP)
{ id: 'basic_attack', name: 'Basic Attack', icon: '👊',
  type: 'damage', damageType: 'physical', requiredLevel: 1,
  usesWeaponDamage: true }

// Utility (buffs, no envían daño al master)
{ id: 'arcane_intellect', name: 'Arcane Intellect', icon: '🧠',
  type: 'utility', requiredLevel: 1,
  costPct: 0.06, castType: 'instant', cooldown: 0,
  buff: { stat: 'intelecto', duration: 30, applySelf: false },
  buffRanks: [{ rank: 1, level: 1, value: 2, costPct: 0.06 }, ...] }

// HoT ( Heal over Time)
{ id: 'renew', name: 'Renew', icon: '🌿',
  type: 'heal', isHot: true, hotDuration: 5,
  ... }

// DoT (Damage over Time)
{ id: 'shadow_word_pain', name: 'Shadow Word: Pain', icon: '🩸',
  type: 'damage', isDot: true, dotDuration: 6,
  ... }
```

### Talentos
```js
{ id: 'cruelty', name: 'Cruelty', icon: '💢', iconImg: 'img/talents/warrior/cruelty.jpg',
  description: 'Aumenta tu probabilidad de crítico físico un 1% por punto.',
  maxRank: 5, tier: 1, requires: null }

// Pasiva (se otorga gratis)
{ id: 'master_of_weapons', name: 'Maestría de Armas', icon: '⚔️',
  description: '...', maxRank: 1, tier: 1, requires: null,
  passive: true, requiredLevel: 2 }
```

## Añadir iconos
1. Poner los archivos TGA en una carpeta (ej: `/home/jovian/wow_plantilla/ICONS_MiClase/`)
2. Convertir con Pillow:
```python
from PIL import Image
img = Image.open('archivo.tga').convert('RGBA')
bg = Image.new('RGBA', img.size, (0, 0, 0, 255))
bg.paste(img, mask=img.split()[3])
img = bg.convert('RGB').resize((128, 128), Image.LANCZOS)
img.save('img/abilities/miclase/habilidad.jpg', 'JPEG', quality=90)
```
3. Asignar `iconImg: 'img/abilities/miclase/habilidad.jpg'` en la clase
4. Si no hay icono, el emoji funciona como fallback

## Verificar JS antes de pushear
```bash
cat js/constants.js js/data.js js/computed.js js/methods.js js/app.js > /tmp/check.js
node --check /tmp/check.js
```

## Firebase
- Proyecto: rpgwow-118f7
- Región: europe-west1
- Realtime Database URL: https://rpgwow-118f7-default-rtdb.europe-west1.firebasedatabase.app
- Reglas: read/write true (modo test)
- Los eventos se envían a `damageEvents` con `{player, ability, damage, damageType, aoe, effects, assigned}`

## Colores WoW Classic por clase
| Clase | Color | Hex |
|-------|-------|-----|
| Warrior | Marrón | #C79C6E |
| Paladin | Rosa | #F58CBA |
| Hunter | Verde | #ABD473 |
| Rogue | Amarillo | #FFF569 |
| Priest | Blanco | #FFFFFF |
| Shaman | Azul | #0070DE |
| Mage | Azul cian | #3FC7EB |
| Warlock | Púrpura | #9482C9 |
| Druid | Naranja | #FF7D0A |

## Fórmulas clave
- **AP**: `fuerza * 2` (warrior), `fuerza * 2 + agilidad` (rogue), `0` (casters)
- **DañoBasic Attack**: `weaponDamage + AP/7`, ±15%
- **Daño habilidades melee**: `weaponDamage * multiplier + AP/7 + bonusPerRank`, ±15%
- **Spell crit**: `5% + Int/60 + level*0.02%`
- **Melee crit**: `5% + Agi/20 + level*0.02%`
- **Armor reduction**: `armor / (armor + 50 + 5*level) * 100`
- **Mana regen**: `spirit * 0.25 + 15`
- **Rage**: genera 5 por Basic Attack (10 si crit), 2-4 al recibir daño
- **Energy**: 100 max, regen 20 por Fin de Turno
- **Combo points**: max 5, generados por Sinister Strike etc, gastados por Eviscerate
