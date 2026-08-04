# Pal image review v102

This pull request validates the canonical Pal image migration.

The validation workflow checks all 299 PalDB Pal rows against the fixed 300-row 1.0 icon manifest, verifies the mapped image files exist in the fixed source tree, and rechecks the Pal numbers visible in the reported screenshot.

Unnumbered special rows, including values stored as the literal string `NULL`, receive unique runtime IDs and are matched by normalized English name. The only manifest-only row is `Gumoss (Special)`, which intentionally reuses the Gumoss image.
