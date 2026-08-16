#!/system/bin/sh
# NetBoost - utilidades compartidas: respaldo y restauración de valores sysctl.
# Guarda el valor original del dispositivo antes de la primera modificación para
# poder restaurarlo en la desinstalación (M1). También valida claves y valores
# para que nunca se genere ni se aplique un "key=" vacío (M4).
# El directorio de estado coincide con el del script: el módulo guarda sus
# archivos junto a service.sh/uninstall.sh. Se deriva de $0 para funcionar
# con cualquier ID de módulo (netboost y también rutas simuladas del harness).
STATE_DIR=${0%/*}
BACKUP_FILE="$STATE_DIR/sysctl_backup.state"
DNS_BACKUP_FILE="$STATE_DIR/dns_backup.state"

# Captura el valor original de un sysctl antes de la primera modificación.
# Solo guarda claves válidas y valores no vacíos (nunca "clave=").
ensure() {
  local KEY VALUE
  KEY="$1"
  [ -n "$KEY" ] || return 0
  printf '%s' "$KEY" | grep -Eq '^[a-z0-9_.-]{1,64}$' || return 0
  mkdir -p "$STATE_DIR"
  [ -f "$BACKUP_FILE" ] || : > "$BACKUP_FILE"
  grep -q "^${KEY}=" "$BACKUP_FILE" 2>/dev/null && return 0
  VALUE=$(sysctl -n "$KEY" 2>/dev/null)
  [ -n "$VALUE" ] || return 0
  printf '%s=%s\n' "$KEY" "$VALUE" >> "$BACKUP_FILE"
}

# Captura el estado original de DNS antes de la primera modificación.
# Guarda private_dns_mode y private_dns_specifier tal cual estaban; si un valor
# no estaba definido se guarda como "null" para poder limpiarlo al desinstalar.
ensure_dns() {
  local MODE SPEC
  mkdir -p "$STATE_DIR"
  [ -f "$DNS_BACKUP_FILE" ] || : > "$DNS_BACKUP_FILE"
  grep -q '^private_dns_mode=' "$DNS_BACKUP_FILE" 2>/dev/null && return 0
  MODE=$(settings get global private_dns_mode 2>/dev/null) || MODE=""
  SPEC=$(settings get global private_dns_specifier 2>/dev/null) || SPEC=""
  [ -n "$MODE" ] || [ -n "$SPEC" ] || return 0
  printf 'private_dns_mode=%s\nprivate_dns_specifier=%s\n' "${MODE:-null}" "${SPEC:-null}" >> "$DNS_BACKUP_FILE"
}

# Restaura el estado DNS original desde el respaldo. "null" significa que el
# valor no estaba definido originalmente y se limpia con settings delete.
restore_dns() {
  local MODE SPEC
  [ -f "$DNS_BACKUP_FILE" ] || return 1
  MODE=$(grep '^private_dns_mode=' "$DNS_BACKUP_FILE" 2>/dev/null | head -1 | cut -d= -f2-)
  SPEC=$(grep '^private_dns_specifier=' "$DNS_BACKUP_FILE" 2>/dev/null | head -1 | cut -d= -f2-)
  case "$MODE" in
    null) settings delete global private_dns_mode 2>/dev/null ;;
    opportunistic|hostname|off) settings put global private_dns_mode "$MODE" ;;
    *)
      echo "[NetBoost] private_dns_mode original inválido ($MODE); omitido." ;;
  esac
  case "$SPEC" in
    null) settings delete global private_dns_specifier 2>/dev/null ;;
    "")
      echo "[NetBoost] private_dns_specifier original no respaldado; omitido." ;;
    *[!A-Za-z0-9.-]*)
      echo "[NetBoost] private_dns_specifier original inválido ($SPEC); omitido." ;;
    *)
      settings put global private_dns_specifier "$SPEC" ;;
  esac
  return 0
}

# Valida clave y valor y aplica el sysctl. Ignora entradas inválidas/vacías.
apply_sysctl() {
  local KEY VALUE
  KEY="$1"
  VALUE="$2"
  printf '%s' "$KEY" | grep -Eq '^[a-z0-9_.-]{1,64}$' || return 1
  printf '%s' "$VALUE" | grep -Eq '^[A-Za-z0-9 _.,+-]{1,128}$' || return 1
  ensure "$KEY"
  sysctl -w "$KEY=$VALUE"
}

# Restaura todos los valores originales capturados.
restore() {
  local KEY VALUE
  [ -f "$BACKUP_FILE" ] || return 0
  while IFS='=' read -r KEY VALUE; do
    printf '%s' "$KEY" | grep -Eq '^[a-z0-9_.-]{1,64}$' || continue
    printf '%s' "$VALUE" | grep -Eq '^[A-Za-z0-9 _.,+-]{1,128}$' || continue
    sysctl -w "$KEY=$VALUE" 2>/dev/null
  done < "$BACKUP_FILE"
}

# Devuelve 0 si la clave ya tiene un valor original respaldado.
has_backup() {
  local KEY
  KEY="$1"
  [ -f "$BACKUP_FILE" ] || return 1
  grep -q "^${KEY}=" "$BACKUP_FILE" 2>/dev/null
}

if [ "$(basename "$0")" = "backup.sh" ]; then
  case "${1:-}" in
    ensure) ensure "${2:-}" ;;
    restore) restore ;;
    has_backup) has_backup "${2:-}" ;;
    ensure_dns) ensure_dns ;;
    restore_dns) restore_dns ;;
  esac
fi
