// ==========================================
// ⚠️ MASUKKAN URL GOOGLE APPS SCRIPT-MU DI SINI ⚠️
const scriptURL = 'Phttps://script.google.com/macros/s/AKfycbx2B522MSWc_L48JbsDqrc9bHO3xDnf8TQHn53nDC3TUoKoaFISEeb2FGJZYzDdbZSwZw/exec'; 
// Contoh: 'https://script.google.com/macros/s/AKfycby.../exec'
// ==========================================

// Database Nama Siswa 11 DKV 1
const dataSiswa = [
    "Ad Dzikra Sabda Nova", "Anindya Auryn", "Arbil Intifadha Syarif", "Aulia Ramadhani", "Aulia Syifa Noviana", 
    "Aurellia Nur Anisa", "Calista Balqis Wallyano", "Devina Marsha Anindya", "Elizabeth Marshaulina V.S", "Fauzan Alviandra Adrian",
    "Ferly Reivan Zendrato", "Galang Putra Aswar", "Gerald Manuel Salosso", "Gwen Felicia Wenzel", "Hanna Hartanti", 
    "Imam Samudra", "Intan Nuroctavia A.", "Kharista Lydia Fafo", "Kirana Maulughina A.", "M. Rizky Andrian",
    "Magi Ahmadinejad", "Maharani", "M. Alaydrus Al Fajri", "M. Haidarrasyid Ramadhan", "Nuraini Anisa Purwantari", 
    "Ratu Farastia Ghani", "Rizky Afrizal", "Roby Aldiansyah", "Shanti Novianty Sitorus", "Totti Ardeka",
    "Vianka Putrianna Rahmad", "Wira Aditya Djaganata", "Jessica Ayuningtyas Zahra", "Faehu Ravi Christian"
];
let namaLogin = "";

// FITUR PENCARIAN
function cariNama() {
    const input = document.getElementById("input-nama").value.toLowerCase().trim();
    const container = document.getElementById("tag-container");
    container.innerHTML = ""; 

    if (input.length >= 3 && input.length <= 5) {
        const hasilCari = dataSiswa.filter(siswa => siswa.toLowerCase().includes(input));
        
        hasilCari.forEach(siswa => {
            const tag = document.createElement("span");
            tag.className = "suggestion-tag";
            tag.innerText = siswa; 
            
            tag.onclick = () => {
                document.getElementById("input-nama").value = siswa;
                container.innerHTML = ""; 
            };
            container.appendChild(tag);
        });
    }
}

// 1. Logika Login
function login() {
    const input = document.getElementById("input-nama").value.toLowerCase().trim();
    const errorMsg = document.getElementById("login-error");
    const siswaValid = dataSiswa.find(s => s.toLowerCase() === input);

    if (siswaValid) {
        namaLogin = siswaValid; 
        document.getElementById("login-section").classList.remove("active");
        
        const mainSec = document.getElementById("main-section");
        mainSec.style.display = "flex";
        mainSec.style.animation = "fadeIn 0.5s ease-out forwards";

        document.getElementById("welcome-msg").innerText = "Halo, " + namaLogin;
        
        updateWaktu();
        renderAbsen(); // Akan memanggil data dari Google Sheets
    } else {
        errorMsg.innerText = "Nama tidak ditemukan di database kelas.";
        errorMsg.style.display = "block";
    }
}

function updateWaktu() {
    setInterval(() => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
        document.getElementById("current-time").innerText = now.toLocaleDateString('id-ID', options);
    }, 1000);
}

// 3. Logika Buka/Tutup Modal
function cekBatasAbsen() {
    const now = new Date();
    if ((now.getHours() > 7) || (now.getHours() === 7 && now.getMinutes() >= 15)) {
        document.getElementById("tolak-modal").classList.add("show");
    } else {
        bukaModal();
    }
}

function bukaModal() { document.getElementById("absen-modal").classList.add("show"); }
function tutupModal() { document.getElementById("absen-modal").classList.remove("show"); }
function bukaJadwal() { document.getElementById("jadwal-modal").classList.add("show"); }
function tutupJadwal() { document.getElementById("jadwal-modal").classList.remove("show"); }
function bukaTugas() { document.getElementById("tugas-modal").classList.add("show"); }
function tutupTugas() { document.getElementById("tugas-modal").classList.remove("show"); }
function tutupTolak() { document.getElementById("tolak-modal").classList.remove("show"); }

function bukaKirimNotes() {
    document.getElementById("pengirim-notes").value = namaLogin;
    document.getElementById("kirim-notes-modal").classList.add("show");
}
function tutupKirimNotes() { document.getElementById("kirim-notes-modal").classList.remove("show"); }
function bukaLihatNotes() {
    tutupKirimNotes();
    renderNotes(); // Panggil data notes dari Sheets
    document.getElementById("lihat-notes-modal").classList.add("show");
}
function tutupLihatNotes() { document.getElementById("lihat-notes-modal").classList.remove("show"); }

function cekStatus() {
    const status = document.getElementById("status").value;
    const izinFields = document.getElementById("izin-fields");
    if (status === "Izin/Sakit") {
        izinFields.style.display = "block";
    } else {
        izinFields.style.display = "none";
    }
}

// ==========================================
// FITUR BARU: TERHUBUNG KE GOOGLE SHEETS
// ==========================================

// 4. MENGIRIM DATA ABSEN KE GOOGLE SHEETS
function submitAbsen() {
    const status = document.getElementById("status").value;
    const alasan = document.getElementById("alasan").value;
    const btnSubmit = document.querySelector("#absen-modal .btn-submit");
    
    const now = new Date();
    const waktuFormat = `${now.getHours()}:${now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes()}`;
    const tanggalFormat = now.toDateString();

    // Animasi tombol Loading
    btnSubmit.innerText = "Mengirim...";
    btnSubmit.disabled = true;

    // Siapkan data untuk dikirim
    let formData = new FormData();
    formData.append('sheetName', 'Absensi');
    formData.append('tanggal', tanggalFormat);
    formData.append('waktu', waktuFormat);
    formData.append('nama', namaLogin);
    formData.append('status', status);
    formData.append('alasan', status === "Izin/Sakit" ? alasan : "-");

    // Kirim menggunakan fetch
    fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
        .then(() => {
            alert("Absen berhasil dikirim ke Server Kelas!");
            btnSubmit.innerText = "Submit";
            btnSubmit.disabled = false;
            tutupModal();
            renderAbsen(); // Refresh daftar absen
        })
        .catch(error => {
            alert("Terjadi kesalahan jaringan.");
            btnSubmit.innerText = "Submit";
            btnSubmit.disabled = false;
        });
}

// 5. MENGAMBIL DATA ABSEN DARI GOOGLE SHEETS
async function renderAbsen() {
    const list = document.getElementById("attendance-list");
    list.innerHTML = "<li style='text-align:center; color:#0056d2;'>Memuat data absen... ⏳</li>"; // Efek Loading
    
    try {
        const response = await fetch(scriptURL + '?sheetName=Absensi');
        const dataAbsenSemua = await response.json();
        const now = new Date();
        const today = now.toDateString();
        
        // Filter hanya absen hari ini
        const dataAbsenHariIni = dataAbsenSemua.filter(a => a.tanggal === today);
        const isLewatBatas = (now.getHours() > 7) || (now.getHours() === 7 && now.getMinutes() >= 15);

        list.innerHTML = ""; // Bersihkan loading

        dataSiswa.forEach(siswa => {
            const absenSiswa = dataAbsenHariIni.find(a => a.nama === siswa);
            let li = document.createElement("li");
            
            if (absenSiswa) {
                let statusClass = absenSiswa.status === "Hadir" ? "status-hadir" : "status-izin";
                let detailIzin = absenSiswa.status === "Izin/Sakit" ? `<br><small>Alasan: ${absenSiswa.alasan}</small>` : "";
                li.innerHTML = `<span>${siswa}</span> <span style="text-align: right;"><span class="${statusClass}">${absenSiswa.status}</span><br><small>${absenSiswa.waktu}</small>${detailIzin}</span>`;
            } else if (isLewatBatas) {
                li.innerHTML = `<span>${siswa}</span> <span class="status-alpha">Alpha</span>`;
            } else {
                li.innerHTML = `<span>${siswa}</span> <span>Belum Absen</span>`;
            }
            list.appendChild(li);
        });
    } catch (error) {
        list.innerHTML = "<li style='color:red;'>Gagal memuat data dari server. Pastikan URL sudah benar.</li>";
    }
}

// 6. MENGIRIM NOTES KE GOOGLE SHEETS
function submitNotes() {
    const isi = document.getElementById("isi-notes").value.trim();
    if (isi === "") { alert("Pesan tidak boleh kosong!"); return; }

    const btnSubmit = document.querySelector("#kirim-notes-modal .btn-submit");
    const now = new Date();
    const waktuFormat = `${now.getDate()}/${now.getMonth()+1} - ${now.getHours()}:${now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes()}`;
    
    btnSubmit.innerText = "Mengirim...";
    btnSubmit.disabled = true;

    let formData = new FormData();
    formData.append('sheetName', 'Notes');
    formData.append('waktu', waktuFormat);
    formData.append('nama', namaLogin);
    formData.append('pesan', isi);

    fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
        .then(() => {
            btnSubmit.innerText = "Send";
            btnSubmit.disabled = false;
            document.getElementById("isi-notes").value = ""; 
            bukaLihatNotes(); 
        })
        .catch(error => alert("Gagal mengirim pesan."));
}

// 7. MENGAMBIL NOTES DARI GOOGLE SHEETS
async function renderNotes() {
    const list = document.getElementById("list-notes");
    list.innerHTML = "<li style='text-align:center; color:#0056d2;'>Memuat pesan dari server... ⏳</li>";
    
    try {
        const response = await fetch(scriptURL + '?sheetName=Notes');
        const dataNotes = await response.json();
        
        list.innerHTML = "";
        
        if (dataNotes.length === 0) {
            list.innerHTML = "<li style='text-align:center; color:#999;'>Belum ada pesan.</li>";
            return;
        }

        dataNotes.forEach(note => {
            let li = document.createElement("li");
            li.style.borderBottom = "1px solid #eee";
            li.style.padding = "10px 0";
            li.innerHTML = `
                <div style="font-weight: bold; color: #0056d2; font-size: 14px;">${note.nama} <span style="color: #999; font-size: 11px; font-weight: normal; float: right;">${note.waktu}</span></div>
                <div style="margin-top: 5px; font-size: 14px; color: #333; line-height: 1.4;">${note.pesan}</div>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        list.innerHTML = "<li style='color:red;'>Gagal memuat pesan.</li>";
    }
}