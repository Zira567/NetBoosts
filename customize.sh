#!/system/bin/sh
# NetBoost - instalación (Magisk / KernelSU / APatch)
# No requiere montajes ni sepolicy: solo extraer archivos y fijar permisos.
MODDIR=${0%/*}

ui_print "- Instalando NetBoost v2.5.2"

# Los scripts del módulo deben ser ejecutables.
chmod 0755 "$MODDIR/service.sh" "$MODDIR/uninstall.sh" "$MODDIR/backup.sh" 2>/dev/null

# Contenido web legible (la ZIP ya trae los modos correctos; refuerzo aquí).
if command -v set_perm_recursive >/dev/null 2>&1; then
  set_perm_recursive "$MODDIR/webroot" 0 0 0755 0644 2>/dev/null
fi
