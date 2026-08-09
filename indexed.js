// ============================================================
// DATABASE INDEXEDDB
// ============================================================

const DB_NAME = "DatabasePO";
const DB_VERSION = 1;

let db;

function bukaDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function (event) {
            const database = event.target.result;

            // Data Purchase Order
            if (!database.objectStoreNames.contains("po")) {
                database.createObjectStore("po", {
                    keyPath: "id",
                    autoIncrement: true
                });
            }

            // Data akun
            if (!database.objectStoreNames.contains("akun")) {
                database.createObjectStore("akun", {
                    keyPath: "id"
                });
            }

            // Data setting
            if (!database.objectStoreNames.contains("setting")) {
                database.createObjectStore("setting", {
                    keyPath: "id"
                });
            }

            // Penanda migrasi
            if (!database.objectStoreNames.contains("meta")) {
                database.createObjectStore("meta", {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = function () {
            console.error("Gagal membuka IndexedDB:", request.error);
            reject(request.error);
        };
    });
}


// ============================================================
// HELPER INDEXEDDB
// ============================================================

function ambilSemua(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function ambilData(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function simpanData(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function tambahData(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function hapusData(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function kosongkanStore(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}


// ============================================================
// MIGRASI LOCALSTORAGE -> INDEXEDDB
// ============================================================

async function migrasiLocalStorage() {

    const sudahMigrasi = await ambilData("meta", "migrasiLocalStorage");

    if (sudahMigrasi) {
        return;
    }

    console.log("Memulai migrasi localStorage ke IndexedDB...");

    // ----------------------------------------
    // MIGRASI PO
    // ----------------------------------------

    const dataPO = localStorage.getItem("po");

    if (dataPO) {
        try {
            const daftarPO = JSON.parse(dataPO);

            if (Array.isArray(daftarPO)) {

                const poLama = await ambilSemua("po");

                if (poLama.length === 0) {

                    for (const item of daftarPO) {
                        await tambahData("po", item);
                    }

                    console.log(
                        daftarPO.length +
                        " data PO berhasil dipindahkan."
                    );
                }
            }

        } catch (error) {
            console.error("Gagal migrasi data PO:", error);
        }
    }


    // ----------------------------------------
    // MIGRASI AKUN
    // ----------------------------------------

    const dataAkun = localStorage.getItem("akun");

    if (dataAkun) {
        try {
            const akun = JSON.parse(dataAkun);

            if (akun) {
                await simpanData("akun", {
                    id: "utama",
                    username: akun.username,
                    password: akun.password
                });
            }

        } catch (error) {
            console.error("Gagal migrasi akun:", error);
        }
    }


    // ----------------------------------------
    // MIGRASI SETTING
    // ----------------------------------------

    const dataSetting = localStorage.getItem("setting");

    if (dataSetting) {
        try {
            const setting = JSON.parse(dataSetting);

            if (setting) {
                await simpanData("setting", {
                    id: "utama",
                    nama: setting.nama,
                    alamat: setting.alamat,
                    telepon: setting.telepon,
                    email: setting.email
                });
            }

        } catch (error) {
            console.error("Gagal migrasi setting:", error);
        }
    }


    // ----------------------------------------
    // TANDAI SUDAH MIGRASI
    // ----------------------------------------

    await simpanData("meta", {
        id: "migrasiLocalStorage",
        tanggal: new Date().toISOString()
    });

    console.log("Migrasi selesai.");

    // ----------------------------------------
    // HAPUS DATA LAMA
    // ----------------------------------------

    // Data localStorage tidak langsung dihapus
    // supaya lebih aman.
    //
    // Setelah memastikan IndexedDB bekerja,
    // bagian ini bisa diaktifkan:
    //
    // localStorage.removeItem("po");
    // localStorage.removeItem("akun");
    // localStorage.removeItem("setting");
}


// ============================================================
// INISIALISASI DATABASE
// ============================================================

const databaseSiap = (async function () {

    try {
        await bukaDatabase();
        await migrasiLocalStorage();

        console.log("IndexedDB siap digunakan.");

    } catch (error) {

        console.error(
            "Database gagal diinisialisasi:",
            error
        );

        alert(
            "Database gagal dibuka. Silakan refresh halaman."
        );

        throw error;
    }

})();


// ============================================================
// LOGIN
// ============================================================

async function login() {

    await databaseSiap;

    let akun = await ambilData("akun", "utama");

    if (!akun) {

        akun = {
            id: "utama",
            username: "admin",
            password: "123456"
        };

        await simpanData("akun", akun);
    }

    let username =
        document.getElementById("username").value;

    let password =
        document.getElementById("password").value;

    let pesan =
        document.getElementById("pesan");

    if (
        username == akun.username &&
        password == akun.password
    ) {

        pesan.textContent = "";

        window.location.href = "dashboard.html";

    } else {

        pesan.textContent =
            "Username atau Password Salah";
    }


    let user =
        document.getElementById("username");

    if (user) {

        user.addEventListener("input", function () {

            document.getElementById("pesan")
                .textContent = "";

        });
    }


    let pass =
        document.getElementById("password");

    if (pass) {

        pass.addEventListener("input", function () {

            document.getElementById("pesan")
                .textContent = "";

        });
    }
}


// ============================================================
// TOMBOL BACK
// ============================================================

function kembali() {

    window.location.href = "dashboard.html";
}


// ============================================================
// HITUNG PURCHASE TOTAL PENJUALAN
// ============================================================

function hitung() {

    let jual =
        Number(document.getElementById("jual").value) || 0;

    let qty =
        Number(document.getElementById("qty").value) || 0;

    let beli =
        Number(document.getElementById("beli").value) || 0;


    let total = jual * qty;

    let profit = (jual - beli) * qty;


    document.getElementById("total").innerHTML =
        "Rp" + total.toLocaleString("id-ID");

    document.getElementById("profit").innerHTML =
        "Rp" + profit.toLocaleString("id-ID");
}


// ============================================================
// SIMPAN DATA PO
// ============================================================

async function simpanPO() {

    await databaseSiap;

    let pt =
        document.getElementById("pt").value;

    let tanggal =
        document.getElementById("tanggal").value;

    let nopo =
        document.getElementById("nopo").value;

    let barang =
        document.getElementById("barang").value;

    let jual =
        Number(document.getElementById("jual").value);

    let qty =
        Number(document.getElementById("qty").value);

    let beli =
        Number(document.getElementById("beli").value);


    let total = jual * qty;

    let profit = (jual - beli) * qty;


    let data = {

        pt,
        tanggal,
        nopo,
        barang,
        jual,
        qty,
        beli,
        total,
        profit

    };


    await tambahData("po", data);


    alert("Data Berhasil Disimpan");

    window.location.href = "datapo.html";
}


// ============================================================
// TAMPILKAN DATA PO
// ============================================================

async function tampilData() {

    await databaseSiap;

    let list =
        document.getElementById("list-po");

    if (!list) return;


    let daftar =
        await ambilSemua("po");


    let cari = "";

    if (document.getElementById("search")) {

        cari =
            document
                .getElementById("search")
                .value
                .toLowerCase();
    }


    let bulan = "";

    if (document.getElementById("bulan")) {

        bulan =
            document
                .getElementById("bulan")
                .value;
    }


    list.innerHTML = "";


    daftar.forEach(function (item, index) {

        let nopo =
            String(item.nopo || "").toLowerCase();


        if (
            cari !== "" &&
            !nopo.includes(cari)
        ) {
            return;
        }


        let bulanData = "";


        if (
            item.tanggal &&
            item.tanggal.includes("-")
        ) {

            bulanData =
                item.tanggal.substring(5, 7);

        } else if (item.tanggal) {

            bulanData =
                item.tanggal.substring(3, 5);
        }


        if (
            bulan != "" &&
            bulanData != bulan
        ) {
            return;
        }


        list.innerHTML += `

        <div class="po-card">

            <h4>${item.nopo}</h4>

            <p>
                <b>PT :</b>${item.pt}
            </p>

            <p>
                <b>Tanggal :</b>${item.tanggal}
            </p>

            <p>
                <b>Barang :</b>${item.barang}
            </p>

            <p>
                <b>Qty :</b>${item.qty}
            </p>

            <p>
                <b>Total :</b>
                ${Number(item.total).toLocaleString("id-ID")}
            </p>

            <p>
                <b>profit :</b>
                ${Number(item.profit).toLocaleString("id-ID")}
            </p>


            <div class="aksi">

                <button
                    class="detail"
                    onclick="detailPO(${index})">
                    Detail
                </button>

                <button
                    class="edit"
                    onclick="editPO(${index})">
                    Edit
                </button>

                <button
                    class="hapus"
                    onclick="hapusPO(${index})">
                    Hapus
                </button>

            </div>

        </div>

        `;
    });
}


function cariPo() {

    tampilData();
}


function filterBulan() {

    tampilData();
}


// ============================================================
// DETAIL PO
// ============================================================

function detailPO(index) {

    window.location.href =
        "detailpo.html?id=" + index;
}


// ============================================================
// EDIT PO
// ============================================================

function editPO(index) {

    window.location.href =
        "editpo.html?id=" + index;
}


// ============================================================
// HAPUS PO
// ============================================================

async function hapusPO(index) {

    await databaseSiap;

    let daftar =
        await ambilSemua("po");

    let item = daftar[index];

    if (!item) return;


    if (
        confirm("yakin ingin menghapus data ini?")
    ) {

        await hapusData("po", item.id);

        await tampilData();
    }
}


// ============================================================
// LOAD DETAIL
// ============================================================

async function loadDetail() {

    await databaseSiap;

    let id =
        new URLSearchParams(
            window.location.search
        ).get("id");


    let daftar =
        await ambilSemua("po");


    let item =
        daftar[Number(id)];


    if (!item) return;


    document.getElementById("pt").innerHTML =
        item.pt;

    document.getElementById("tanggal").innerHTML =
        item.tanggal;

    document.getElementById("nopo").innerHTML =
        item.nopo;

    document.getElementById("barang").innerHTML =
        item.barang;

    document.getElementById("jual").innerHTML =
        Number(item.jual).toLocaleString();

    document.getElementById("qty").innerHTML =
        item.qty;

    document.getElementById("beli").innerHTML =
        Number(item.beli).toLocaleString();

    document.getElementById("total").innerHTML =
        Number(item.total).toLocaleString();

    document.getElementById("profit").innerHTML =
        Number(item.profit).toLocaleString();
}


if (
    window.location.pathname.includes("detailpo.html")
) {

    loadDetail();
}


// ============================================================
// EDIT PURCHASE ORDER
// ============================================================

let editIndex;


async function loadEdit() {

    await databaseSiap;

    editIndex =
        new URLSearchParams(
            window.location.search
        ).get("id");


    let daftar =
        await ambilSemua("po");


    let item =
        daftar[Number(editIndex)];


    if (!item) return;


    document.getElementById("pt").value =
        item.pt;

    document.getElementById("tanggal").value =
        item.tanggal;

    document.getElementById("nopo").value =
        item.nopo;

    document.getElementById("barang").value =
        item.barang;

    document.getElementById("jual").value =
        item.jual;

    document.getElementById("qty").value =
        item.qty;

    document.getElementById("beli").value =
        item.beli;
}


if (
    window.location.pathname.includes("editpo.html")
) {

    loadEdit();
}


// ============================================================
// UPDATE PO
// ============================================================

async function updatePo() {

    await databaseSiap;

    let daftar =
        await ambilSemua("po");


    let item =
        daftar[Number(editIndex)];


    if (!item) return;


    let jualValue =
        Number(
            document.getElementById("jual").value
        );

    let qtyValue =
        Number(
            document.getElementById("qty").value
        );

    let beliValue =
        Number(
            document.getElementById("beli").value
        );


    let total =
        jualValue * qtyValue;


    let profit =
        (jualValue - beliValue) * qtyValue;


    let dataBaru = {

        id: item.id,

        pt:
            document.getElementById("pt").value,

        tanggal:
            document.getElementById("tanggal").value,

        nopo:
            document.getElementById("nopo").value,

        barang:
            document.getElementById("barang").value,

        jual: jualValue,

        qty: qtyValue,

        beli: beliValue,

        total: total,

        profit: profit

    };


    await simpanData("po", dataBaru);


    alert("Data Berhasil Diupdate");

    window.location.href =
        "datapo.html";
}


// ============================================================
// LAPORAN
// ============================================================

async function tampilLaporan() {

    await databaseSiap;

    let daftar =
        await ambilSemua("po");


    let list =
        document.getElementById("isi-laporan");


    if (!list) return;


    let bulan =
        document
            .getElementById("bulanLaporan")
            .value;


    let tahun =
        document
            .getElementById("tahunLaporan")
            .value;


    list.innerHTML = "";


    let jumlahPO = 0;

    let totalJual = 0;

    let totalProfit = 0;


    daftar.forEach(function (item) {

        let bulanData = "";

        let tahunData = "";


        if (
            item.tanggal &&
            item.tanggal.includes("-")
        ) {

            bulanData =
                item.tanggal.substring(5, 7);

            tahunData =
                item.tanggal.substring(0, 4);

        } else if (item.tanggal) {

            bulanData =
                item.tanggal.substring(3, 5);

            tahunData =
                item.tanggal.substring(6, 10);
        }


        if (
            bulan != "" &&
            bulanData != bulan
        ) {
            return;
        }


        if (
            tahun != "" &&
            tahunData != tahun
        ) {
            return;
        }


        jumlahPO++;


        totalJual +=
            Number(item.total) || 0;


        totalProfit +=
            Number(item.profit) || 0;


        list.innerHTML += `

        <tr>

            <td>${item.nopo}</td>

            <td>${item.pt}</td>

            <td>${item.tanggal}</td>

            <td>${item.barang}</td>

            <td>${item.qty}</td>

            <td>
                ${Number(item.total)
                    .toLocaleString("id-ID")}
            </td>

            <td>
                ${Number(item.profit)
                    .toLocaleString("id-ID")}
            </td>

        </tr>

        `;
    });


    document.getElementById("jumlah-po")
        .innerHTML = jumlahPO;


    document.getElementById("total-jual")
        .innerHTML =
        "Rp " +
        totalJual.toLocaleString("id-ID");


    document.getElementById("total-profit")
        .innerHTML =
        "Rp" +
        totalProfit.toLocaleString("id-ID");
}


if (
    document.getElementById("isi-laporan")
) {

    tampilLaporan();
}


// ============================================================
// SETTING
// ============================================================

async function simpanSetting() {

    await databaseSiap;


    let setting = {

        id: "utama",

        nama:
            document
                .getElementById("namaPerusahaan")
                .value,

        alamat:
            document
                .getElementById("alamat")
                .value,

        telepon:
            document
                .getElementById("telepon")
                .value,

        email:
            document
                .getElementById("email")
                .value
    };


    await simpanData(
        "setting",
        setting
    );


    alert(
        "Pengaturan Berhasil Disimpan"
    );
}


// ============================================================
// TAMPIL SETTING
// ============================================================

async function tampilSetting() {

    await databaseSiap;


    let nama =
        document.getElementById(
            "namaPerusahaan"
        );


    if (!nama) {
        return;
    }


    let setting =
        await ambilData(
            "setting",
            "utama"
        );


    if (!setting) {
        return;
    }


    nama.value =
        setting.nama || "";


    document.getElementById("alamat").value =
        setting.alamat || "";


    document.getElementById("telepon").value =
        setting.telepon || "";


    document.getElementById("email").value =
        setting.email || "";
}


if (
    document.getElementById(
        "namaPerusahaan"
    )
) {

    tampilSetting();
}


// ============================================================
// BACKUP DATA PO
// ============================================================

async function backupData() {

    await databaseSiap;


    let daftar =
        await ambilSemua("po");


    if (
        !daftar ||
        daftar.length === 0
    ) {

        alert("Belum ada data");

        return;
    }


    let data =
        JSON.stringify(
            daftar,
            null,
            2
        );


    let blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );


    let a =
        document.createElement("a");


    a.href =
        URL.createObjectURL(blob);


    a.download =
        "backup-po.json";


    a.click();


    URL.revokeObjectURL(a.href);
}


// ============================================================
// EXPORT SEMUA DATA DATABASE
// ============================================================

async function exportData() {

    await databaseSiap;


    let po =
        await ambilSemua("po");


    let akun =
        await ambilSemua("akun");


    let setting =
        await ambilSemua("setting");


    let semua = {

        po: po,

        akun: akun,

        setting: setting

    };


    let data =
        JSON.stringify(
            semua,
            null,
            2
        );


    let blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );


    let a =
        document.createElement("a");


    a.href =
        URL.createObjectURL(blob);


    a.download =
        "database-po.json";


    a.click();


    URL.revokeObjectURL(a.href);
}


// ============================================================
// HAPUS SEMUA DATA PO
// ============================================================

async function hapusSemuaData() {

    await databaseSiap;


    if (
        confirm(
            "Yakin ingin menghapus semua data?"
        )
    ) {

        await kosongkanStore("po");

        alert(
            "Semua data berhasil dihapus"
        );
    }
}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

    if (
        confirm("logout sekarang?")
    ) {

        window.location.href =
            "index.html";
    }
}


// ============================================================
// KEAMANAN AKUN
// ============================================================

async function gantiAkun() {

    await databaseSiap;


    let usernameBaru =
        document
            .getElementById("usernameBaru")
            .value;


    let passwordLama =
        document
            .getElementById("passwordLama")
            .value;


    let passwordBaru =
        document
            .getElementById("passwordBaru")
            .value;


    let konfirmasi =
        document
            .getElementById("konfirmasiPassword")
            .value;


    let akun =
        await ambilData(
            "akun",
            "utama"
        );


    if (!akun) {

        akun = {

            id: "utama",

            username: "admin",

            password: "123456"

        };
    }


    if (
        passwordLama != akun.password
    ) {

        alert(
            "Password lama salah"
        );

        return;
    }


    if (
        passwordBaru != konfirmasi
    ) {

        alert(
            "Konfirmasi password tidak sama"
        );

        return;
    }


    akun.username =
        usernameBaru;

    akun.password =
        passwordBaru;


    await simpanData(
        "akun",
        akun
    );


    alert(
        "Username dan Password berhasil diubah"
    );
}


// ============================================================
// TAMPIL DATA PO SAAT HALAMAN DIBUKA
// ============================================================

if (
    document.getElementById("list-po")
) {

    tampilData();
}

// Compatibility wrapper for datapo.html.
// Keeps existing search/filter logic untouched.
function filterData() {
    if (typeof tampilData === 'function') {
        tampilData();
    }
}
