/**
 * NetBoost - Puente con la API nativa de KernelSU/WebUI X
 *
 * IMPORTANTE: Este módulo NO usa un servidor Node.js ni un puerto local.
 * Todo se ejecuta como archivos estáticos dentro de /webroot, cargados
 * directamente por el WebView del manager (KernelSU, o Magisk/APatch a
 * través de una app compatible como "KsuWebUI"). Los comandos de shell
 * se ejecutan mediante el objeto global `ksu` que el propio manager
 * inyecta en la página — no hay ningún enlace externo ni HTTP de por medio.
 */

const Bridge = (() => {
  let callbackCounter = 0;
  const isNative = typeof window.ksu !== "undefined";

  /**
   * Ejecuta un comando de shell root y devuelve una Promise
   * con { errno, stdout, stderr }.
   */
  function exec(cmd) {
    return new Promise((resolve, reject) => {
      if (!isNative) {
        // Modo de desarrollo (navegador normal, sin manager root)
        console.warn("[NetBoost] ksu no disponible, modo simulado:", cmd);
        resolve({ errno: 0, stdout: "", stderr: "(simulado - sin root)" });
        return;
      }
      const cbName = `netboost_cb_${Date.now()}_${callbackCounter++}`;
      window[cbName] = (errno, stdout, stderr) => {
        delete window[cbName];
        if (errno === 0) resolve({ errno, stdout, stderr });
        else reject({ errno, stdout, stderr });
      };
      try {
        window.ksu.exec(cmd, "{}", cbName);
      } catch (e) {
        delete window[cbName];
        reject({ errno: -1, stdout: "", stderr: String(e) });
      }
    });
  }

  function toast(message) {
    if (isNative && typeof window.ksu.toast === "function") {
      window.ksu.toast(message);
    } else {
      console.log("[toast]", message);
    }
  }

  return { exec, toast, isNative };
})();

export default Bridge;
