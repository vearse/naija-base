# Data dictionary

Field-level reference for every dataset in NaijaBase. All files are UTF-8 JSON.

## Conventions

- **IDs** are stable strings. Never rename or reuse an ID.
- **State IDs** use ISO 3166-2:NG (`NG-XX`), e.g. `NG-KN` for Kano.
- **Coordinates** are `[longitude, latitude]` in WGS84 decimal degrees.
- **Dates** are ISO 8601 (`YYYY-MM-DD`) unless noted.
- **Unknown values** are `null`, never guessed.
- **Names** are display names; use IDs for joins.

---

## `data/base/states.json`

Array of Nigeria's 36 states plus the Federal Capital Territory.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | ISO 3166-2:NG code, e.g. `NG-KN`. |
| `name` | string | State name, e.g. `Kano`. |
| `region` | string | Geopolitical zone name. One of `North Central`, `North East`, `North West`, `South East`, `South South`, `South West`. |
| `capital` | string \| null | State capital. `null` where not yet populated. |
| `lgaCount` | number | Official number of LGAs in the state. |
| `description` | string | One-line editorial description. |
| `pollingUnitCount` | number | Aggregate INEC polling-unit count for the state. |

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

---

## `data/base/lgas.json`

Array of Local Government Areas.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | LGA ID, `NG-{STATE}-{LGA}`. |
| `name` | string | LGA name. |
| `stateName` | string | Parent state name. Joins to `states.json` on `name`. |
| `wardCount` | number | Number of wards recorded in NaijaBase. |
| `areaKm2` | number \| null | Land area in square kilometres. |
| `description` | string | One-line editorial description. |
| `pollingUnitCount` | number | Aggregate INEC polling-unit count for the LGA. |

```json
{
  "id": "NG-KN-KANO-MUNICIPAL",
  "name": "Kano Municipal",
  "stateName": "Kano",
  "wardCount": 13,
  "areaKm2": 17.0,
  "description": "Kano Municipal is a Local Government Area in Kano State.",
  "pollingUnitCount": 1021
}
```

> **Note:** LGA IDs are not yet fully consistent between `lgas.json` and
> `wards-by-lga.json`. See [Data quality](../README.md#data-quality--caveats).

---

## `data/base/places-zones.json`

Editorial summaries for the six geopolitical zones.

| Field | Type | Description |
|-------|------|-------------|
| `source` | string | Provenance note for the editorial text. |
| `zones` | array | One object per zone. |
| `zones[].regionId` | string | Zone ID: `NG-NC`, `NG-NE`, `NG-NW`, `NG-SE`, `NG-SS`, `NG-SW`. |
| `zones[].character` | string | Short character label, e.g. `Middle Belt`. |
| `zones[].blurb` | string | One-sentence description of terrain, economy, settlement. |

```json
{
  "regionId": "NG-SW",
  "character": "Industrial & Atlantic",
  "blurb": "Industrial heartland, deepwater ports, academic centres, and historic Yoruba kingdoms spanning coastal lagoons to rolling hills."
}
```

---

## `data/base/state-languages.json`

Object keyed by state ID. Each value is a list of languages commonly spoken in
that state.

| Field | Type | Description |
|-------|------|-------------|
| `<stateId>` | array | Languages for the state. |
| `[].name` | string | Language name. |
| `[].wikiUrl` | string | Optional Wikipedia reference URL. |

```json
{
  "NG-KN": [
    { "name": "Hausa", "wikiUrl": "https://en.wikipedia.org/wiki/Hausa_language" }
  ]
}
```

> These are indicative lists, not official or exhaustive censuses.

---

## `data/base/festivals.json`

Array of curated cultural festivals.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Kebab-case slug, unique. |
| `name` | string | Festival name. |
| `month` | string | Three-letter uppercase month, e.g. `OCT`. |
| `window` | string | Human-readable timing, e.g. `October`. |
| `startDay` | number | Start day of month. |
| `endDay` | number | End day of month. |
| `stateName` | string | Host state name. |
| `venue` | string | Venue or town. |
| `category` | string | Editorial category, e.g. `Music & Legacy`. |
| `tone` | string | UI colour token used by downstream apps (presentation hint). |
| `summary` | string | One-sentence description. |

```json
{
  "id": "osun-osogbo-festival",
  "name": "Osun-Osogbo Festival",
  "month": "AUG",
  "window": "August",
  "startDay": 1,
  "endDay": 31,
  "stateName": "Osun",
  "venue": "Osun-Osogbo Sacred Grove",
  "category": "Heritage & Religion",
  "tone": "amber",
  "summary": "Annual worship of the river goddess Osun at the UNESCO-listed sacred grove."
}
```

> Dates are indicative and can shift with the lunar/ritual calendar. Verify
> before travel.

---

## `data/location/wards.json`

Flat array of wards (the electoral level below LGA).

| Field | Type | Description |
|-------|------|-------------|
| `stateName` | string | Parent state name. |
| `lgaName` | string | Parent LGA name. |
| `ward` | string | Ward name. |
| `centroid` | `[number, number]` | Representative point, `[lon, lat]`. |
| `parentLgaId` | string | Parent LGA ID. |
| `pollingUnitCount` | number | Number of polling units in the ward. |

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

---

## `data/location/wards-by-lga.json`

Compact lookup object keyed by LGA ID.

| Field | Type | Description |
|-------|------|-------------|
| `<lgaId>` | `string[]` | Ward names for that LGA, in source order. |

```json
{
  "NG-AB-ABA-NORTH": [
    "Ariaria Market",
    "Eziama",
    "Industrial Area"
  ]
}
```

> Ward names are not unique nationally. Always pair a ward name with its LGA.

---

## `data/politics/parties.json`

INEC-registered political parties.

| Field | Type | Description |
|-------|------|-------------|
| `schemaVersion` | number | Schema version for this file. |
| `iconBasePath` | string | Base path for party icons. |
| `source` | object | Provenance metadata. |
| `source.note` | string | What the data represents. |
| `source.url` | string | Upstream source URL. |
| `source.updated` | string | ISO date of last source update. |
| `parties` | object | Map of abbreviation to party record. |
| `parties.<ABBR>.abbreviation` | string | Party abbreviation (key). |
| `parties.<ABBR>.name` | string | Full party name. |
| `parties.<ABBR>.icon` | string | Logo image URL. |

```json
{
  "abbreviation": "APC",
  "name": "All Progressives Congress",
  "icon": "https://inecnigeria.org/_nuxt/all-progressives-congress-apc_logo.jpg"
}
```

---

## `data/politics/constituencies/senatorial-districts.json`

Array of the 109 senatorial districts (3 per state plus the FCT).

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | `{state}-{direction}`, e.g. `kano-central`. |
| `name` | string | District name. |
| `state` | string | State name. |
| `lga_ids` | `string[]` | LGAs in the district. |

---

## `data/politics/constituencies/federal-constituencies.json`

Array of the 360 federal constituencies (House of Representatives).

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | `{state}-{number}`, e.g. `kano-01`. |
| `name` | string | Constituency name (usually the LGA(s) it covers). |
| `state` | string | State name. |
| `senatorial_district_id` | string | Parent senatorial district ID. |
| `lga_ids` | `string[]` | LGAs in the constituency. |
| `verify` | boolean | `true` when the LGA composition has been reviewed; `false` flags it as unverified. |

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
