# Contributing to NaijaBase

Thank you for helping make Nigerian data more open, accurate, and usable. This
project is only as good as the people who review and improve it.

## Ways to contribute

- **Report a data error** — open an issue with the file, record, expected value,
  and a source.
- **Fix or add data** — submit a pull request that edits the relevant JSON file.
- **Add a dataset** — propose a new file with a schema and source.
- **Improve tooling** — validation, exports, schemas, docs, or examples.
- **Translate or document** — clearer docs and examples are always welcome.

## Data principles

1. **Source everything.** Every data change must cite a source — INEC, NBS, a
   gazette, Wikipedia, OpenStreetMap, or another dataset. Add the source URL to
   the PR description. Unverifiable edits will be asked for a source.
2. **Stable IDs, always.** Never rename or recycle an existing `id`. If a name
   changes, keep the ID and update the `name` field. Consumers depend on IDs.
3. **Don't reformat unrelated records.** Keep diffs small and reviewable. Avoid
   reordering arrays or re-indenting the whole file.
4. **Preserve the schema.** Do not add, rename, or remove fields without first
   opening an issue to discuss the schema change.
5. **Prefer official boundaries and counts.** Where data conflicts, prefer the
   most recent official source and note the discrepancy.
6. **Be careful with sensitive data.** Ethnic, religious, and political data
   must be sourced, neutral, and descriptive. Never submit data that could
   incite harm or target a community.
7. **Label confidence.** Use `null` for unknown values rather than guessing.
   Never invent coordinates, counts, or descriptions.

## Repository layout

```
data/
  base/          states, LGAs, zones, languages, festivals
  location/      wards and ward indexes
  politics/      parties, constituencies
docs/            data dictionary and generated statistics
scripts/         validation and statistics tooling
```

## Editing data

1. Fork the repository and create a branch:
   `git checkout -b data/add-missing-capitals`.
2. Edit the smallest file possible under `data/`.
3. Run validation:
   ```bash
   npm run validate
   ```
4. Regenerate stats if counts changed:
   ```bash
   npm run stats:write
   ```
5. Commit with a clear message, e.g.:
   ```
   data: add capitals for Kano, Kaduna, and Katsina
   ```
6. Open a pull request. In the description, include:
   - What changed and why.
   - Source link(s).
   - Any known caveats.

## ID conventions

| Entity | Pattern | Example |
|--------|---------|---------|
| State / FCT | `NG-XX` (ISO 3166-2:NG) | `NG-KN` |
| LGA | `NG-{STATE}-{LGA}` | `NG-KN-KANO-MUNICIPAL` |
| Federal constituency | `{state}-{number}` | `kano-01` |
| Senatorial district | `{state}-{direction}` | `kano-central` |
| Festival | kebab-case slug | `osun-osogbo-festival` |
| Party | INEC abbreviation | `APC` |
| Coordinates | `[longitude, latitude]`, WGS84 | `[8.5167, 12.0000]` |

Dates use ISO 8601 (`YYYY-MM-DD`). JSON is UTF-8, 2-space indented, with a
trailing newline.

## Adding a dataset

Open an issue first using this outline:

```markdown
### Dataset name
### What it contains
### Geographic/administrative granularity
### Record count (approx.)
### Source(s) and licence
### Update frequency
### Proposed file path and schema
### Why it belongs in NaijaBase
```

Once agreed, add the file under `data/`, document every field in
`docs/DATA_DICTIONARY.md`, and extend `scripts/validate.mjs` with structural and
referential checks.

## Pull request checklist

- [ ] `npm run validate` passes (or only expected warnings remain).
- [ ] New/changed records have a cited source.
- [ ] IDs follow the conventions above and are not reused.
- [ ] `docs/DATA_DICTIONARY.md` updated for schema changes.
- [ ] `npm run stats:write` run if counts changed.
- [ ] `CHANGELOG.md` updated for a release-worthy change.
- [ ] No unrelated reformatting.

## Review process

- A maintainer reviews for accuracy, sourcing, and schema fit.
- Data changes that affect boundaries, counts, or civic information may need a
  second reviewer.
- Disagreements are resolved by evidence, not volume. If sources conflict, we
  document both and prefer the official one.

## Code style

- Node.js 18+ and ES modules.
- No runtime dependencies unless absolutely necessary.
- Scripts should be deterministic and runnable offline.

## Licence of contributions

By contributing, you agree that your code contributions are licensed under the
MIT Licence and your data contributions under CC BY 4.0, matching the project.
