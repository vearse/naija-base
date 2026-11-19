# Changelog

All notable changes to NaijaBase are documented here. This project follows
[Semantic Versioning](https://semver.org/) for the dataset package and uses
dated entries for data refreshes.

## [Unreleased]

### Fixed

- Added missing Cross River LGA **Bakassi** (`NG-CR-BAKASSI`) to
  `data/base/lgas.json`; LGA record count is now **774**, matching INEC's
  official total. Linked **Calabar South/Akpabuyo/Bakassi** federal constituency
  to the Bakassi LGA record.

## [0.1.0] - 2026-11-14

### Added

- Initial public release.
- Administrative data: 37 states (36 states + FCT), 774 LGA records, 8,809 wards.
- Ward-to-LGA index (`wards-by-lga.json`).
- Geopolitical zone summaries for all 6 zones.
- State-level language lists for all 37 states.
- 12 curated festivals with dates, venues, and summaries.
- Civic data: 22 INEC-registered political parties, 109 senatorial districts,
  360 federal constituencies.
- Dataset validation and statistics scripts.
- Documentation: README, data dictionary, contributing guide, code of conduct.

### Known issues

See the "Data quality & caveats" section of the README for the current list of
cross-reference inconsistencies and coverage gaps.
