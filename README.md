# NetBoost

A root module for Android that manages private DNS and tunes TCP parameters from a clean, in-manager WebUI. Compatible with **Magisk**, **KernelSU** and **APatch**.

The interface runs inside the manager's own WebView — there is no local HTTP server and no open ports. Every change is applied on the fly and reapplied automatically on every boot.

## Features

- **Private DNS** — choose a DoT provider (Cloudflare, Google, AdGuard, NextDNS, Quad9, OpenDNS) or enter a custom host. Changes use Android's standard mechanism (`settings put global private_dns_specifier`) and the interface reflects the DNS actually configured on the device.
- **TCP presets** — Balanced, Aggressive, Conservative and Gaming profiles that adjust `sysctl` parameters in real time. Each preset resolves against the kernel: it loads the preferred congestion algorithm when available and falls back to `cubic` otherwise.
- **Advanced options** — individual settings grouped by category (performance, latency, stability, advanced), validated against what the kernel actually accepts, with disabled options explaining which kernel `CONFIG` is missing.
- **Transparency** — after applying a preset, a panel shows exactly what was applied, what was skipped and why (unsupported key, blocked by the preset, value rejected, etc.).
- **Bilingual** — the interface is available in Spanish and English, switchable from the top bar; the language is remembered between sessions.

## Requirements

- A rooted device with **Magisk**, **KernelSU** or **APatch**.
- On Magisk and APatch, a manager that can host the WebUI (e.g. **KsuWebUI**).

## Installation

1. Download `NetBoost-v2.5.1.zip`.
2. Install it from your manager: **Modules → Install from storage**.
3. Reboot.
4. Open the module from the modules list and tap the WebUI icon (⧉).

## Usage

- **DNS tab** — select a provider card or toggle private DNS off. A custom host can be typed into the field at the end of the list.
- **TCP tab** — pick a preset and apply it, or fine-tune individual options under the advanced categories.
- **Status tab** — read the current DNS host and TCP congestion control as reported by the device.
- **Dashboard** — at-a-glance summary of the applied DNS, preset and congestion control.

Everything the module applies is stored in `/data/adb/modules/netboost/` and restored automatically on every boot.

## How it works

- **Verified application** — presets are written with `sysctl` and read back to confirm the kernel accepted the value; the resolution panel reports any mismatch.
- **Boot reapplication** — `service.sh` reapplies the stored DNS and TCP state line by line at boot, reproducing the exact values the kernel accepted, without re-resolving.
- **Safe uninstall** — `uninstall.sh` restores the DNS and `sysctl` values that existed before the module was installed; they are backed up on first use.
- **No persistent system changes** — beyond what the user explicitly configures. If no preset is applied, the TCP parameters are left untouched.

## Module structure

```
NetBoost/
├── META-INF/com/google/android/   Standard Magisk installer
├── module.prop                    Module metadata
├── customize.sh                   Permissions on install
├── service.sh                     Reapplies settings on boot
├── uninstall.sh                   Restores original values
├── backup.sh                      Shared backup utilities
└── webroot/                       Web interface (ES/EN)
    ├── index.html
    ├── config/                    DNS profiles, TCP presets and options
    ├── css/
    └── js/
```

## License

Licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.

See the [CHANGELOG](CHANGELOG.md) for version history.

---

# NetBoost

Módulo root para Android que gestiona el DNS privado y ajusta los parámetros TCP desde una WebUI limpia integrada en el manager. Compatible con **Magisk**, **KernelSU** y **APatch**.

La interfaz se ejecuta dentro del propio WebView del manager — sin servidor HTTP local ni puertos abiertos. Cada cambio se aplica en caliente y se reaplica automáticamente en cada arranque.

## Características

- **DNS privado** — elige un proveedor DoT (Cloudflare, Google, AdGuard, NextDNS, Quad9, OpenDNS) o escribe un host personalizado. Los cambios usan el mecanismo estándar de Android (`settings put global private_dns_specifier`) y la interfaz refleja el DNS realmente configurado en el dispositivo.
- **Presets TCP** — perfiles Balanceado, Agresivo, Conservador y Gaming que ajustan los parámetros `sysctl` en tiempo real. Cada preset se resuelve contra el kernel: carga el algoritmo de congestión preferido cuando está disponible y cae a `cubic` en caso contrario.
- **Ajustes avanzados** — opciones individuales agrupadas por categoría (rendimiento, latencia, estabilidad, avanzado), validadas contra lo que el kernel acepta realmente, con las opciones no soportadas desactivadas y explicando qué `CONFIG` del kernel falta.
- **Transparencia** — al aplicar un preset, un panel muestra exactamente qué se aplicó, qué se omitió y por qué (clave no soportada, restringida por el preset, valor rechazado, etc.).
- **Bilingüe** — la interfaz está disponible en español e inglés, conmutable desde la barra superior; el idioma se recuerda entre sesiones.

## Requisitos

- Dispositivo rooteado con **Magisk**, **KernelSU** o **APatch**.
- En Magisk y APatch, un manager que pueda alojar la WebUI (p. ej. **KsuWebUI**).

## Instalación

1. Descarga `NetBoost-v2.5.1.zip`.
2. Instálalo desde tu manager: **Módulos → Instalar desde almacenamiento**.
3. Reinicia.
4. Abre el módulo desde la lista de módulos y toca el icono de WebUI (⧉).

## Uso

- **Pestaña DNS** — selecciona una tarjeta de proveedor o desactiva el DNS privado. Un host personalizado puede escribirse en el campo al final de la lista.
- **Pestaña TCP** — elige un preset y aplícalo, o ajusta opciones individuales en las categorías avanzadas.
- **Pestaña Estado** — consulta el host de DNS y el control de congestión TCP actuales según los reporta el dispositivo.
- **Panel principal** — resumen de un vistazo del DNS, el preset y el control de congestión aplicados.

Todo lo que aplica el módulo se guarda en `/data/adb/modules/netboost/` y se restaura automáticamente en cada arranque.

## Cómo funciona

- **Aplicación verificada** — los presets se escriben con `sysctl` y se releen para confirmar que el kernel aceptó el valor; el panel de resolución informa de cualquier discrepancia.
- **Reaplicación al arrancar** — `service.sh` reaplica el estado de DNS y TCP guardado línea a línea en el arranque, reproduciendo exactamente los valores que el kernel aceptó, sin re-resolver.
- **Desinstalación segura** — `uninstall.sh` restaura los valores de DNS y `sysctl` que existían antes de instalar el módulo; se respaldan en el primer uso.
- **Sin cambios persistentes** — más allá de lo que el usuario configura explícitamente. Si no se aplica ningún preset, los parámetros TCP no se tocan.

## Estructura del módulo

```
NetBoost/
├── META-INF/com/google/android/   Instalador estándar Magisk
├── module.prop                    Metadatos del módulo
├── customize.sh                   Permisos al instalar
├── service.sh                     Reaplica la configuración al arrancar
├── uninstall.sh                   Restaura los valores originales
├── backup.sh                      Utilidades compartidas de respaldo
└── webroot/                       Interfaz web (ES/EN)
    ├── index.html
    ├── config/                    Perfiles DNS, presets TCP y opciones
    ├── css/
    └── js/
```

## Licencia

Licenciado bajo la **GNU General Public License v3.0**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

Consulta el [CHANGELOG](CHANGELOG.md) para el historial de versiones.
