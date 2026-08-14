# NetBoost

Módulo root (Magisk / KernelSU / APatch) para configurar DNS privado y ajustes TCP, con WebUI integrada en el propio manager — **sin servidor Node.js ni puertos locales**. Disponible en español e inglés.

## Cómo funciona la WebUI (importante)

- Los archivos de `webroot/` se cargan directamente en el WebView del manager (no hay HTTP de por medio, no hay enlace externo que abrir).
- Las acciones (cambiar DNS, aplicar preset TCP) se ejecutan con el objeto global `ksu` que el manager inyecta en la página (`webroot/js/bridge.js`).
- En Magisk y APatch, este mismo `webroot/` funciona a través de una app compatible como **KsuWebUI**, que expone la misma API `ksu.exec`.
- `service.sh` reaplica en cada arranque el último DNS/preset guardado en `/data/adb/modules/netboost/`.
- El botón 🌐 de la barra superior cambia el idioma de la interfaz (ES/EN) al vuelo, sin recargar la página.

## Estructura

```
NetBoost/
├── META-INF/com/google/android/   # instalador estándar Magisk (recuperación)
├── module.prop
├── customize.sh                   # permisos al instalar
├── service.sh                     # reaplica config guardada al arrancar
├── uninstall.sh
├── backup.sh                      # utilidades compartidas de respaldo
└── webroot/
    ├── index.html
    ├── css/style.css
    ├── js/
    │   ├── bridge.js    # puente con ksu.exec (sin servidor)
    │   ├── i18n.js      # textos ES/EN y helper de traducción
    │   └── app.js
    └── config/
        ├── dns-profiles.json   # nombres bilingües { es, en }
        ├── tcp-presets.json    # nombres bilingües { es, en }
        └── tcp-options.json    # nombres/etiquetas/hints bilingües { es, en }
```

## Instalación

1. Instala `NetBoost-v2.1.0.zip` (generado para release) desde el manager (KernelSU, Magisk o APatch) → Módulos → Instalar desde almacenamiento.
2. Reinicia.
3. Abre el módulo desde la lista de módulos → botón de WebUI (icono ⧉). Se abre dentro del propio manager, no en el navegador.

## Notas

- El cambio de DNS privado usa `settings put global private_dns_specifier`, el mecanismo estándar de Android para DNS-over-TLS.
- Los presets TCP aplican valores de `sysctl` en caliente; se guardan y se reaplican en cada arranque vía `service.sh`.
- El idioma elegido se guarda en `localStorage` del WebView y se recuerda entre sesiones.
