# Changelog

All notable changes to this project will be documented in this file.

## [2.3.0] - 2026-08-16

### Added
- Kernel capability probe (per key): on load, the WebUI checks which sysctl keys actually exist on the device in a single batched shell call and caches the result. Unsupported options are now visibly disabled with a note showing the missing kernel CONFIG (`CONFIG_TCP_FASTOPEN`, `CONFIG_TCP_CONG_*`, …).
- `net.core.*` base parameters (`rmem_max`, `wmem_max`, `netdev_max_backlog`, `somaxconn`) added to every preset so tuning works on all kernels, including older ones.
- The engine now tries to load the preferred congestion control module (`modprobe tcp_bbr` / `insmod`) before falling back, so BBR works on GKI kernels that ship it as a module (`CONFIG_TCP_CONG_BBR=m`) without it being pre-loaded.
- `service.sh` repeats the same module load on boot before applying `tcp_congestion_control`.
- New resolution kind `loaded` shown in the transparency panel ("module bbr loaded, using bbr").

### Changed
- Presets are treated as intent: if the kernel lacks an option the preset still applies (adapted toast with the count of skipped options) instead of reporting a partial failure.
- Toast wording: "partial" now only covers parameters the kernel rejected or that had invalid values.
- Disabled unsupported options are dimmed with `role="note"` explaining the reason.

### Fixed
- On GKI kernels with BBR built as a module, applying a preset fell back to `cubic` even though `tcp_bbr` could be loaded.

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
