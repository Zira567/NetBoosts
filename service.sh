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

if [ -f "$STATE_DIR/tcp.state" ]; then
  PRESET=$(cat "$STATE_DIR/tcp.state")
  AVAILABLE_CC=$(cat /proc/sys/net/ipv4/tcp_available_congestion_control 2>/dev/null)

  # Comprueba capacidades: usa el algoritmo preferido solo si el kernel lo
  # ofrece, si no cae al fallback (normalmente cubic, casi siempre presente).
  resolve_cc() {
    PREFERRED="$1"
    FALLBACK="$2"
    case " $AVAILABLE_CC " in
      *" $PREFERRED "*) echo "$PREFERRED" ;;
      *" $FALLBACK "*) echo "$FALLBACK" ;;
      *) echo "" ;;
    esac
  }

  case "$PRESET" in
    balanced)
      CC=$(resolve_cc cubic cubic)
      [ -n "$CC" ] && apply_sysctl net.ipv4.tcp_congestion_control "$CC"
      apply_sysctl net.ipv4.tcp_window_scaling 1
      apply_sysctl net.ipv4.tcp_sack 1
      ;;
    aggressive)
      CC=$(resolve_cc bbr cubic)
      [ -n "$CC" ] && apply_sysctl net.ipv4.tcp_congestion_control "$CC"
      apply_sysctl net.ipv4.tcp_window_scaling 1
      apply_sysctl net.ipv4.tcp_sack 1
      apply_sysctl net.ipv4.tcp_fastopen 3
      ;;
    conservative)
      CC=$(resolve_cc cubic cubic)
      [ -n "$CC" ] && apply_sysctl net.ipv4.tcp_congestion_control "$CC"
      apply_sysctl net.ipv4.tcp_window_scaling 1
      apply_sysctl net.ipv4.tcp_sack 1
      ;;
    gaming)
      CC=$(resolve_cc bbr cubic)
      [ -n "$CC" ] && apply_sysctl net.ipv4.tcp_congestion_control "$CC"
      apply_sysctl net.ipv4.tcp_window_scaling 1
      apply_sysctl net.ipv4.tcp_sack 1
      apply_sysctl net.ipv4.tcp_fastopen 3
      apply_sysctl net.ipv4.tcp_ecn 1
      apply_sysctl net.ipv4.tcp_mtu_probing 1
      apply_sysctl net.ipv4.tcp_retries1 2
      ;;
  esac
fi

# Reaplica las opciones avanzadas individuales (Rendimiento, Baja latencia,
# Estabilidad, Avanzado) guardadas como líneas "sysctl.key=valor".
# apply_sysctl ignora de forma defensiva claves o valores vacíos/inválidos.
if [ -f "$STATE_DIR/tcp_advanced.state" ]; then
  while IFS='=' read -r KEY VALUE; do
    apply_sysctl "$KEY" "$VALUE"
  done < "$STATE_DIR/tcp_advanced.state"
fi
