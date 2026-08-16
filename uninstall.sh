#!/system/bin/sh
# NetBoost - restaura los valores originales al desinstalar
MODDIR=${0%/*}
STATE_DIR="$MODDIR"

# Utilidades compartidas (respaldo + restauración) desde backup.sh
. "$MODDIR/backup.sh"

# Sysctls que NetBoost puede modificar
KNOWN_SYSCTLS="net.ipv4.tcp_congestion_control
net.ipv4.tcp_window_scaling
net.ipv4.tcp_sack
net.ipv4.tcp_fastopen
net.ipv4.tcp_timestamps
net.ipv4.tcp_mtu_probing
net.ipv4.tcp_ecn
net.ipv4.tcp_retries1
net.ipv4.tcp_retries2
net.ipv4.tcp_keepalive_time
net.ipv4.tcp_keepalive_intvl
net.ipv4.tcp_keepalive_probes
net.ipv4.tcp_rmem
net.ipv4.tcp_wmem"

# Restaura los sysctls desde el respaldo original (valores reales del
# dispositivo capturados antes de la primera modificación, nunca inventados).
restore

# Si una opción no tiene respaldo no se inventa ningún valor: se registra y se
# continúa con las demás restauraciones.
for KEY in $KNOWN_SYSCTLS; do
  has_backup "$KEY" || echo "[NetBoost] Sin respaldo original para $KEY; no se restaura."
done

# Restaura el estado DNS original desde su respaldo.
if ! restore_dns; then
  echo "[NetBoost] Sin respaldo original de DNS; no se restaura."
fi

# Una vez restaurado, se elimina todo el estado de NetBoost (incluidos respaldos).
rm -rf "$STATE_DIR"
