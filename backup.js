//login
function login(){
    let akun = JSON.parse(localStorage.getItem("akun"));
if(!akun){
        akun={
            username:"admin",
            password:"123456"
        };
        localStorage.setItem("akun",JSON.stringify(akun));
    }
let username = document.getElementById("username").value;
let password = document.getElementById("password").value;
let pesan = document.getElementById("pesan");
if(username==akun.username && password==akun.password){
     pesan.textContent = "";
     window.location.href="dashboard.html";
}else{
        pesan.textContent = "Username atau Password Salah";
}
let user = document.getElementById("username");
if (user) {
    user.addEventListener("input",function () {
        document.getElementById("pesan").textContent = "";
    });
}
let pass = document.getElementById("password");
if (pass) {
    pass.addEventListener("input",function () {
        document.getElementById("pesan").textContent = "";
    });
}


}


//tombol back
function kembali(){
    window.location.href = "dashboard.html";
}
//tambah purchase total penjualan
function hitung(){
    let jual = Number(document.getElementById("jual").value) || 0;
    let qty = Number(document.getElementById("qty").value) || 0;
    let beli = Number(document.getElementById("beli").value) || 0;

    let total =jual * qty;
    let profit = (jual - beli) * qty;

    document.getElementById("total").innerHTML = "Rp" + total.toLocaleString("id-ID");
    document.getElementById("profit").innerHTML = "Rp" + profit.toLocaleString("id-ID");
}

//simpan data po
function simpanPO(){
    let pt = document.getElementById("pt").value;
    let tanggal = document.getElementById("tanggal").value;
    let nopo = document.getElementById("nopo").value;
    let barang = document.getElementById("barang").value;
    let jual = Number(document.getElementById("jual").value);
    let qty = Number(document.getElementById("qty").value);
    let beli = Number(document.getElementById("beli").value);

    let total = jual * qty;
    let profit = (jual-beli) * qty;
    let data = {
        pt,
        tanggal,
        nopo,
        barang,
        jual,
        qty,
        beli,
        total,
        profit,
    };
    let daftar = JSON.parse(localStorage.getItem("po")) || [];
    daftar.push(data);
    localStorage.setItem("po",JSON.stringify(daftar));
    alert("Data Berhasil Disimpan");
    window.location.href="datapo.html";
}
//tampilkan data 
function tampilData(){
    let list = document.getElementById("list-po");
    if(!list)return;
    let daftar = JSON.parse(localStorage.getItem("po")) || [];
    let cari = "";
    if(document.getElementById("search")){
        cari = document.getElementById("search").value.toLowerCase();
    }
    let bulan = "";
    if(document.getElementById("bulan")){
        bulan = document.getElementById("bulan").value;
    }
   
    list.innerHTML="";
    daftar.forEach(function(item,index){
        let nopo = item.nopo.toLowerCase();
        if(cari !== "" && !nopo.includes(cari)){
         return;
        }
        let bulanData="";
        if(item.tanggal.includes("-")){
            bulanData=item.tanggal.substring(5,7);
        }else{
            bulanData=item.tanggal.substring(3,5)
        }
        if(bulan!="" && bulanData!=bulan){
            return;
        }

        list.innerHTML += `
        <div class="po-card">
            <h4>${item.nopo}</h4>
            <p><b>PT :</b>${item.pt}</p>
            <p><b>Tanggal :</b>${item.tanggal}</p>
            <p><b>Barang :</b>${item.barang}</p>
            <p><b>Qty :</b>${item.qty}</p>
            <p><b>Total :</b>${item.total.toLocaleString()}</p>
            <p><b>profit :</b>${item.profit.toLocaleString()}</p>

            <div class="aksi">
                <button class="detail" onclick="detailPO(${index})">Detail</button>
                <button class="edit" onclick="editPO(${index})">Edit</button>
                <button class="hapus" onclick="hapusPO(${index})">Hapus</button>
            </div>
        </div>
        `;
    });
}
tampilData();
function cariPo(){
    tampilData();
}
 function filterBulan(){
    tampilData();
 }

function detailPO(index){
    window.location.href = "detailpo.html?id=" + index;
}
function editPO(index){
    window.location.href = "editpo.html?id=" + index;
}
function hapusPO(index){
   let daftar = JSON.parse(localStorage.getItem("po")) || [];
   if(confirm("yakin ingin menghapus data ini?")){
    daftar.splice(index,1);
    localStorage.setItem("po", JSON.stringify(daftar));
    tampilData();
   }
}
if(document.getElementById("list-po")){
    tampilData();
}
//detail
function loadDetail(){
    let id=new URLSearchParams(window.location.search).get("id");
    let daftar=JSON.parse(localStorage.getItem("po")) || [];
    let item=daftar[id];
    if(!item) return;
    document.getElementById("pt").innerHTML=item.pt;
    document.getElementById("tanggal").innerHTML=item.tanggal;
    document.getElementById("nopo").innerHTML=item.nopo;
    document.getElementById("barang").innerHTML=item.barang;
    document.getElementById("jual").innerHTML=item.jual.toLocaleString();
    document.getElementById("qty").innerHTML=item.qty;
    document.getElementById("beli").innerHTML=item.beli.toLocaleString();
    document.getElementById("total").innerHTML=item.total.toLocaleString();
    document.getElementById("profit").innerHTML=item.profit.toLocaleString();
}
if(window.location.pathname.includes("detailpo.html")){
    loadDetail();
}

//edit purchase order
let editIndex;
function loadEdit(){
    editIndex=new URLSearchParams(window.location.search).get("id");
    let daftar=JSON.parse(localStorage.getItem("po")) || [];
    let item=daftar[editIndex];
    if(!item) return;
    pt.value=item.pt;
    tanggal.value=item.tanggal;
    nopo.value=item.nopo;
    barang.value=item.barang;
    jual.value=item.jual;
    qty.value=item.qty;
    beli.value=item.beli;
}
if(window.location.pathname.includes("editpo.html")){
    loadEdit();
}

function updatePo(){
    let daftar=JSON.parse(localStorage.getItem("po")) || [];
    let total=Number(jual.value)*Number(qty.value);
    let profit=(Number(jual.value)-Number(beli.value))*Number(qty.value);
    daftar[editIndex]={
        pt:pt.value,
        tanggal:tanggal.value,
        nopo:nopo.value,
        barang:barang.value,
        jual:Number(jual.value),
        qty:Number(qty.value),
        beli:Number(beli.value),
        total:total,
        profit:profit
    };
    localStorage.setItem("po",JSON.stringify(daftar));
    alert("Data Berhasil Diupdate");
    window.location.href="datapo.html";
}

//laporan
function tampilLaporan(){
    let daftar=JSON.parse(localStorage.getItem("po")) || [];
    let list = document.getElementById("isi-laporan");
    if(!list) return;
    let bulan =document.getElementById("bulanLaporan").value;
    let tahun = document.getElementById("tahunLaporan").value;
    list.innerHTML = "";
    let jumlahPO = 0;
    let totalJual = 0;
    let totalProfit = 0;
    daftar.forEach(function(item){
        let bulanData = "";
        let tahunData = "";
        if(item.tanggal.includes("-")){
            bulanData = item.tanggal.substring(5,7);
            tahunData = item.tanggal.substring(0,4);
        }else{
            bulanData = item.tanggal.substring(3,5);
            tahunData = item.tanggal.substring(6,10);
        }
        if(bulan != "" && bulanData != bulan){
            return;
        }
        if(tahun != "" && tahunData != tahun){
            return;
        }
        jumlahPO++;
        totalJual += Number(item.total);
        totalProfit += Number(item.profit);
        list.innerHTML += `
        <tr>
            <td>${item.nopo}</td>
            <td>${item.pt}</td>
            <td>${item.tanggal}</td>
            <td>${item.barang}</td>
            <td>${item.total.toLocaleString("id-ID")}</td>
            <td>${item.profit.toLocaleString("id-ID")}</td>
        </tr>
        `;
    });
    document.getElementById("jumlah-po").innerHTML = jumlahPO;
    document.getElementById("total-jual").innerHTML = "Rp " + totalJual.toLocaleString("id-ID");
    document.getElementById("total-profit").innerHTML = "Rp" + totalProfit.toLocaleString("id-ID");
}
if(document.getElementById("isi-laporan")){
    tampilLaporan();
}

//setting
function simpanSetting(){
    let setting={
        nama:document.getElementById("namaPerusahaan").value,
        alamat:document.getElementById("alamat").value,
        telepon:document.getElementById("telepon").value,
        email:document.getElementById("email").value
    };
    localStorage.setItem("setting",JSON.stringify(setting));
    alert("Pengaturan Berhasil Disimpan");
}

//saat dibuka setting
function tampilSetting(){
    let nama = document.getElementById("namaPerusahaan");
    if (!nama) {
        return;
    }
    let setting=JSON.parse(localStorage.getItem("setting"));
    if(!setting){
        return;
    }

    nama.value = setting.nama || "";
    document.getElementById("alamat").value=setting.alamat;
    document.getElementById("telepon").value=setting.telepon;
    document.getElementById("email").value=setting.email;
}

 
if(document.getElementById("namaPerusahaan")){
    tampilSetting();
}

//backup data
function backupData(){
    let data=localStorage.getItem("po");
    if(!data){
        alert("Belum ada data");
        return;
    }
    let blob=new Blob([data],{type:"application/json"});
    let a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="backup-po.json";
    a.click();
}
//export data
function exportData(){
    let semua=JSON.stringify(localStorage,null,2);
    let blob=new Blob([semua],{type:"application/json"});
    let a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="database-po.json";
    a.click();
}

// hapus data 
function hapusSemuaData(){
    if(confirm("Yakin ingin menghapus semua data?")){
        localStorage.removeItem("po");
        alert("Semua data berhasil dihapus")
    }
}
//logout
function logout(){
    if(confirm("logout sekarang?")){
        window.location.href="index.html";
    }
}
//keamanan akun
function gantiAkun(){
    let usernameBaru = document.getElementById("usernameBaru").value;
    let passwordLama = document.getElementById("passwordLama").value;
    let passwordBaru = document.getElementById("passwordBaru").value;
    let konfirmasi = document.getElementById("konfirmasiPassword").value;
    let akun = JSON.parse(localStorage.getItem("akun"));
    if(!akun){
        akun = {
            username:"admin",
            password:"123456"
        };
    }
    if(passwordLama != akun.password){
        alert("Password lama salah");
        return;
    }
    if(passwordBaru != konfirmasi){
        alert("Konfirmasi password tidak sama");
        return;
    }
    akun.username = usernameBaru;
    akun.password = passwordBaru;
    localStorage.setItem("akun",JSON.stringify(akun));
    alert("Username dan Password berhasil diubah");
}