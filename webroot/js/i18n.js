/**
 * NetBoost - Sistema de idiomas (ES/EN)
 *
 * `STRINGS` contiene los textos fijos de la interfaz. `t(key, vars)` los
 * devuelve en el idioma actual, sustituyendo marcadores `{{var}}` si se
 * pasan variables. `pick(obj)` resuelve un objeto bilingüe `{es, en}`
 * proveniente de los JSON de configuración (con fallback a "es").
 */

const STRINGS = {
  es: {
    appName: "NetBoost",
    tabDns: "DNS",
    tabTcp: "TCP",
    tabStatus: "Estado",
    themeToggle: "Cambiar tema",
    langToggle: "Cambiar idioma",
    dnsHint: "Selecciona un proveedor de DNS privado (DoT):",
    dnsOff: "Desactivar",
    dnsCustomPlaceholder: "Host DNS personalizado",
    apply: "Aplicar",
    tcpHint: "Selecciona un preset de optimización TCP:",
    tcpTitle: "Preset de optimización TCP",
    tcpSub: "Elige un perfil de parámetros de red y aplícalo al instante.",
    congestionHint: "Congestión",
    advancedHint: "Ajustes avanzados por categoría:",
    statusLoading: "Cargando estado…",
    statusQuerying: "Consultando…",
    statusError: "No se pudo leer el estado.",
    statusDnsLabel: "DNS privado actual",
    statusCcLabel: "Control de congestión TCP",
    statusBridgeLabel: "Modo bridge",
    statusBridgeNative: "nativo (root)",
    statusBridgeSimulated: "simulado",
    dnsOffValue: "desactivado",
    dnsNotSet: "(no configurado)",
    refresh: "Actualizar",
    custom: "Personalizado",
    customCurrent: "Personalizado (actual)",
    toastDnsApplied: "DNS privado aplicado: {{host}}",
    toastDnsError: "Error al aplicar DNS",
    toastDnsInvalid: "Host DNS no válido",
    toastDnsOff: "DNS privado desactivado",
    toastDnsOffError: "Error al desactivar DNS",
    toastTcpApplied: "Preset TCP aplicado: {{name}}",
    toastTcpPartial: "Preset {{name}}: aplicado parcialmente ({{count}} parámetro(s) rechazado(s) o inválidos)",
    toastTcpError: "Error al aplicar preset TCP",
    toastTcpNotSaved: "Preset TCP aplicado: {{name}}, pero no se pudo guardar para el próximo boot",
    toastTcpAdapted: "Preset {{name}} aplicado ({{count}} opción(es) no disponible(s) en este kernel)",
    optUnsupported: "no disponible en este kernel",
    optUnsupportedTitle: "Este kernel no incluye: {{keys}}",
    toastOptApplied: "{{name}} aplicado",
    toastOptMismatch: "{{name}}: el kernel no aceptó ese valor, mostrando el real",
    toastOptError: "Error al aplicar {{name}}",
    toastOptNotSaved: "{{name}} aplicado, pero no se pudo guardar para el próximo boot",
    toastCcUnloadable: "{{name}}: el kernel no pudo cargar el módulo de congestión",
    detecting: "Detectando valores actuales…",
    bufferCurrentLabel: "Actual del sistema",
    bufferCurrentHint: "El valor que ya tiene el kernel ahora mismo, sin cambios.",
    bufferBalancedLabel: "Equilibrado",
    bufferBalancedHint: "Calculado a partir del valor actual, limitado al techo real del dispositivo ({{cap}} B).",
    bufferHighLabel: "Alto rendimiento",
    bufferHighHintKnown: "Usa el máximo real permitido en este dispositivo ({{sysctl}} = {{cap}} B).",
    bufferHighHintUnknown: "No se pudo leer {{sysctl}}; se usa el máximo actual como techo ({{cap}} B) para no forzar un valor no comprobado.",
    bufferDetail: "mín {{min}} · pred. {{def}} · máx {{max}}",
    tabHome: "Inicio",
    navLabel: "Navegación principal",
    dashSection: "Estado actual",
    dashModule: "Módulo",
    dashPreset: "Preset TCP",
    dashPresetNone: "ninguno",
    dashBackup: "Respaldo original",
    dashBackupYes: "guardado",
    dashBackupNo: "sin respaldo",
    dashUnknown: "—",
    dashGoTcp: "Preset TCP",
    dashGoDns: "DNS privado",
    tcpResolutionTitle: "Resolución aplicada",
    tcpResolutionOmitted: "parámetro(s) omitido(s)",
    tcpResolutionfallback: "{{from}} no disponible, se usó {{to}}",
    tcpResolutionloaded: "módulo {{from}} cargado, se usó {{to}}",
    tcpResolutionavoid: "restringido por el preset",
    tcpResolutionunsupported: "no soportado por el kernel",
    tcpResolutioninvalid: "clave o valor no válidos",
    tcpResolutionrejected: "el kernel rechazó el valor",
    networkPerformance: "Rendimiento de red",
    networkNotTested: "No probado todavía",
    networkTesting: "Probando conexión…",
    networkDownload: "Descarga",
    networkUpload: "Subida",
    networkPing: "Ping",
    networkJitter: "Jitter",
    networkTestSpeed: "Probar velocidad",
    networkRetest: "Repetir prueba",
    networkMbps: "Mbps",
    networkMs: "ms",
    networkError: "No se pudo completar la prueba",
    networkTimeout: "La prueba tardó demasiado",
    networkUnavailable: "—",
    networkDone: "Prueba completada"
  },
  en: {
    appName: "NetBoost",
    tabDns: "DNS",
    tabTcp: "TCP",
    tabStatus: "Status",
    themeToggle: "Toggle theme",
    langToggle: "Change language",
    dnsHint: "Choose a private DNS provider (DoT):",
    dnsOff: "Disable",
    dnsCustomPlaceholder: "Custom DNS host",
    apply: "Apply",
    tcpHint: "Choose a TCP optimization preset:",
    tcpTitle: "TCP optimization preset",
    tcpSub: "Pick a network parameter profile and apply it instantly.",
    congestionHint: "Congestion",
    advancedHint: "Advanced settings by category:",
    statusLoading: "Loading status…",
    statusQuerying: "Checking…",
    statusError: "Couldn't read the status.",
    statusDnsLabel: "Current private DNS",
    statusCcLabel: "TCP congestion control",
    statusBridgeLabel: "Bridge mode",
    statusBridgeNative: "native (root)",
    statusBridgeSimulated: "simulated",
    dnsOffValue: "disabled",
    dnsNotSet: "(not set)",
    refresh: "Refresh",
    custom: "Custom",
    customCurrent: "Custom (current)",
    toastDnsApplied: "Private DNS applied: {{host}}",
    toastDnsError: "Error applying DNS",
    toastDnsInvalid: "Invalid DNS host",
    toastDnsOff: "Private DNS disabled",
    toastDnsOffError: "Error disabling DNS",
    toastTcpApplied: "TCP preset applied: {{name}}",
    toastTcpPartial: "{{name}} preset: partially applied ({{count}} parameter(s) rejected or invalid)",
    toastTcpError: "Error applying TCP preset",
    toastTcpNotSaved: "TCP preset applied: {{name}}, but couldn't be saved for next boot",
    toastTcpAdapted: "{{name}} preset applied ({{count}} option(s) unavailable on this kernel)",
    optUnsupported: "not available on this kernel",
    optUnsupportedTitle: "This kernel doesn't include: {{keys}}",
    toastOptApplied: "{{name}} applied",
    toastOptMismatch: "{{name}}: the kernel didn't accept that value, showing the real one",
    toastOptError: "Error applying {{name}}",
    toastOptNotSaved: "{{name}} applied, but couldn't be saved for next boot",
    toastCcUnloadable: "{{name}}: the kernel couldn't load the congestion module",
    detecting: "Detecting current values…",
    bufferCurrentLabel: "Current system value",
    bufferCurrentHint: "The value the kernel already has right now, unchanged.",
    bufferBalancedLabel: "Balanced",
    bufferBalancedHint: "Calculated from the current value, capped at the device's real ceiling ({{cap}} B).",
    bufferHighLabel: "High performance",
    bufferHighHintKnown: "Uses the real maximum allowed on this device ({{sysctl}} = {{cap}} B).",
    bufferHighHintUnknown: "Couldn't read {{sysctl}}; the current maximum is used as ceiling ({{cap}} B) to avoid forcing an unverified value.",
    bufferDetail: "min {{min}} · def. {{def}} · max {{max}}",
    tabHome: "Home",
    navLabel: "Main navigation",
    dashSection: "Current state",
    dashModule: "Module",
    dashPreset: "TCP preset",
    dashPresetNone: "none",
    dashBackup: "Original backup",
    dashBackupYes: "saved",
    dashBackupNo: "none",
    dashUnknown: "—",
    dashGoTcp: "TCP preset",
    dashGoDns: "Private DNS",
    tcpResolutionTitle: "Applied resolution",
    tcpResolutionOmitted: "parameter(s) skipped",
    tcpResolutionfallback: "{{from}} unavailable, using {{to}}",
    tcpResolutionloaded: "module {{from}} loaded, using {{to}}",
    tcpResolutionavoid: "blocked by the preset",
    tcpResolutionunsupported: "unsupported by the kernel",
    tcpResolutioninvalid: "invalid key or value",
    tcpResolutionrejected: "the kernel rejected the value",
    networkPerformance: "Network performance",
    networkNotTested: "Not tested yet",
    networkTesting: "Testing connection…",
    networkDownload: "Download",
    networkUpload: "Upload",
    networkPing: "Ping",
    networkJitter: "Jitter",
    networkTestSpeed: "Test speed",
    networkRetest: "Repeat test",
    networkMbps: "Mbps",
    networkMs: "ms",
    networkError: "The test could not be completed",
    networkTimeout: "The test timed out",
    networkUnavailable: "—",
    networkDone: "Test completed"
  }
};

let currentLang = localStorage.getItem("netboost_lang") ||
  (navigator.language?.toLowerCase().startsWith("en") ? "en" : "es");

function getLang() {
  return currentLang;
}

function setLang(lang) {
  currentLang = lang === "en" ? "en" : "es";
  localStorage.setItem("netboost_lang", currentLang);
  document.documentElement.setAttribute("lang", currentLang);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{{${k}}}`));
}

function t(key, vars) {
  const str = (STRINGS[currentLang] && STRINGS[currentLang][key]) || STRINGS.es[key] || key;
  return interpolate(str, vars);
}

// Resuelve un campo bilingüe { es, en } proveniente de los JSON de config.
// Admite también strings planos por si algún campo no fue traducido.
function pick(field) {
  if (field == null) return "";
  if (typeof field === "string") return field;
  return field[currentLang] || field.es || Object.values(field)[0] || "";
}

document.documentElement.setAttribute("lang", currentLang);

export default { t, pick, getLang, setLang };
