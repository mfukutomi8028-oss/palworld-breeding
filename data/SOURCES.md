# Palworld 1.0 vendored data

- Pal master and image manifest: bowenchen-1/palworld-guide @ bbe68288a4404ea22467d53b73aee15a70abaa97
- Japanese localization: zaigie/palworld-server-tool @ f45a48ef25ce08a5311a27e55b17062ba0bb4362
- Breeding engine: palcalc-tools/palworld-1.0-calculator @ 979258dfb579f1c5d068d41be0f5dd7297b401a8
- Imported: 2026-08-05
- Game target: Palworld 1.0

## PalDB species stats v110

- Source: `https://paldb.cc/en/Pal_Stats`
- Ordinary roster: PalDB `Stats /288` table.
- Unnumbered collaboration roster: 11 individual PalDB `Stats` panels.
- Fields: HP, Attack, Defense, Total.
- `Attack` is PalDB's ranged/ShotAttack species scaling value, not MeleeAttack.
- Generated reproducibly with `scripts/build-paldb-stats.py`.
- The generator verifies 288 + 11 = 299 rows, checks `Total = HP + Attack + Defense`, and compares the existing HP/Defense values before writing Attack.
