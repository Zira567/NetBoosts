#!/system/bin/sh
# NetBoost - reaplica el último estado guardado tras cada arranque
MODDIR=${0%/*}
STATE_DIR="$MODDIR"

# Utilidades compartidas (respaldo + validación) desde backup.sh
. "$MODDIR/backup.sh"

# Espera a que el sistema esté listo
until [ "$(getprop sys.boot_completed)" = "1" ]; do
  sleep 2
done

if [ -f "$STATE_DIR/dns.state" ]; then
  HOST=$(cat "$STATE_DIR/dns.state")
  if [ "$HOST" = "off" ]; then
    settings put global private_dns_mode off
  else
    settings put global private_dns_mode hostname
    settings put global private_dns_specifier "$HOST"
  fi
fi

# tcp.state guarda la RESOLUCIÓN del preset: primera línea "preset=<id>" y
# después las claves "sysctl.key=valor" que el kernel aceptó al aplicarlas.
# Se reaplica línea a línea tal cual, sin re-resolver: el arranque reproduce
# exactamente la decisión del WebUI. apply_sysctl valida cada clave/valor.
if [ -f "$STATE_DIR/tcp.state" ]; then
  if grep -q '^preset=' "$STATE_DIR/tcp.state"; then
    while IFS='=' read -r KEY VALUE; do
      [ -n "$KEY" ] || continue
      [ "$KEY" = "preset" ] && continue
      # Si el kernel compila el algoritmo como módulo (p.ej. tcp_bbr=m en GKI,
      # o tcp_cubic/tcp_westwood en kernels custom) y aún no está cargado, se
      # intenta cargar antes de escribir la clave.
      if [ "$KEY" = "net.ipv4.tcp_congestion_control" ]; then
        modprobe "tcp_${VALUE}" 2>/dev/null || \
          insmod "/system/lib/modules/tcp_${VALUE}.ko" 2>/dev/null || \
          insmod "/vendor/lib/modules/tcp_${VALUE}.ko" 2>/dev/null || \
          insmod "/vendor_dlkm/lib/modules/tcp_${VALUE}.ko" 2>/dev/null || \
          insmod "/system_dlkm/lib/modules/tcp_${VALUE}.ko" 2>/dev/null || \
          for p in "/vendor_dlkm/lib/modules/"*/"tcp_${VALUE}.ko" \
                   "/system_dlkm/lib/modules/"*/"tcp_${VALUE}.ko" \
                   "/lib/modules/"*/"tcp_${VALUE}.ko"; do
            [ -e "$p" ] && { insmod "$p" 2>/dev/null && break; }
          done || true
        # Algunos kernels restringen tcp_allowed_congestion_control a un
        # subconjunto; se amplía a todo lo disponible antes de activar el
        # algoritmo para que el boot reproduzca la elección de la WebUI.
        AVAILABLE_CC=$(cat /proc/sys/net/ipv4/tcp_available_congestion_control 2>/dev/null)
        case " $(cat /proc/sys/net/ipv4/tcp_allowed_congestion_control 2>/dev/null) " in
          *" $VALUE "*) : ;;
          *) [ -n "$AVAILABLE_CC" ] && apply_sysctl net.ipv4.tcp_allowed_congestion_control "$AVAILABLE_CC" ;;
        esac
      fi
      apply_sysctl "$KEY" "$VALUE"
    done < "$STATE_DIR/tcp.state"
  else
    # Migración desde v2.1.1 (el archivo solo tenía el id del preset).
    # Reaplica las claves seguras equivalentes y reescribe el formato nuevo
    # para que el próximo arranque use la ruta normal. No se reaplican ECN,
    # MTU probing ni retries bajos: son los tweaks retirados por riesgo.
    PRESET=$(head -n 1 "$STATE_DIR/tcp.state" | tr -d '[:space:]')
    case "$PRESET" in
      balanced|conservative) PREF="cubic" ;;
      aggressive|gaming) PREF="bbr" ;;
      *) PREF="" ;;
    esac
    if [ -n "$PREF" ]; then
      AVAILABLE_CC=$(cat /proc/sys/net/ipv4/tcp_available_congestion_control 2>/dev/null)
      ALLOWED_CC=$(cat /proc/sys/net/ipv4/tcp_allowed_congestion_control 2>/dev/null)
      if [ -n "$ALLOWED_CC" ]; then
        case " $ALLOWED_CC " in
          *" $PREF "*) CC="$PREF" ;;
          *) CC="cubic" ;;
        esac
      else
        case " $AVAILABLE_CC " in
          *" $PREF "*) CC="$PREF" ;;
          *) CC="cubic" ;;
        esac
      fi
      EXTRA=""
      [ "$PRESET" = "aggressive" ] || [ "$PRESET" = "gaming" ] && EXTRA="net.ipv4.tcp_fastopen=3"
      apply_sysctl net.ipv4.tcp_congestion_control "$CC"
      apply_sysctl net.ipv4.tcp_window_scaling 1
      apply_sysctl net.ipv4.tcp_sack 1
      [ -n "$EXTRA" ] && apply_sysctl "${EXTRA%%=*}" "${EXTRA#*=}"
      printf 'preset=%s\n%s=%s\nnet.ipv4.tcp_window_scaling=1\nnet.ipv4.tcp_sack=1\n%s\n' \
        "$PRESET" \
        net.ipv4.tcp_congestion_control "$CC" \
        "$EXTRA" > "$STATE_DIR/.tcp_state.tmp" && \
        mv -f "$STATE_DIR/.tcp_state.tmp" "$STATE_DIR/tcp.state"
    fi
  fi
fi

# Reaplica las opciones avanzadas individuales (Rendimiento, Baja latencia,
# Estabilidad, Avanzado) guardadas como líneas "sysctl.key=valor".
# apply_sysctl ignora de forma defensiva claves o valores vacíos/inválidos.
if [ -f "$STATE_DIR/tcp_advanced.state" ]; then
  while IFS='=' read -r KEY VALUE; do
    apply_sysctl "$KEY" "$VALUE"
  done < "$STATE_DIR/tcp_advanced.state"
fi
