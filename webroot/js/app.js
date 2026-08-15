import Bridge from "./bridge.js";
import I18n from "./i18n.js";

const STATE_DIR = "/data/adb/modules/netboost";
const { t, pick } = I18n;
let detectedAlgos = [];
let tcpPresets = [];

// --- Iconografía SVG (capa de render; no altera la lógica funcional) ---
const ICONS = {
  bolt: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9z"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  gamepad: '<path d="M6 12h4"/><path d="M8 10v4"/><path d="M15 11h.01M18 13h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/>',
  signal: '<path d="M2 20h2M7 20v-4M12 20v-8M17 20v-12M22 20V4"/>',
  sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3"/><path d="M14 2v4M8 10v4M16 18v4"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
  shieldcheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>'
};
const EMOJI_ICONS = {
  "⚡": "bolt", "🌐": "globe", "🌙": "moon", "☀": "sun",
  "🔵": "cloud", "📍": "search", "🟢": "shieldcheck", "🎵": "zap", "🔒": "lock", "🟠": "globe",
  "🚫": "ban", "⚖": "scale", "🚀": "rocket", "🛡": "shield",
  "🎮": "gamepad", "📶": "signal", "⚙": "sliders"
};
function svgIcon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}
function icon(s) {
  const name = EMOJI_ICONS[String(s ?? "").replace(/\uFE0F/g, "")];
  return name ? svgIcon(name) : (s ?? "");
}

// Accesibilidad: tarjetas interactivas (role/tabindex/teclado) sin tocar la lógica
function makeClickable(card, handler) {
  card.addEventListener("click", handler);
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handler(); }
  });
}
function setPressed(el, value) {
  if (el && typeof el.setAttribute === "function") el.setAttribute("aria-pressed", String(value));
}

const SYSCTL_KEY_RE = /^[a-z0-9_.-]+$/;
const SYSCTL_VALUE_RE = /^[A-Za-z0-9 _.,+-]{1,128}$/;

function isValidSysctlKey(k) {
  return typeof k === "string" && k.length <= 64 && SYSCTL_KEY_RE.test(k);
}

function isValidSysctlValue(v) {
  return typeof v === "string" && SYSCTL_VALUE_RE.test(v);
}

// Valida un hostname para private_dns_specifier: solo caracteres alfanuméricos,
// puntos y guiones (sin inyección shell), sin puntos dobles ni puntos en los
// extremos, labels de 1-63 caracteres sin guiones al inicio/fin. Las IPs se
// permiten porque la funcionalidad actual las soporta (perfil Cloudflare 1.1.1.1).
function isValidDnsHostname(host) {
  if (typeof host !== "string" || !host) return false;
  if (host.length > 253) return false;
  if (!/^[A-Za-z0-9.-]+$/.test(host)) return false;
  if (host.includes("..") || host.startsWith(".") || host.endsWith(".")) return false;
  const labels = host.split(".");
  return labels.every((l) => l.length > 0 && l.length <= 63 && !l.startsWith("-") && !l.endsWith("-"));
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Carga el estado avanzado persistido (tcp_advanced.state) al iniciar la UI.
// Solo acepta claves/valores válidos; así el render inicial muestra lo que se
// reaplicará en el próximo boot y los overrides de preset respetan lo guardado.
async function loadAdvancedState() {
  try {
    const r = await Bridge.exec(`cat ${STATE_DIR}/tcp_advanced.state 2>/dev/null || true`);
    const parsed = {};
    String(r.stdout).split("\n").forEach((line) => {
      const eq = line.indexOf("=");
      if (eq <= 0) return;
      const key = line.slice(0, eq);
      const value = line.slice(eq + 1);
      if (isValidSysctlKey(key) && isValidSysctlValue(value)) parsed[key] = value;
    });
    advancedState = parsed;
  } catch (e) { /* modo simulado / sin root */ }
}

async function writeSysctl(key, value) {
  await Bridge.exec(`sh ${STATE_DIR}/backup.sh ensure ${key} && sysctl -w ${key}="${value}"`);
}

// Error de persistencia: la aplicación del sysctl fue correcta, pero el estado
// no pudo guardarse para el próximo boot. Permite distinguir este caso del
// fallo de aplicación en los catch de la UI.
class PersistError extends Error {
  constructor(message) {
    super(message);
    this.name = "PersistError";
  }
}

let persistChain = Promise.resolve();

function enqueuePersist(entries) {
  const snapshot = entries.map(([k, v]) => [k, v]);
  const write = persistChain.then(() => atomicWriteState(snapshot));
  // La cadena se recupera internamente para que las escrituras siguientes
  // sigan ejecutándose en orden (M2), pero el error de ESTA escritura se
  // propaga a quien la encoló.
  persistChain = write.catch(() => {});
  return write;
}

async function atomicWriteState(entries) {
  const lines = entries.map(([k, v]) => `"${k}=${v}"`).join(" ");
  const cmd =
    `mkdir -p ${STATE_DIR} && ` +
    `printf '%s\\n' ${lines} > ${STATE_DIR}/.tcp_advanced.tmp && ` +
    `mv -f ${STATE_DIR}/.tcp_advanced.tmp ${STATE_DIR}/tcp_advanced.state`;
  try {
    await Bridge.exec(cmd);
  } catch (e) {
    throw new PersistError(`no se pudo persistir ${STATE_DIR}/tcp_advanced.state`);
  }
}

function persistAdvancedState() {
  const entries = Object.entries(advancedState)
    .filter(([k, v]) => isValidSysctlKey(k) && isValidSysctlValue(v));
  return enqueuePersist(entries);
}

// --- Navegación ---
function showTab(name) {
  document.querySelectorAll(".nav-item").forEach((el) => {
    const active = el.dataset.tab === name;
    el.classList.toggle("active", active);
    if (active) el.setAttribute("aria-current", "page");
    else if (typeof el.removeAttribute === "function") el.removeAttribute("aria-current");
  });
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === name));
  if (name === "status") refreshStatus();
  if (name === "dashboard") refreshDashboard();
}
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => showTab(item.dataset.tab));
});

// --- Tema ---
const themeToggle = document.getElementById("themeToggle");
function applyTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  themeToggle.innerHTML = svgIcon(mode === "light" ? "sun" : "moon");
}
const savedTheme = localStorage.getItem("netboost_theme") ||
  (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");
applyTheme(savedTheme);
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  localStorage.setItem("netboost_theme", next);
});

// --- Idioma ---
const langToggle = document.getElementById("langToggle");
const langLabel = document.getElementById("langLabel");

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  langLabel.textContent = I18n.getLang().toUpperCase();
}

async function rerenderDynamicContent() {
  await loadDnsProfiles();
  await loadTcpPresets();
  await loadTcpCategories();
  const status = document.getElementById("status");
  const dashboard = document.getElementById("dashboard");
  if (status?.classList.contains("active")) {
    refreshStatus();
  } else if (dashboard?.classList.contains("active")) {
    refreshDashboard();
  } else {
    document.getElementById("statusList").innerHTML = `<p class="hint">${t("statusLoading")}</p>`;
  }
}

langToggle.addEventListener("click", async () => {
  const next = I18n.getLang() === "es" ? "en" : "es";
  I18n.setLang(next);
  applyStaticTranslations();
  await rerenderDynamicContent();
  netPerfSetState(netPerfState);
});

function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  Bridge.toast(msg);
  setTimeout(() => el.classList.remove("show"), 2200);
}

// --- DNS ---
async function loadDnsProfiles() {
  const list = document.getElementById("dnsList");
  list.innerHTML = '<div class="skeleton"></div>'.repeat(4);
  const res = await fetch("config/dns-profiles.json");
  const profiles = await res.json();
  list.innerHTML = "";

  const offCard = document.createElement("div");
  offCard.className = "card off ripple";
  offCard.innerHTML = `<div class="emoji">${icon("🚫")}</div><div class="label">${t("dnsOff")}</div>`;
  makeClickable(offCard, () => applyDnsOff(offCard));
  list.appendChild(offCard);

  profiles.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card ripple";
    card.innerHTML = `<div class="emoji">${icon(p.icon)}</div><div class="label">${pick(p.name)}</div><div class="sub">${escapeHtml(p.host)}</div>`;
    makeClickable(card, () => applyDns(p.host, card));
    list.appendChild(card);
  });
}

function markDnsSelected(cardEl) {
  document.querySelectorAll("#dnsList .card").forEach((c) => {
    c.classList.remove("selected");
    setPressed(c, false);
  });
  cardEl?.classList.add("selected");
  setPressed(cardEl, true);
}

async function applyDns(host, cardEl) {
  if (!isValidDnsHostname(host)) {
    showToast(t("toastDnsInvalid"));
    return;
  }
  markDnsSelected(cardEl);
  const cmd = [
    `mkdir -p ${STATE_DIR}`,
    `sh ${STATE_DIR}/backup.sh ensure_dns`,
    `settings put global private_dns_mode hostname`,
    `settings put global private_dns_specifier ${host}`,
    `echo "${host}" > ${STATE_DIR}/dns.state`
  ].join(" && ");
  try {
    await Bridge.exec(cmd);
    showToast(t("toastDnsApplied", { host }));
  } catch (e) {
    showToast(t("toastDnsError"));
  }
}

async function applyDnsOff(cardEl) {
  markDnsSelected(cardEl);
  const cmd = [
    `mkdir -p ${STATE_DIR}`,
    `sh ${STATE_DIR}/backup.sh ensure_dns`,
    `settings put global private_dns_mode off`,
    `echo "off" > ${STATE_DIR}/dns.state`
  ].join(" && ");
  try {
    await Bridge.exec(cmd);
    showToast(t("toastDnsOff"));
  } catch (e) {
    showToast(t("toastDnsOffError"));
  }
}

document.getElementById("applyCustomDns").addEventListener("click", () => {
  const val = document.getElementById("customDns").value.trim();
  if (val) applyDns(val);
});

// --- TCP ---
async function loadTcpPresets() {
  const list = document.getElementById("tcpList");
  list.innerHTML = '<div class="skeleton"></div>'.repeat(3);
  const res = await fetch("config/tcp-presets.json");
  const presets = await res.json();
  tcpPresets = presets;
  list.innerHTML = "";
  presets.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card ripple";
    const ccAlgo = p.congestion_control?.preferred || "";
    card.innerHTML = `<div class="emoji">${icon(p.icon)}</div><div class="label">${pick(p.name)}</div>${ccAlgo ? `<div class="sub">${escapeHtml(ccAlgo)}</div>` : ""}`;
    makeClickable(card, () => applyTcp(p, card));
    list.appendChild(card);
  });
}

async function getAvailableCongestionAlgos() {
  try {
    const r = await Bridge.exec("cat /proc/sys/net/ipv4/tcp_available_congestion_control");
    detectedAlgos = r.stdout.trim().split(/\s+/).filter(Boolean);
  } catch (e) { /* modo simulado / sin root */ }
  return detectedAlgos;
}

async function applyTcp(preset, cardEl) {
  document.querySelectorAll("#tcpList .card").forEach((c) => {
    c.classList.remove("selected");
    setPressed(c, false);
  });
  cardEl?.classList.add("selected");
  setPressed(cardEl, true);

  const presetName = pick(preset.name);

  const algos = await getAvailableCongestionAlgos();
  const cc = preset.congestion_control;
  let resolvedCC = null;
  if (cc) {
    if (algos.length === 0 || algos.includes(cc.preferred)) resolvedCC = cc.preferred;
    else if (algos.includes(cc.fallback)) resolvedCC = cc.fallback;
  }

  const targetMap = { ...preset.sysctl };
  if (resolvedCC && isValidSysctlValue(resolvedCC)) {
    targetMap["net.ipv4.tcp_congestion_control"] = resolvedCC;
  }

  const appliedMap = {};
  const failed = [];
  let persistFailed = false;
  try {
    await Bridge.exec(`mkdir -p ${STATE_DIR}`);
    for (const [key, value] of Object.entries(targetMap)) {
      const override = (advancedState[key] !== undefined && advancedState[key] !== "")
        ? advancedState[key]
        : String(value);
      if (!isValidSysctlKey(key) || !isValidSysctlValue(override)) {
        failed.push(key);
        continue;
      }
      try {
        await writeSysctl(key, override);
        const verify = await Bridge.exec(`sysctl -n ${key}`);
        const actual = normalizeSpace(verify.stdout);
        appliedMap[key] = actual;
        if (actual !== normalizeSpace(override)) failed.push(key);
      } catch (e) {
        failed.push(key);
      }
    }
    try {
      await Bridge.exec(`echo "${preset.id}" > ${STATE_DIR}/tcp.state`);
    } catch (e) {
      persistFailed = true;
    }

    if (failed.length === 0) {
      showToast(persistFailed
        ? t("toastTcpNotSaved", { name: presetName })
        : t("toastTcpApplied", { name: presetName }));
    } else if (Object.keys(appliedMap).length > failed.length) {
      showToast(t("toastTcpPartial", { name: presetName, count: failed.length }));
    } else {
      showToast(t("toastTcpError"));
    }

    await syncAdvancedFromSysctl(appliedMap);
  } catch (e) {
    showToast(t("toastTcpError"));
  }
}

// --- TCP avanzado: categorías de opciones individuales ---
const optInstances = {};
const optMeta = {};
let optionsSchema = null;
let advancedState = {};

function optKeys(opt) {
  return opt.sysctls || [opt.sysctl];
}

function normalizeSpace(s) {
  return String(s ?? "").trim().replace(/\s+/g, " ");
}

function registerInstance(optId, el, type, extra = {}) {
  (optInstances[optId] ||= []).push({ el, type, ...extra });
}

function updateExtras(optId, value) {
  const meta = optMeta[optId];
  (optInstances[optId] || []).forEach(({ hintEl, detailEl }) => {
    if (hintEl) {
      const v = meta?.rawValues.find((x) => x.value === value);
      hintEl.textContent = v?.hint ? (v.custom ? v.hint : pick(v.hint)) : "";
      hintEl.style.display = v?.hint ? "block" : "none";
    }
    if (detailEl) detailEl.textContent = formatTriplet(value);
  });
  if (meta?.valueEl) {
    const v = normalizeSpace(value);
    meta.valueEl.textContent = v;
    meta.valueEl.style.display = v ? "" : "none";
  }
}

function setInstancesValue(optId, value) {
  const norm = normalizeSpace(value);
  (optInstances[optId] || []).forEach(({ el, type }) => {
    if (type === "toggle") { el.checked = value === el.dataset.onValue; return; }
    const match = [...el.options].find((o) => normalizeSpace(o.value) === norm);
    if (match) {
      el.value = match.value;
    } else {
      let custom = el.querySelector('option[data-custom="1"]');
      if (!custom) {
        custom = document.createElement("option");
        custom.dataset.custom = "1";
        custom.textContent = t("custom");
        el.prepend(custom);
      }
      custom.value = value;
      el.value = value;
    }
  });
  updateExtras(optId, value);
}

async function readCurrentValue(opt) {
  const keys = optKeys(opt);
  const parts = [];
  for (const key of keys) {
    if (advancedState[key] !== undefined) {
      parts.push(advancedState[key]);
      continue;
    }
    try {
      const r = await Bridge.exec(`sysctl -n ${key}`);
      parts.push(normalizeSpace(r.stdout));
    } catch (e) {
      parts.push(opt.type === "toggle" ? opt.offValue : "");
    }
  }
  return parts.join(",");
}

function withCustomFallback(values, currentValue) {
  if (values.some((v) => normalizeSpace(v.value) === normalizeSpace(currentValue))) return values;
  return [{ label: t("customCurrent"), value: currentValue, custom: true }, ...values];
}

async function syncAdvancedFromSysctl(sysctlMap) {
  if (!optionsSchema || !optionsSchema.options) return;
  const touched = new Set();
  Object.keys(sysctlMap).forEach((key) => {
    const optId = Object.keys(optionsSchema.options)
      .find((id) => optKeys(optionsSchema.options[id]).includes(key));
    if (optId) touched.add(optId);
  });
  for (const optId of touched) {
    const opt = optionsSchema.options[optId];
    const v = await readCurrentValue(opt);
    setInstancesValue(optId, v);
  }
}

async function applyOption(optId, opt, value) {
  const keys = optKeys(opt);
  const parts = value.split(",").map(normalizeSpace);
  const optName = pick(opt.name);
  if (keys.length !== parts.length ||
      keys.some((k) => !isValidSysctlKey(k)) ||
      parts.some((p) => !isValidSysctlValue(p))) {
    return;
  }
  try {
    for (let i = 0; i < keys.length; i++) {
      await writeSysctl(keys[i], parts[i]);
    }

    const verifyCmd = keys.map((k) => `sysctl -n ${k}`).join(" ; ");
    const verifyRes = await Bridge.exec(verifyCmd);
    const actualLines = verifyRes.stdout.trim().split("\n").map(normalizeSpace).filter(Boolean);
    const actual = actualLines.length === keys.length ? actualLines : parts;
    const mismatch = keys.some((_, i) => actual[i] !== parts[i]);
    const finalValue = actual.join(",");

    keys.forEach((k, i) => {
      if (isValidSysctlValue(actual[i])) advancedState[k] = actual[i];
      else delete advancedState[k];
    });
    setInstancesValue(optId, finalValue);
    document.querySelectorAll("#tcpList .card").forEach((c) => {
      c.classList.remove("selected");
      setPressed(c, false);
    });
    await persistAdvancedState();

    showToast(mismatch
      ? t("toastOptMismatch", { name: optName })
      : t("toastOptApplied", { name: optName }));
  } catch (e) {
    showToast(e instanceof PersistError
      ? t("toastOptNotSaved", { name: optName })
      : t("toastOptError", { name: optName }));
  }
}

function renderToggle(container, optId, opt, uidSuffix, currentValue) {
  const row = document.createElement("div");
  row.className = "option-row";
  row.innerHTML = `
    <span class="option-label">${pick(opt.name)}</span>
    <label class="switch">
      <input type="checkbox" id="opt-${optId}-${uidSuffix}" data-on-value="${opt.onValue}" data-off-value="${opt.offValue}">
      <span class="slider"></span>
    </label>`;
  const input = row.querySelector("input");
  input.checked = currentValue === opt.onValue;
  input.setAttribute("aria-label", pick(opt.name));
  input.addEventListener("change", () => {
    applyOption(optId, opt, input.checked ? opt.onValue : opt.offValue);
  });
  registerInstance(optId, input, "toggle");
  container.appendChild(row);
}

function formatTriplet(value) {
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) return value;
  const locale = I18n.getLang() === "en" ? "en" : "es";
  const [min, def, max] = parts.map((n) => Number(n).toLocaleString(locale));
  return t("bufferDetail", { min, def, max });
}

function renderSelect(container, optId, opt, uidSuffix, currentValue, rawValues) {
  const values = withCustomFallback(rawValues, currentValue);
  optMeta[optId] = { rawValues, opt };
  const row = document.createElement("div");
  row.className = "option-row";
  const optionsHtml = values.map((v) =>
    `<option value="${v.value}" ${v.custom ? 'data-custom="1"' : ""} ${v.value === currentValue ? "selected" : ""}>${v.custom ? v.label : pick(v.label)}</option>`
  ).join("");
  row.innerHTML = `
    <span class="option-label">${pick(opt.name)}</span>
    ${opt.global ? '<span class="cc-value"></span>' : ""}
    <select id="opt-${optId}-${uidSuffix}" class="option-select">${optionsHtml}</select>`;
  const select = row.querySelector("select");
  select.setAttribute("aria-label", pick(opt.name));
  const valueEl = row.querySelector(".cc-value");
  if (valueEl) {
    const v = normalizeSpace(currentValue);
    valueEl.textContent = v;
    valueEl.style.display = v ? "" : "none";
    optMeta[optId].valueEl = valueEl;
  }
  container.appendChild(row);

  let hintEl = null;
  if (rawValues.some((v) => v.hint)) {
    hintEl = document.createElement("div");
    hintEl.className = "option-hint";
    container.appendChild(hintEl);
  }
  let detailEl = null;
  if (opt.format === "triplet") {
    detailEl = document.createElement("div");
    detailEl.className = "option-detail";
    container.appendChild(detailEl);
  }

  select.addEventListener("change", () => applyOption(optId, opt, select.value));
  registerInstance(optId, select, "select", { hintEl, detailEl });
  updateExtras(optId, currentValue);
}

async function readIntSysctl(key) {
  try {
    const r = await Bridge.exec(`sysctl -n ${key}`);
    const n = parseInt(normalizeSpace(r.stdout), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch (e) {
    return null;
  }
}

async function computeBufferValues(opt) {
  const currentRaw = await readIntTriplet(opt.sysctl);
  const ceiling = await readIntSysctl(opt.capability_sysctl);

  if (!currentRaw) {
    return [];
  }
  const [curMin, curDef, curMax] = currentRaw;
  const cap = ceiling || curMax;

  const balancedMax = Math.max(curMax, Math.min(curMax * 2, cap));
  const balancedDef = Math.min(Math.max(curDef, Math.round(balancedMax / 8)), balancedMax);

  const highMax = cap;
  const highDef = Math.min(Math.max(curDef * 2, Math.round(highMax / 6)), highMax);

  const locale = I18n.getLang() === "en" ? "en" : "es";
  const fmt = (n) => n.toLocaleString(locale);
  const values = [
    {
      label: t("bufferCurrentLabel"),
      value: `${curMin} ${curDef} ${curMax}`,
      custom: true,
      hint: t("bufferCurrentHint")
    },
    {
      label: t("bufferBalancedLabel"),
      value: `${curMin} ${balancedDef} ${balancedMax}`,
      custom: true,
      hint: t("bufferBalancedHint", { cap: fmt(cap) })
    },
    {
      label: t("bufferHighLabel"),
      value: `${curMin} ${highDef} ${highMax}`,
      custom: true,
      hint: ceiling
        ? t("bufferHighHintKnown", { sysctl: opt.capability_sysctl, cap: fmt(cap) })
        : t("bufferHighHintUnknown", { sysctl: opt.capability_sysctl, cap: fmt(cap) })
    }
  ];
  const seen = new Set();
  return values.filter((v) => {
    const norm = normalizeSpace(v.value);
    if (seen.has(norm)) return false;
    seen.add(norm);
    return true;
  });
}

async function readIntTriplet(key) {
  try {
    const r = await Bridge.exec(`sysctl -n ${key}`);
    const parts = normalizeSpace(r.stdout).split(" ").map((n) => parseInt(n, 10));
    return parts.length === 3 && parts.every(Number.isFinite) ? parts : null;
  } catch (e) {
    return null;
  }
}

async function renderOption(container, optId, uidSuffix) {
  const opt = optionsSchema.options[optId];
  const currentValue = await readCurrentValue(opt);

  if (opt.type === "toggle") {
    renderToggle(container, optId, opt, uidSuffix, currentValue);
  } else if (opt.adaptive === "buffer") {
    const values = await computeBufferValues(opt);
    renderSelect(container, optId, opt, uidSuffix, currentValue, values);
  } else if (opt.dynamic) {
    const values = detectedAlgos.length
      ? detectedAlgos.map((a) => ({ label: a, value: a, custom: true }))
      : [];
    renderSelect(container, optId, opt, uidSuffix, currentValue, values);
  } else {
    renderSelect(container, optId, opt, uidSuffix, currentValue, opt.values);
  }
}

async function loadTcpCategories() {
  const globalContainer = document.getElementById("congestionControlRow");
  const container = document.getElementById("tcpCategories");
  container.innerHTML = `<div class="hint">${t("detecting")}</div><div class="skeleton"></div><div class="skeleton"></div>`;
  globalContainer.innerHTML = '<div class="skeleton"></div>';

  await loadAdvancedState();
  const res = await fetch("config/tcp-options.json");
  optionsSchema = await res.json();

  try {
    const algoRes = await Bridge.exec("cat /proc/sys/net/ipv4/tcp_available_congestion_control");
    detectedAlgos = algoRes.stdout.trim().split(/\s+/).filter(Boolean);
  } catch (e) { /* kernel no disponible en modo simulado */ }

  globalContainer.innerHTML = "";
  const globalOptId = Object.keys(optionsSchema.options).find((id) => optionsSchema.options[id].global);
  if (globalOptId) await renderOption(globalContainer, globalOptId, "global");

  container.innerHTML = "";

  for (const cat of optionsSchema.categories) {
    const details = document.createElement("details");
    details.className = "category";
    const summary = document.createElement("summary");
    summary.innerHTML = `<span class="cat-icon">${icon(cat.icon)}</span> ${pick(cat.name)}`;
    details.appendChild(summary);
    const body = document.createElement("div");
    body.className = "category-body";
    details.appendChild(body);
    container.appendChild(details);

    for (const optId of cat.options) {
      await renderOption(body, optId, cat.id);
    }
  }
}

// --- Dashboard ---
function setStat(id, value, empty = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = value ?? t("dashUnknown");
  if (empty) {
    el.innerHTML = `<span class="badge is-empty">${text}</span>`;
  } else {
    el.textContent = text;
  }
}

async function refreshDashboard() {
  const spinner = document.getElementById("dashSpinner");
  if (spinner) spinner.hidden = false;
  setStat("dashPresetValue", t("dashUnknown"), true);
  setStat("dashDnsValue", t("dashUnknown"), true);
  setStat("dashCcValue", t("dashUnknown"), true);
  setStat("dashBackupValue", t("dashUnknown"), true);
  try {
    const mode = await Bridge.exec("settings get global private_dns_mode");
    const dns = await Bridge.exec("settings get global private_dns_specifier");
    const dnsLabel = mode.stdout.trim() === "off"
      ? t("dnsOffValue")
      : (dns.stdout.trim() || t("dnsNotSet"));
    setStat("dashDnsValue", dnsLabel, dnsLabel === t("dnsNotSet"));
  } catch (e) { /* mantiene dashUnknown */ }
  try {
    const cc = await Bridge.exec("sysctl -n net.ipv4.tcp_congestion_control");
    const ccValue = cc.stdout.trim();
    setStat("dashCcValue", ccValue || t("dashUnknown"), !ccValue);
  } catch (e) { /* mantiene dashUnknown */ }
  try {
    const state = await Bridge.exec(`cat ${STATE_DIR}/tcp.state 2>/dev/null || true`);
    const id = state.stdout.trim();
    const preset = tcpPresets.find((x) => x.id === id);
    if (preset) {
      setStat("dashPresetValue", pick(preset.name));
    } else if (id) {
      setStat("dashPresetValue", id);
    } else {
      setStat("dashPresetValue", t("dashPresetNone"), true);
    }
  } catch (e) {
    setStat("dashPresetValue", t("dashPresetNone"), true);
  }
  const simulated = !Bridge.isNative;
  setStat("dashModeValue",
    simulated ? t("statusBridgeSimulated") : t("statusBridgeNative"),
    simulated);
  try {
    const backup = await Bridge.exec(`test -f ${STATE_DIR}/sysctl_backup.state && echo 1 || echo 0`);
    const backedUp = backup.stdout.trim() === "1";
    setStat("dashBackupValue", backedUp ? t("dashBackupYes") : t("dashBackupNo"), !backedUp);
  } catch (e) {
    setStat("dashBackupValue", t("dashBackupNo"), true);
  }
  if (spinner) spinner.hidden = true;
}

document.getElementById("gotoTcp")?.addEventListener("click", () => showTab("tcp"));
document.getElementById("gotoDns")?.addEventListener("click", () => showTab("dns"));

// --- Rendimiento de red (detector real, FASE 2) ---
// Comunicación vía Bridge.exec (ksu.exec en shell root). No se asume ninguna
// herramienta externa: ping (toybox, siempre presente) mide latencia/jitter;
// download/upload solo se miden si `curl` existe, contra endpoints FIJOS
// definidos aquí (nunca entrada del usuario). Toda métrica que no pueda
// medirse de forma fiable se muestra como no disponible.
const NETPERF_PING_TARGET = "1.1.1.1";
const NETPERF_DOWNLOAD_URL = "https://speed.cloudflare.com/__down?bytes=10000000";
const NETPERF_UPLOAD_URL = "https://speed.cloudflare.com/__up";
const NETPERF_UPLOAD_SIZE = 3;
const NETPERF_JS_TIMEOUT_MS = 35000;

const netPerfRunBtn = document.getElementById("netPerfRun");
const netPerfRunLabel = document.getElementById("netPerfRunLabel");
const netPerfEmpty = document.getElementById("netPerfEmpty");
const netPerfTesting = document.getElementById("netPerfTesting");
const netPerfResults = document.getElementById("netPerfResults");
const netPerfDone = document.getElementById("netPerfDone");
const netPerfError = document.getElementById("netPerfError");
let netPerfState = "empty";
let netPerfLastResults = null;
let netPerfAbortTimer = null;

function netPerfFormat(value) {
  return String(Number(value).toFixed(1));
}

function netPerfRenderValues(results) {
  const set = (id, value, unitKey) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value == null ? t("networkUnavailable") : `${netPerfFormat(value)} ${t(unitKey)}`;
  };
  set("netPerfDownload", results.download, "networkMbps");
  set("netPerfUpload", results.upload, "networkMbps");
  set("netPerfPing", results.ping, "networkMs");
  set("netPerfJitter", results.jitter, "networkMs");
}

function netPerfSetState(state, opts = {}) {
  netPerfState = state;
  netPerfEmpty.hidden = state !== "empty";
  netPerfTesting.hidden = state !== "testing";
  netPerfResults.hidden = state !== "result";
  netPerfDone.hidden = state !== "result";
  netPerfError.hidden = state !== "error";
  netPerfRunBtn.disabled = state === "testing";
  if (netPerfRunLabel) {
    netPerfRunLabel.textContent = t((state === "result" || state === "error") ? "networkRetest" : "networkTestSpeed");
  }
  if (state === "error") netPerfError.textContent = opts.errorText || t("networkError");
  if (state === "result" && netPerfLastResults) netPerfRenderValues(netPerfLastResults);
}

async function netPerfExecSafe(cmd) {
  try {
    const r = await Bridge.exec(cmd);
    return r.stdout;
  } catch (e) {
    return "";
  }
}

// Parsea la salida de ping (toybox/busybox/BSD): extrae cada "time=NN.N ms".
// Devuelve { ping, jitter } o null si no hubo ninguna respuesta real.
function netPerfParsePing(stdout) {
  const times = [...String(stdout).matchAll(/time=([0-9]+(?:\.[0-9]+)?)\s*ms/g)]
    .map((m) => parseFloat(m[1]))
    .filter((n) => Number.isFinite(n) && n >= 0);
  if (!times.length) return null;
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  let jitter = 0;
  if (times.length > 1) {
    let sum = 0;
    for (let i = 1; i < times.length; i++) sum += Math.abs(times[i] - times[i - 1]);
    jitter = sum / (times.length - 1);
  }
  return { ping: avg, jitter };
}

// Parsea la salida de curl "-w '%{http_code} %{speed_*}'": exige HTTP 200 y
// devuelve Mbps (speed en bytes/s * 8 / 1e6), o null si no es fiable.
function netPerfParseCurl(stdout) {
  const parts = String(stdout).trim().split(/\s+/);
  if (parts.length < 2 || parts[0] !== "200") return null;
  const speed = parseFloat(parts[1]);
  if (!Number.isFinite(speed) || speed <= 0) return null;
  return (speed * 8) / 1e6;
}

// Detector real. Devuelve { ping, jitter, download, upload } con números o
// null (no disponible). Nunca inventa valores.
async function netPerfRunTest() {
  const pingOut = await netPerfExecSafe(
    `ping -c 5 -W 1 -i 0.2 ${NETPERF_PING_TARGET} 2>&1`
  );
  const pingData = netPerfParsePing(pingOut);

  let download = null;
  let upload = null;
  const tool = (await netPerfExecSafe(`(command -v curl || true) 2>/dev/null`)).trim();
  if (tool) {
    const dlOut = await netPerfExecSafe(
      `curl -s -L --max-time 12 -o /dev/null -w '%{http_code} %{speed_download}' '${NETPERF_DOWNLOAD_URL}' 2>/dev/null`
    );
    download = netPerfParseCurl(dlOut);

    const upOut = await netPerfExecSafe(
      `TMP=/data/local/tmp/netboost_up.$$.bin; ` +
      `dd if=/dev/zero of=$TMP bs=1M count=${NETPERF_UPLOAD_SIZE} 2>/dev/null; ` +
      `curl -s --max-time 12 -o /dev/null -w '%{http_code} %{speed_upload}' -X POST --data-binary @$TMP '${NETPERF_UPLOAD_URL}' 2>/dev/null; ` +
      `rm -f $TMP`
    );
    upload = netPerfParseCurl(upOut);
  }

  return {
    ping: pingData?.ping ?? null,
    jitter: pingData?.jitter ?? null,
    download,
    upload
  };
}

netPerfRunBtn.addEventListener("click", async () => {
  if (netPerfState === "testing") return;
  netPerfSetState("testing");
  clearTimeout(netPerfAbortTimer);
  const timedOut = new Promise((_, reject) => {
    netPerfAbortTimer = setTimeout(() => reject(new Error("timeout")), NETPERF_JS_TIMEOUT_MS);
  });
  try {
    const results = await Promise.race([netPerfRunTest(), timedOut]);
    clearTimeout(netPerfAbortTimer);
    netPerfLastResults = results;
    const anyReal = [results.ping, results.jitter, results.download, results.upload]
      .some((v) => v != null);
    netPerfSetState(anyReal ? "result" : "error");
  } catch (e) {
    clearTimeout(netPerfAbortTimer);
    netPerfSetState("error", { errorText: t("networkTimeout") });
  }
});

netPerfSetState("empty");

// --- Estado ---
function renderStatusRow(label, value) {
  const row = document.createElement("div");
  row.className = "status-row";
  row.innerHTML = `<span class="status-row-label">${escapeHtml(label)}</span><span class="status-row-value">${escapeHtml(value)}</span>`;
  return row;
}

async function refreshStatus() {
  const list = document.getElementById("statusList");
  const spinner = document.getElementById("statusSpinner");
  if (spinner) spinner.hidden = false;
  list.innerHTML = "";
  try {
    const mode = await Bridge.exec("settings get global private_dns_mode");
    const dns = await Bridge.exec("settings get global private_dns_specifier");
    const cong = await Bridge.exec("sysctl -n net.ipv4.tcp_congestion_control");
    const dnsLabel = mode.stdout.trim() === "off"
      ? t("dnsOffValue")
      : (dns.stdout.trim() || t("dnsNotSet"));
    list.appendChild(renderStatusRow(t("statusDnsLabel"), dnsLabel));
    list.appendChild(renderStatusRow(t("statusCcLabel"), cong.stdout.trim() || t("dashUnknown")));
    list.appendChild(renderStatusRow(
      t("statusBridgeLabel"),
      Bridge.isNative ? t("statusBridgeNative") : t("statusBridgeSimulated")
    ));
  } catch (e) {
    list.innerHTML = `<div class="status-error">${t("statusError")}</div>`;
  }
  if (spinner) spinner.hidden = true;
}
document.getElementById("refreshStatus").addEventListener("click", refreshStatus);

applyStaticTranslations();
showTab("dashboard");
loadDnsProfiles();
loadTcpPresets().then(() => refreshDashboard());
loadTcpCategories();
