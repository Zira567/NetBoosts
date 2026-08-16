# Changelog

All notable changes to this project will be documented in this file.

## [2.2.1] - 2026-08-16

### Added
- Transparency panel: the WebUI now shows exactly what each TCP preset applied, what it skipped and why (preferred congestion control unavailable, blocked by the preset's denylist, key unsupported by the kernel, invalid value or value rejected). Shown as a collapsible panel in the TCP section and a summary on the dashboard.

## [2.2.0] - 2026-08-16

### Added
- Capability probe: detects congestion control actually allowed by the kernel (available ∩ allowed) and checks each sysctl key exists before applying.
- Presets now declare an explicit `avoid` denylist; the engine never applies those keys.
- Transparency: the WebUI shows exactly what was applied, skipped and why (fallback, blocked by preset, unsupported, rejected) in a resolution panel and on the dashboard.

### Changed
- `tcp.state` now stores the resolved result (`preset=` + the exact keys/values the kernel accepted), and `service.sh` reapplies it line by line on boot without re-resolving.
- Removed risky tweaks from the Gaming preset: ECN, MTU probing and low TCP retries1.
- Automatic migration of the old `tcp.state` format on boot.

## [2.1.1] - 2026-08-15

### Added
- GPL-3.0 license and CHANGELOG to the module package.

## [2.1.0] - 2026-08-15

### Added
- Persisted selected card state (DNS provider and TCP preset) between sessions.
- Bilingual README (EN/ES).

### Fixed
- Long custom DNS hostnames overflowing their card on the WebUI.
- Advanced TCP state now loading correctly when the WebUI opens.

### Changed
- Hardened the WebUI against XSS in rendered status rows and custom hosts.
- Polished UI: ripple effects, button elevation and active/inactive states.
- Added GPL-3.0 license.
