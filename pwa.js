(function () {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js", {scope: "./"})
      .then(reg => console.log("PWA Service Worker aktif:", reg.scope))
      .catch(err => console.error("Service Worker gagal:", err));
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(granted =>
        console.log("Persistent storage:", granted)
      ).catch(() => {});
    }
  });
})();
