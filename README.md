# NaijaBase

**Open, machine-readable data on Nigeria's places, people, and government.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Validate](https://github.com/vearse/NaijaBase/actions/workflows/validate.yml/badge.svg)](https://github.com/vearse/NaijaBase/actions/workflows/validate.yml)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

NaijaBase is a community-maintained dataset covering Nigeria's full
administrative chain — **37 states and the FCT, 774 LGA records, and 8,809
wards** — together with geopolitical zones, languages, festivals, political
parties, senatorial districts, and federal constituencies.

It is plain JSON with no API key, database, or build step. Use it directly from
an app, notebook, map, or civic tool. Everything is versioned, documented, and
validated in CI.

---

## Contents

- [Why NaijaBase](#why-naijabase)
- [What's inside](#whats-inside)
- [Quick start](#quick-start)
- [Data model](#data-model)
- [Repository layout](#repository-layout)
- [ID conventions](#id-conventions)
- [Dataset examples](#dataset-examples)
- [Validation and statistics](#validation-and-statistics)
- [Data quality and caveats](#data-quality-and-caveats)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Citation](#citation)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Why NaijaBase

Nigerian administrative and civic data is scattered across PDFs, portals, and
one-off scrapers. NaijaBase collects it into one predictable structure so you
can answer questions like:

- Which wards make up a given LGA, and where are they?
- How many polling units are in each state, LGA, and ward?
- Which LGAs form a senatorial district or federal constituency?
- Which languages and festivals are associated with a state?

The goal is not to replace official sources — it is to make their data easier to
find, join, and reuse, with clear IDs and a review trail.

---

## What's inside

| Dataset | File | Shape | Records |
|---------|------|-------|--------:|
| States + FCT | `data/base/states.json` | array | 37 |
| Local Government Areas | `data/base/lgas.json` | array | 774 |
| Wards | `data/location/wards.json` | array | 8,809 |
| Ward-by-LGA index | `data/location/wards-by-lga.json` | object | 774 keys |
| Geopolitical zones | `data/base/places-zones.json` | object | 6 |
| State languages | `data/base/state-languages.json` | object | 37 states |
| Festivals | `data/base/festivals.json` | array | 12 |
| Political parties | `data/politics/parties.json` | object | 22 |
| Senatorial districts | `data/politics/constituencies/senatorial-districts.json` | array | 109 |
| Federal constituencies | `data/politics/constituencies/federal-constituencies.json` | array | 360 |

A machine-readable catalog lives in [`data/manifest.json`](data/manifest.json),
and the full field reference is in
[`docs/DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md).

### Coverage at a glance

- **36 states + Federal Capital Territory**
- **6 geopolitical zones**
- **774 LGA records** (official INEC administrative count)
- **8,809 wards** with centroid coordinates
- **176,623 polling units** (aggregate counts only, not individual records)
- **109 senatorial districts**
- **360 federal constituencies**

See [`docs/STATS.md`](docs/STATS.md) for a per-state breakdown.

---

## Quick start

### Clone and validate

```bash
git clone https://github.com/vearse/NaijaBase.git
cd NaijaBase
npm run validate
```

No dependencies are required — validation uses only the Node.js standard library.

### Read data directly (JavaScript / Node)

```js
import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

const states = read("data/base/states.json");
const lgas = read("data/base/lgas.json");

const kanoLgas = lgas.filter((lga) => lga.stateName === "Kano");
console.log(`${kanoLgas.length} LGAs in Kano`);
```

### Read data directly (Python)

```python
import json
from pathlib import Path

states = json.loads(Path("data/base/states.json").read_text(encoding="utf-8"))
wards = json.loads(Path("data/location/wards.json").read_text(encoding="utf-8"))

print(states[0]["name"], "|", len(wards), "wards")
```

### Fetch a single file (after pushing to GitHub)

```bash
curl https://raw.githubusercontent.com/vearse/NaijaBase/main/data/base/states.json
```

---

## Data model

```
Nigeria
├── Geopolitical zone (6)
│   └── State / FCT (37)            data/base/states.json
│       └── LGA (774)               data/base/lgas.json
│           └── Ward (8,809)        data/location/wards.json
│
└── Senatorial district (109)       data/politics/constituencies/senatorial-districts.json
    └── Federal constituency (360)  data/politics/constituencies/federal-constituencies.json
```

The administrative and electoral trees overlap but are not the same tree: a
state contains senatorial districts, and those contain federal constituencies
made up of LGAs.

---

## Repository layout

```
data/
  manifest.json                 dataset catalog
  base/
    states.json                 states + FCT
    lgas.json                   local government areas
    places-zones.json           geopolitical zone summaries
    state-languages.json        languages by state
    festivals.json              cultural festivals
  location/
    wards.json                  wards (flat, with centroids)
    wards-by-lga.json           ward names keyed by LGA
  politics/
    parties.json                INEC-registered parties
    constituencies/
      senatorial-districts.json
      federal-constituencies.json
docs/
  DATA_DICTIONARY.md            field-level reference
  STATS.md                      generated coverage statistics
scripts/
  validate.mjs                  structural + referential checks
  stats.mjs                     coverage statistics generator
```

---

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

IDs are **stable**. Names may be corrected, but IDs are never renamed or reused.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the full policy.

---

## Dataset examples

**A state**

```json
{
  "id": "NG-KN",
  "name": "Kano",
  "region": "North West",
  "capital": "Kano",
  "lgaCount": 44,
  "description": "Kano is a state in Nigeria's North West geopolitical zone.",
  "pollingUnitCount": 11565
}
```

**A ward**

```json
{
  "stateName": "Abia",
  "lgaName": "Aba North",
  "ward": "Ariaria Market",
  "centroid": [7.343425561, 5.114318609],
  "parentLgaId": "NG-AB-ABA-NORTH",
  "pollingUnitCount": 91
}
```

**A federal constituency**

```json
{
  "id": "abia-01",
  "name": "Aba North/Aba South",
  "state": "Abia",
  "senatorial_district_id": "abia-south",
  "lga_ids": ["NG-AB-ABA-NORTH", "NG-AB-ABA-SOUTH"],
  "verify": false
}
```

Every field is documented in
[`docs/DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md).

---

## Validation and statistics

```bash
npm run validate        # structural + referential checks (CI uses this)
npm run validate:strict # treat warnings as failures
npm run stats           # print coverage statistics as markdown
npm run stats:write     # regenerate docs/STATS.md
```

`validate` checks required fields, types, ID uniqueness, coordinate ranges, and
cross-file references (for example, that every constituency LGA exists). It exits
non-zero on errors; warnings highlight known data inconsistencies.

CI runs `npm run validate` on every push and pull request via
[`.github/workflows/validate.yml`](.github/workflows/validate.yml).

---

## Data quality and caveats

NaijaBase is honest about what it does and does not yet cover. The validator
currently reports the following **warnings** (not failures):

- **LGA ID drift (~75 IDs).** `wards.json` and `wards-by-lga.json` use some
  legacy LGA slugs that do not match `lgas.json`, e.g. `NG-AB-ISUIKWUATO` vs
  `NG-AB-ISUIKWATO`, `NG-AB-OSISIOMA` vs `NG-AB-OSISIOMA-NGWA`, and
  `NG-FC-MUNICIPAL` vs `NG-FC-ABUJA-MUNICIPAL`. Joining wards to LGAs by ID
  fails for these; join by normalized `stateName + name` instead, or wait for
  the reconciliation release.
- **Missing polling-unit counts.** 1,120 of 8,809 wards have no
  `pollingUnitCount`.
- **Duplicate ward names.** 11 `(LGA, ward)` pairs appear more than once,
  reflecting splits or source duplication.
- **State-name spelling.** Base files use `Nassarawa`; constituency files use
  the official `Nasarawa`. The validator accepts both as aliases.
- **Missing capitals.** 28 states have `capital: null`.
- **Unassigned LGAs.** 4 LGAs are not assigned to any federal constituency.
- **Unverified constituencies.** A federal constituency with `verify: false`
  has not had its LGA composition reviewed.
- **Aggregate polling units only.** Only counts are included, not individual
  polling-unit records.
- **Centroids, not boundaries.** Ward coordinates are representative points, not
  polygons.
- **Editorial content.** Descriptions, languages, and festival dates are curated
  and indicative, not official census or calendar data.

These gaps are tracked in the [roadmap](#roadmap). Corrections with sources are
very welcome.

---

## Contributing

We welcome fixes, new fields, new datasets, tooling, and documentation.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md).
2. Make the smallest possible change under `data/`.
3. Run `npm run validate`.
4. Open a pull request with a source for every data change.

Please also follow our [Code of Conduct](CODE_OF_CONDUCT.md). Ethnic, religious,
and political data must be sourced, neutral, and handled with care.

---

## Roadmap

- [ ] Reconcile LGA IDs across `lgas.json`, `wards.json`, and `wards-by-lga.json`
- [ ] Fill missing state capitals and missing polling-unit counts
- [ ] Add individual polling-unit records with delimitation codes
- [ ] Add ethnic and cultural group data with sourced descriptions
- [ ] Add GeoJSON boundaries for states, LGAs, and wards
- [ ] Add JSON Schema files and generated TypeScript types
- [ ] Publish `naijabase` as an npm package and a Python package
- [ ] Emit CSV, SQLite, and Parquet builds in CI

---

## Citation

If you use NaijaBase in research or a product, please cite it:

```bibtex
@dataset{naijabase2026,
  title     = {NaijaBase: Open data for Nigeria's places, people, and government},
  author    = {{NaijaBase contributors}},
  year      = {2026},
  version   = {0.1.0},
  url       = {https://github.com/vearse/NaijaBase}
}
```

A [`CITATION.cff`](CITATION.cff) file is included for GitHub's citation feature.

---

## License

- **Code and scripts:** [MIT](LICENSE)
- **Data:** [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)

You may use, share, and adapt the data, including commercially, as long as you
give appropriate credit to NaijaBase and link to this repository.

---

## Acknowledgements

NaijaBase builds on public data from Nigeria's Independent National Electoral
Commission (INEC), the National Bureau of Statistics (NBS), the National
Population Commission (NPC), and open mapping and reference projects. Editorial
text and derived fields are maintained by contributors. If you believe a source
should be credited differently, please open an issue.
