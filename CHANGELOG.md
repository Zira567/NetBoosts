# Changelog

All notable changes to this project will be documented in this file.

## [2.5.2] - 2026-08-16

### Fixed
- Applying a preset now takes full control of the congestion control: the preset's resolved algorithm always wins over a manual override left by the selector, and once the kernel accepts it the manual override is removed from the persisted advanced state. Before, a previously chosen algorithm from the selector could silently override the preset's congestion control (e.g. Balanced applying `cubic` but ending up with `reno`).
- Applying a congestion control from the selector (advanced options, without a preset) now survives a reboot: `service.sh` reuses the same `prepare_cc` logic on `tcp_advanced.state` (module load + `tcp_allowed_congestion_control` widening) that already existed for `tcp.state`. Before, the choice was applied on boot without preparing the algorithm and could be silently skipped.
- The migration of the old `tcp.state` format now also calls `prepare_cc` before activating the algorithm, and only rewrites the state file when the kernel actually accepted the congestion control. If it's rejected, the old format is kept and retried on the next boot instead of persisting a resolution the kernel won't apply.
- The congestion selector no longer lists a bogus `*` module: unexpanded globs (module directories that don't exist) are skipped with `[ -e "$f" ]`.
- Dashboard and Status no longer display the literal string `null` for an unset private DNS.

### Added
- The WebUI now detects the phone's actual private DNS (`private_dns_mode` / `private_dns_specifier` via `settings get`), so the configured provider is marked even when it was set from Android settings and not from NetBoost. It falls back to the persisted state only when the settings aren't readable.
- Guarded against concurrent TCP operations: while a preset or an advanced option is being applied, a second tap is ignored (prevents double-click races).

### Changed
- Resolution notes for "module loaded" and "algorithm enabled" are now highlighted in the accent color so they're distinguishable from skipped parameters.
- Version references updated to v2.5.2 in the README and installer output.

### Removed
- Dead code: unused icons (bolt, home, gauge, activity, pin, refresh), unused emoji mappings (⚡🌐🌙☀), unused i18n keys (`tcpHint`, `statusQuerying`), and unused CSS rules (`.tabs`/`.tab`, `.log-box`, `.btn-danger`, `.badge.on/.warn/.off`, `.mono`, `.toast.success/.warn/.error`, `--warn-soft`).

## [2.5.0] - 2026-08-16

### Fixed
- Kernels where `tcp_available_congestion_control` lists all algorithms (built into the kernel, e.g. `reno bbr bbrplus cubic westwood highspeed htcp`) but `tcp_allowed_congestion_control` is restricted to a subset: the engine now auto-widens `tcp_allowed_congestion_control` to the full available list before selecting the algorithm. Presets and the selector no longer get stuck seeing only the allowed subset (the Balanced preset applying `cubic` falls back to `reno`). This works without any `tcp_*.ko` modules on the device.
- `service.sh` repeats the same allowed-widening on boot so the choice survives a reboot.

### Added
- New resolution kind `enabled` in the transparency panel ("{{from}} enabled (allowed widened), using {{to}}").

### Changed
- The congestion control selector now shows everything the kernel *provides* (`tcp_available_congestion_control` + loadable `tcp_*.ko` modules), not just the currently allowed subset.
- When an algorithm is available but blocked by `allowed`, enabling it is a normal operation; module loading is still attempted for algorithms not present in `available` at all (e.g. GKI `tcp_bbr=m`).
