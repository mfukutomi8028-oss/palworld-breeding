# Pal image review v102

This pull request validates the canonical Pal image migration.

The validation workflow checks all 300 PalDB rows against the fixed 1.0 icon manifest, verifies the mapped image files exist in the fixed source tree, and rechecks the Pal numbers visible in the reported screenshot.

Unnumbered special rows are matched by normalized English name, which mirrors the runtime fallback rule.
