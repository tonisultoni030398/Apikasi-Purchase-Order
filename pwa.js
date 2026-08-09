// ============================================================
// PWA - SERVICE WORKER & PENYIMPANAN PERSISTEN
// ============================================================

(function () {
    // Daftarkan Service Worker agar aplikasi dapat berjalan offline.
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
            navigator.serviceWorker.register("./sw.js")
                .then(function (registration) {
                    console.log("Service Worker aktif:", registration.scope);
                })
                .catch(function (error) {
                    console.error("Service Worker gagal:", error);
                });
        });
    }

    // Minta browser menggunakan persistent storage jika tersedia.
    // Ini membantu mengurangi risiko data IndexedDB dihapus otomatis
    // karena tekanan penyimpanan. Persetujuan tetap ditentukan browser.
    async function mintaPenyimpananPermanen() {
        try {
            if (!navigator.storage || !navigator.storage.persist) return;

            const sudahPermanen = await navigator.storage.persisted();
            if (!sudahPermanen) {
                const diberikan = await navigator.storage.persist();
                console.log(
                    diberikan
                        ? "Persistent storage diberikan."
                        : "Persistent storage belum diberikan oleh browser."
                );
            }
        } catch (error) {
            console.warn("Persistent storage tidak tersedia:", error);
        }
    }

    window.addEventListener("load", mintaPenyimpananPermanen);

    // Tombol install PWA.
    let deferredPrompt = null;

    window.addEventListener("beforeinstallprompt", function (event) {
        event.preventDefault();
        deferredPrompt = event;

        const tombol = document.getElementById("installApp");
        if (tombol) tombol.style.display = "block";
    });

    window.installPWA = async function () {
        if (!deferredPrompt) {
            alert("Jika tombol install belum muncul, buka menu browser lalu pilih 'Install app' atau 'Tambahkan ke layar utama'.");
            return;
        }

        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;

        const tombol = document.getElementById("installApp");
        if (tombol) tombol.style.display = "none";
    };

    window.addEventListener("appinstalled", function () {
        const tombol = document.getElementById("installApp");
        if (tombol) tombol.style.display = "none";
        console.log("PO Manager berhasil di-install.");
    });
})();
