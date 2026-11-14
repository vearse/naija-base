#!/usr/bin/env node
/**
 * Structural and referential validation for the NaijaBase datasets.
 *
 * Usage:
 *   node scripts/validate.mjs           # errors fail, warnings do not
 *   node scripts/validate.mjs --strict  # warnings also fail (used once clean)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

const errors = [];
const warnings = [];
const error = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const load = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const str = (v) => typeof v === "string" && v.trim().length > 0;
const num = (v) => typeof v === "number" && Number.isFinite(v);
const arr = Array.isArray;

const paths = {
  states: "data/base/states.json",
  lgas: "data/base/lgas.json",
  zones: "data/base/places-zones.json",
  festivals: "data/base/festivals.json",
  languages: "data/base/state-languages.json",
  wards: "data/location/wards.json",
  wardsByLga: "data/location/wards-by-lga.json",
  parties: "data/politics/parties.json",
  senatorial: "data/politics/constituencies/senatorial-districts.json",
  federal: "data/politics/constituencies/federal-constituencies.json",
};

const data = Object.fromEntries(
  Object.entries(paths).map(([key, rel]) => [key, load(rel)]),
);

const REGIONS = new Set([
  "North Central",
  "North East",
  "North West",
  "South East",
  "South South",
  "South West",
]);
const ZONE_IDS = new Set(["NG-NC", "NG-NE", "NG-NW", "NG-SE", "NG-SS", "NG-SW"]);
const MONTHS = new Set([
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
]);

// Accepted alternative spellings of state names used across datasets.
const STATE_NAME_ALIASES = { Nasarawa: "Nassarawa" };
const isStateName = (name) =>
  stateNames.has(name) || stateNames.has(STATE_NAME_ALIASES[name]);

function checkUnique(items, keyOf, label) {
  const seen = new Map();
  for (const item of items) {
    const key = keyOf(item);
    if (seen.has(key)) {
      error(`${label}: duplicate id "${key}"`);
    } else {
      seen.set(key, item);
    }
  }
  return seen;
}

/* ------------------------------------------------------------------ states */
const stateIds = new Set();
const stateNames = new Set();
if (!arr(data.states)) {
  error("states.json must be an array");
} else {
  data.states.forEach((s, i) => {
    const at = `states[${i}]`;
    if (!str(s.id)) error(`${at}.id missing`);
    if (!/^NG-[A-Z]{2}$/.test(s.id ?? "")) error(`${at}.id not NG-XX: ${s.id}`);
    if (!str(s.name)) error(`${at}.name missing`);
    if (!REGIONS.has(s.region)) error(`${at}.region invalid: ${s.region}`);
    if (!num(s.lgaCount)) error(`${at}.lgaCount must be a number`);
    if (!num(s.pollingUnitCount)) error(`${at}.pollingUnitCount must be a number`);
    if (stateIds.has(s.id)) error(`${at}.id duplicate: ${s.id}`);
    stateIds.add(s.id);
    stateNames.add(s.name);
  });
}

/* -------------------------------------------------------------------- lgas */
const lgaById = new Map();
if (!arr(data.lgas)) {
  error("lgas.json must be an array");
} else {
  data.lgas.forEach((l, i) => {
    const at = `lgas[${i}]`;
    if (!str(l.id)) error(`${at}.id missing`);
    if (!/^NG-[A-Z]{2}-[A-Z0-9-]+$/.test(l.id ?? "")) {
      error(`${at}.id has invalid shape: ${l.id}`);
    }
    if (!str(l.name)) error(`${at}.name missing`);
    if (!isStateName(l.stateName)) {
      error(`${at}.stateName unknown: ${l.stateName}`);
    }
    if (!num(l.wardCount)) error(`${at}.wardCount must be a number`);
    if (!num(l.pollingUnitCount)) error(`${at}.pollingUnitCount must be a number`);
    if (l.areaKm2 !== null && !num(l.areaKm2)) {
      error(`${at}.areaKm2 must be a number or null`);
    }
    if (lgaById.has(l.id)) error(`${at}.id duplicate: ${l.id}`);
    lgaById.set(l.id, l);
  });
}

/* ------------------------------------------------------------------- wards */
const wardKeys = new Set();
let wardsMissingPollingUnitCount = 0;
if (!arr(data.wards)) {
  error("wards.json must be an array");
} else {
  data.wards.forEach((w, i) => {
    const at = `wards[${i}]`;
    if (!str(w.stateName)) error(`${at}.stateName missing`);
    if (!str(w.lgaName)) error(`${at}.lgaName missing`);
    if (!str(w.ward)) error(`${at}.ward missing`);
    if (!str(w.parentLgaId)) error(`${at}.parentLgaId missing`);
    if (!arr(w.centroid) || w.centroid.length !== 2 || !w.centroid.every(num)) {
      error(`${at}.centroid must be [lon, lat]`);
    } else {
      const [lon, lat] = w.centroid;
      if (lon < -180 || lon > 180) error(`${at}.centroid longitude out of range`);
      if (lat < -90 || lat > 90) error(`${at}.centroid latitude out of range`);
    }
    if (w.pollingUnitCount == null) {
      wardsMissingPollingUnitCount += 1;
    } else if (!num(w.pollingUnitCount)) {
      error(`${at}.pollingUnitCount must be a number`);
    }
    const key = `${w.parentLgaId}::${w.ward}`;
    if (wardKeys.has(key)) warn(`wards: duplicate (parentLgaId, ward) "${key}"`);
    wardKeys.add(key);
  });
  if (wardsMissingPollingUnitCount > 0) {
    warn(
      `wards: ${wardsMissingPollingUnitCount} record(s) have no pollingUnitCount`,
    );
  }
}

/* --------------------------------------------------------- wards-by-lga key */
const wardsByLga = data.wardsByLga;
if (!wardsByLga || typeof wardsByLga !== "object" || arr(wardsByLga)) {
  error("wards-by-lga.json must be an object keyed by LGA id");
} else {
  for (const [lgaId, wardList] of Object.entries(wardsByLga)) {
    if (!arr(wardList)) {
      error(`wards-by-lga["${lgaId}"] must be an array`);
      continue;
    }
    wardList.forEach((name, i) => {
      if (!str(name)) error(`wards-by-lga["${lgaId}"][${i}] must be a string`);
    });
  }
}

/* ------------------------------------------------------------------- zones */
if (!data.zones || !arr(data.zones.zones)) {
  error("places-zones.json must contain a zones array");
} else {
  const seen = new Set();
  data.zones.zones.forEach((z, i) => {
    const at = `zones[${i}]`;
    if (!ZONE_IDS.has(z.regionId)) error(`${at}.regionId invalid: ${z.regionId}`);
    if (!str(z.character)) error(`${at}.character missing`);
    if (!str(z.blurb)) error(`${at}.blurb missing`);
    if (seen.has(z.regionId)) error(`${at}.regionId duplicate: ${z.regionId}`);
    seen.add(z.regionId);
  });
  if (seen.size !== 6) warn(`places-zones: expected 6 zones, found ${seen.size}`);
}

/* ---------------------------------------------------------------- languages */
if (!data.languages || typeof data.languages !== "object" || arr(data.languages)) {
  error("state-languages.json must be an object keyed by state id");
} else {
  for (const [stateId, langs] of Object.entries(data.languages)) {
    if (!stateIds.has(stateId)) {
      error(`state-languages: unknown state id "${stateId}"`);
    }
    if (!arr(langs) || langs.length === 0) {
      error(`state-languages["${stateId}"] must be a non-empty array`);
      continue;
    }
    langs.forEach((l, i) => {
      if (!str(l.name)) error(`state-languages["${stateId}"][${i}].name missing`);
      if (l.wikiUrl != null && !str(l.wikiUrl)) {
        error(`state-languages["${stateId}"][${i}].wikiUrl must be a string`);
      }
    });
  }
  const missing = data.states
    .map((s) => s.id)
    .filter((id) => !(id in data.languages));
  if (missing.length) warn(`state-languages: missing states ${missing.join(", ")}`);
}

/* ---------------------------------------------------------------- festivals */
if (!arr(data.festivals)) {
  error("festivals.json must be an array");
} else {
  const seen = new Set();
  data.festivals.forEach((f, i) => {
    const at = `festivals[${i}]`;
    if (!str(f.id)) error(`${at}.id missing`);
    if (!str(f.name)) error(`${at}.name missing`);
    if (!MONTHS.has(f.month)) error(`${at}.month invalid: ${f.month}`);
    if (!isStateName(f.stateName)) error(`${at}.stateName unknown: ${f.stateName}`);
    if (!str(f.summary)) error(`${at}.summary missing`);
    if (seen.has(f.id)) error(`${at}.id duplicate: ${f.id}`);
    seen.add(f.id);
  });
}

/* ----------------------------------------------------------------- parties */
if (!data.parties || !data.parties.parties || typeof data.parties.parties !== "object") {
  error("parties.json must contain a parties object");
} else {
  const seen = new Set();
  for (const [key, p] of Object.entries(data.parties.parties)) {
    if (!str(p.abbreviation)) error(`parties["${key}"].abbreviation missing`);
    if (p.abbreviation !== key) {
      warn(`parties["${key}"].abbreviation is "${p.abbreviation}"`);
    }
    if (!str(p.name)) error(`parties["${key}"].name missing`);
    if (seen.has(p.abbreviation)) {
      error(`parties: duplicate abbreviation "${p.abbreviation}"`);
    }
    seen.add(p.abbreviation);
  }
}

/* ------------------------------------------------------------ constituencies */
const senatorialIds = new Set();
if (!arr(data.senatorial)) {
  error("senatorial-districts.json must be an array");
} else {
  data.senatorial.forEach((d, i) => {
    const at = `senatorial[${i}]`;
    if (!str(d.id)) error(`${at}.id missing`);
    if (!str(d.name)) error(`${at}.name missing`);
    if (!isStateName(d.state)) error(`${at}.state unknown: ${d.state}`);
    if (!arr(d.lga_ids) || d.lga_ids.length === 0) {
      error(`${at}.lga_ids must be a non-empty array`);
    } else {
      d.lga_ids.forEach((id) => {
        if (!lgaById.has(id)) error(`${at}.lga_ids references unknown LGA "${id}"`);
      });
    }
    if (senatorialIds.has(d.id)) error(`${at}.id duplicate: ${d.id}`);
    senatorialIds.add(d.id);
  });
}

if (!arr(data.federal)) {
  error("federal-constituencies.json must be an array");
} else {
  const seen = new Set();
  const lgaUsage = new Map();
  data.federal.forEach((c, i) => {
    const at = `federal[${i}]`;
    if (!str(c.id)) error(`${at}.id missing`);
    if (!str(c.name)) error(`${at}.name missing`);
    if (!isStateName(c.state)) error(`${at}.state unknown: ${c.state}`);
    if (!senatorialIds.has(c.senatorial_district_id)) {
      error(`${at}.senatorial_district_id unknown: ${c.senatorial_district_id}`);
    }
    if (typeof c.verify !== "boolean") error(`${at}.verify must be boolean`);
    if (!arr(c.lga_ids) || c.lga_ids.length === 0) {
      error(`${at}.lga_ids must be a non-empty array`);
    } else {
      c.lga_ids.forEach((id) => {
        if (!lgaById.has(id)) error(`${at}.lga_ids references unknown LGA "${id}"`);
        lgaUsage.set(id, (lgaUsage.get(id) ?? 0) + 1);
      });
    }
    if (seen.has(c.id)) error(`${at}.id duplicate: ${c.id}`);
    seen.add(c.id);
  });
  const unrepresented = [...lgaById.keys()].filter((id) => !lgaUsage.has(id));
  if (unrepresented.length) {
    warn(
      `federal constituencies: ${unrepresented.length} LGA(s) not assigned to any constituency`,
    );
  }
}

/* --------------------------------------------------- cross-dataset warnings */
if (wardsByLga && typeof wardsByLga === "object" && !arr(wardsByLga)) {
  const lgaKeys = Object.keys(wardsByLga);
  const orphanKeys = lgaKeys.filter((id) => !lgaById.has(id));
  const unusedLgas = [...lgaById.keys()].filter((id) => !(id in wardsByLga));
  if (orphanKeys.length) {
    warn(
      `wards-by-lga: ${orphanKeys.length} LGA id(s) missing from lgas.json ` +
        `(e.g. ${orphanKeys.slice(0, 3).join(", ")})`,
    );
  }
  if (unusedLgas.length) {
    warn(
      `lgas.json: ${unusedLgas.length} LGA id(s) missing from wards-by-lga.json ` +
        `(e.g. ${unusedLgas.slice(0, 3).join(", ")})`,
    );
  }
}

if (arr(data.wards)) {
  const orphanParents = [
    ...new Set(
      data.wards.map((w) => w.parentLgaId).filter((id) => !lgaById.has(id)),
    ),
  ];
  if (orphanParents.length) {
    warn(
      `wards.json: ${orphanParents.length} parentLgaId value(s) missing from lgas.json ` +
        `(e.g. ${orphanParents.slice(0, 3).join(", ")})`,
    );
  }
}

if (arr(data.states) && arr(data.lgas)) {
  const actual = new Map();
  for (const l of data.lgas) {
    actual.set(l.stateName, (actual.get(l.stateName) ?? 0) + 1);
  }
  for (const s of data.states) {
    const n = actual.get(s.name) ?? 0;
    if (n !== s.lgaCount) {
      warn(`states: ${s.name} lgaCount=${s.lgaCount} but lgas.json has ${n}`);
    }
  }
}

if (arr(data.states) && wardsByLga && typeof wardsByLga === "object") {
  let total = 0;
  for (const list of Object.values(wardsByLga)) {
    if (arr(list)) total += list.length;
  }
  if (arr(data.wards) && total !== data.wards.length) {
    warn(
      `wards: wards.json has ${data.wards.length} records but wards-by-lga has ${total}`,
    );
  }
}

/* -------------------------------------------------------------------- report */
const counts = {
  states: arr(data.states) ? data.states.length : 0,
  lgas: arr(data.lgas) ? data.lgas.length : 0,
  wards: arr(data.wards) ? data.wards.length : 0,
  "wards-by-lga keys": wardsByLga ? Object.keys(wardsByLga).length : 0,
  "state languages": data.languages ? Object.keys(data.languages).length : 0,
  festivals: arr(data.festivals) ? data.festivals.length : 0,
  parties: data.parties?.parties
    ? Object.keys(data.parties.parties).length
    : 0,
  "senatorial districts": arr(data.senatorial) ? data.senatorial.length : 0,
  "federal constituencies": arr(data.federal) ? data.federal.length : 0,
};

console.log("\nNaijaBase data validation\n" + "-".repeat(40));
for (const [name, value] of Object.entries(counts)) {
  console.log(`${name.padEnd(24)} ${String(value).padStart(8)}`);
}
console.log("-".repeat(40));

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length})`);
  warnings.forEach((w) => console.log(`  ! ${w}`));
}

if (errors.length) {
  console.log(`\nErrors (${errors.length})`);
  errors.forEach((e) => console.log(`  x ${e}`));
}

const failed = errors.length > 0 || (strict && warnings.length > 0);
console.log(
  `\n${failed ? "FAILED" : "PASSED"} — ${errors.length} error(s), ` +
    `${warnings.length} warning(s)${strict ? " [strict]" : ""}\n`,
);
process.exit(failed ? 1 : 0);
