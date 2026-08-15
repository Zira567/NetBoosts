# NetBoost

Módulo root para configurar DNS privado y optimizar los parámetros TCP de Android. Compatible con Magisk, KernelSU y APatch. La interfaz web se abre dentro del propio manager, sin necesidad de servidor local ni puertos.

## Uso

1. Instala `NetBoost-v2.1.0.zip` desde el manager: Módulos → Instalar desde almacenamiento.
2. Reinicia.
3. Abre el módulo desde la lista de módulos y toca el icono de WebUI (⧉).

La interfaz tiene dos idiomas (ES/EN), se cambia desde el botón de la barra superior.

## Qué hace

- **DNS privado**: selecciona un proveedor DoT (Cloudflare, Google, AdGuard, NextDNS, Quad9, OpenDNS) o escribe un host personalizado. El cambio se aplica con `settings put global private_dns_specifier`, el mecanismo estándar de Android.
- **Presets TCP**: perfiles predefinidos (Balanceado, Agresivo, Conservador, Gaming) que ajustan `sysctl` en caliente. Cada preset usa el algoritmo de congestión disponible en el kernel y cae a `cubic` si el preferido no existe.
- **Ajustes avanzados**: opciones individuales agrupadas por categoría (rendimiento, latencia, estabilidad y avanzado), con validación de lo que el kernel acepta realmente.

Todo se guarda en `/data/adb/modules/netboost/` y se reaplica automáticamente en cada arranque.

## Estructura

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
    ├── css/
    └── js/
```

La WebUI se carga directamente en el WebView del manager (`webroot/js/bridge.js` se comunica con la API `ksu.exec`). En Magisk y APatch funciona con una app compatible como KsuWebUI. No hay HTTP de por medio: los archivos se sirven desde el propio módulo.

## Detalles técnicos

- La desinstalación restaura los valores de DNS y `sysctl` que existían antes de instalar el módulo; se respaldan en el primer uso.
- Los presets se verifican después de aplicarse y la interfaz muestra el valor real del kernel cuando no acepta el solicitado.
- El idioma elegido se recuerda entre sesiones.

## Notas

El módulo no modifica el sistema de forma persistente fuera de lo que el usuario configura explícitamente. Si no se aplica ningún preset, `service.sh` no toca los parámetros TCP.
