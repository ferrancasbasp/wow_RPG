#!/usr/bin/env python3
"""
Descarga los iconos de WoW Classic para las habilidades y talentos del Mago.
Fuente: WoWHead CDN (wow.zamimg.com)

Uso: python3 download_icons.py
"""

import urllib.request
import ssl
import os
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://wow.zamimg.com/images/wow/icons/large"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

ICONS = {
    "img/classes/mage.jpg": "classicon_mage",

    "img/abilities/mage/fireball.jpg": "spell_fire_flamebolt",
    "img/abilities/mage/fire_blast.jpg": "spell_fire_sealoffire",
    "img/abilities/mage/frostbolt.jpg": "spell_frost_frostbolt02",
    "img/abilities/mage/ice_barrier.jpg": "spell_frost_glacier",
    "img/abilities/mage/arcane_missiles.jpg": "spell_nature_starfall",
    "img/abilities/mage/arcane_explosion.jpg": "spell_holy_circleofrenewal",

    "img/talents/mage/ignite.jpg": "spell_fire_incinerate",
    "img/talents/mage/frostbite.jpg": "spell_frost_chainingbolt",
    "img/talents/mage/arcane_concentration.jpg": "spell_holy_arcaneintellect",
    "img/talents/mage/improved_fireball.jpg": "spell_fire_flamebolt",
    "img/talents/mage/ice_shards.jpg": "spell_ice_shards",
    "img/talents/mage/arcane_mind.jpg": "spell_holy_magicalsentry",
    "img/talents/mage/fire_power.jpg": "spell_fire_fire",
    "img/talents/mage/spell_power.jpg": "spell_arcane_starfire",
}

def download(relative_path, icon_name):
    out_path = os.path.join(OUTPUT_DIR, relative_path)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    url = f"{BASE_URL}/{icon_name}.jpg"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=15, context=ctx)
        data = resp.read()
        with open(out_path, "wb") as f:
            f.write(data)
        print(f"  OK  {relative_path} ({len(data)} bytes)")
        return True
    except Exception as e:
        print(f"  FAIL {relative_path}: {e}")
        return False

def main():
    print("Descargando iconos de WoW Classic para el Mago...\n")
    ok = 0
    fail = 0
    for path, icon in ICONS.items():
        if download(path, icon):
            ok += 1
        else:
            fail += 1
        time.sleep(0.2)
    print(f"\nDone: {ok} OK, {fail} failed")
    if fail > 0:
        print("\nSi algunos fallaron, busca el nombre correcto del icono en:")
        print("  https://www.wowhead.com/classic/spell=133/fireball")
        print("  (el nombre del icono aparece en la URL de la imagen)")

if __name__ == "__main__":
    main()
