// ===== Fungsi bantu modal =====
function bukaModal(id) {
  document.getElementById(id).classList.add("tampil");
}
function tutupModal(id) {
  document.getElementById(id).classList.remove("tampil");
}

// ===== Cek login (dipakai halaman yang butuh login) =====
function cekLogin() {
  const data = sessionStorage.getItem("userLogin");
  if (!data) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "index.html";
    return null;
  }
  return JSON.parse(data);
}

// ===== Pesanan baru (disimpan di sessionStorage agar terbaca di halaman lain) =====
function ambilPesananBaru() {
  try {
    return JSON.parse(sessionStorage.getItem("pesananBaru")) || [];
  } catch (err) {
    return [];
  }
}

// Cari nomor DO di data.js dulu, lalu di pesanan baru
function cariDO(nomor) {
  if (Object.prototype.hasOwnProperty.call(dataTracking, nomor)) {
    return dataTracking[nomor];
  }
  return ambilPesananBaru().find(function (p) {
    return p.nomorDO === nomor;
  });
}

// ===== Katalog buku: simpan perubahan agar terbaca di semua halaman =====
(function () {
  const tersimpan = sessionStorage.getItem("katalogBuku");
  if (tersimpan) {
    try {
      dataKatalogBuku = JSON.parse(tersimpan);   
    } catch (err) {
      // kalau rusak, tetap pakai data asli dari data.js
    }
  }
})();

function simpanKatalog() {
  sessionStorage.setItem("katalogBuku", JSON.stringify(dataKatalogBuku));
}

document.addEventListener("DOMContentLoaded", function () {

  // ===== Penutup modal (berlaku di semua halaman) =====
  document.querySelectorAll("[data-tutup]").forEach(function (tombol) {
    tombol.addEventListener("click", function () {
      tutupModal(tombol.getAttribute("data-tutup"));
    });
  });
  document.querySelectorAll(".modal").forEach(function (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) tutupModal(modal.id);
    });
  });

  // ===== Halaman Login =====
  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (email === "" || password === "") {
        alert("Email dan password wajib diisi.");
        return;
      }

      const userDitemukan = dataPengguna.find(function (u) {
        return u.email === email && u.password === password;
      });

      if (userDitemukan) {
        sessionStorage.setItem("userLogin", JSON.stringify(userDitemukan));
        window.location.href = "dashboard.html";
      } else {
        alert("Email/password yang anda masukkan salah");
      }
    });

    document.getElementById("btnLupa").addEventListener("click", function () {
      bukaModal("modalLupa");
    });
    document.getElementById("btnDaftar").addEventListener("click", function () {
      bukaModal("modalDaftar");
    });

    // Form Lupa Password
    document.getElementById("formLupa").addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("emailLupa").value.trim();
      if (email === "") {
        alert("Email wajib diisi.");
        return;
      }
      const ada = dataPengguna.some(function (u) { return u.email === email; });
      if (ada) {
        alert("Link reset password sudah dikirim ke " + email);
        tutupModal("modalLupa");
        this.reset();
      } else {
        alert("Email tidak terdaftar.");
      }
    });

    // Form Daftar
    document.getElementById("formDaftar").addEventListener("submit", function (e) {
      e.preventDefault();
      const nama = document.getElementById("namaDaftar").value.trim();
      const email = document.getElementById("emailDaftar").value.trim();
      const password = document.getElementById("passwordDaftar").value;

      if (nama === "" || email === "" || password === "") {
        alert("Semua kolom wajib diisi.");
        return;
      }
      if (!email.includes("@")) {
        alert("Format email tidak valid.");
        return;
      }
      if (password.length < 6) {
        alert("Password minimal 6 karakter.");
        return;
      }
      const sudahAda = dataPengguna.some(function (u) { return u.email === email; });
      if (sudahAda) {
        alert("Email sudah terdaftar.");
        return;
      }

      dataPengguna.push({
        id: dataPengguna.length + 1,
        nama: nama,
        email: email,
        password: password,
        role: "User"
      });
      alert("Pendaftaran berhasil! Silakan login.");
      tutupModal("modalDaftar");
      this.reset();
    });
  }

  // ===== Halaman Dashboard =====
  const greeting = document.getElementById("greeting");
  if (greeting) {
    const user = cekLogin();

    if (user) {
      const jam = new Date().getHours();
      let sapaan;
      if (jam < 11) {
        sapaan = "Selamat pagi";
      } else if (jam < 15) {
        sapaan = "Selamat siang";
      } else if (jam < 18) {
        sapaan = "Selamat sore";
      } else {
        sapaan = "Selamat malam";
      }
      greeting.textContent = sapaan + ", " + user.nama + "!";

      // ===== TAMBAHKAN KODE INI UNTUK MENAMPILKAN JAM & TANGGAL =====
      const infoWaktu = document.getElementById("infoWaktu");
      if (infoWaktu) {
        function perbaruiWaktu() {
          const sekarang = new Date();
          // Format Hari, Tanggal, Bulan, Tahun (Bahasa Indonesia)
          const opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          const tanggalStr = sekarang.toLocaleDateString('id-ID', opsiTanggal);
          // Format Jam:Menit:Detik
          const jamStr = sekarang.toLocaleTimeString('id-ID');

          infoWaktu.textContent = `${tanggalStr} — ${jamStr} WIB`;
        }
        perbaruiWaktu();
        setInterval(perbaruiWaktu, 1000); // Berjalan otomatis tiap detik
      }
      // ============================================================

      document.getElementById("btnLogout").addEventListener("click", function () {
        sessionStorage.removeItem("userLogin");
        window.location.href = "index.html";
      });

      const tbody = document.getElementById("tabelHistory");
      if (tbody) {
        Object.values(dataTracking).concat(ambilPesananBaru()).forEach(function (item) {
          const baris = document.createElement("tr");
          baris.innerHTML =
            "<td>" + item.nomorDO + "</td>" +
            "<td>" + item.nama + "</td>" +
            "<td>" + item.ekspedisi + "</td>" +
            "<td>" + item.tanggalKirim + "</td>" +
            "<td>" + item.total + "</td>" +
            "<td>" + item.status + "</td>";
          tbody.appendChild(baris);
        });
      }

      const btnHistory = document.getElementById("btnHistory");
      if (btnHistory) {
        btnHistory.addEventListener("click", function () {
          bukaModal("modalHistory");
        });
      }
    }
  }

  // ===== Halaman Stok =====
  const tabelStok = document.getElementById("tabelStok");
  if (tabelStok && cekLogin()) {
    function buatBarisStok(buku) {
      const tr = document.createElement("tr");
      const tdCover = document.createElement("td");
      
      function tampilkanTanpaCover() {
        const span = document.createElement("span");
        span.className = "tanpa-cover";
        span.textContent = "Tanpa cover";
        return span;
      }
      
      if (buku.cover) {
        const img = document.createElement("img");
        img.src = buku.cover;
        img.alt = "Cover " + buku.namaBarang;
        img.className = "cover-buku";
        img.onerror = function () { this.replaceWith(tampilkanTanpaCover()); };
        tdCover.appendChild(img);
      } else {
        tdCover.appendChild(tampilkanTanpaCover());
      }
      tr.appendChild(tdCover);

      [buku.kodeBarang, buku.namaBarang, buku.jenisBarang, buku.edisi, buku.stok, buku.harga]
        .forEach(function (isi, i) {
          const td = document.createElement("td");
          td.textContent = isi;
          if (i === 4 && buku.stok < 200) td.className = "stok-rendah";
          tr.appendChild(td);
        });

      return tr;
    }

    dataKatalogBuku.forEach(function (buku) {
      tabelStok.appendChild(buatBarisStok(buku));
    });

    const formTambah = document.getElementById("formTambah");
    if (formTambah) {
      formTambah.addEventListener("submit", function (e) {
        e.preventDefault();

        const kode = document.getElementById("kodeBarang").value.trim();
        const nama = document.getElementById("namaBarang").value.trim();
        const jenis = document.getElementById("jenisBarang").value.trim();
        const edisi = document.getElementById("edisi").value;
        const stok = document.getElementById("stok").value;
        const harga = document.getElementById("harga").value;

        if (kode === "" || nama === "" || jenis === "" || edisi === "" || stok === "" || harga === "") {
          alert("Semua kolom wajib diisi.");
          return;
        }
        if (Number(stok) < 0 || Number(harga) <= 0 || Number(edisi) < 1) {
          alert("Stok tidak boleh negatif, harga dan edisi harus lebih dari 0.");
          return;
        }
        const kodeSama = dataKatalogBuku.some(function (b) {
          return b.kodeBarang.toLowerCase() === kode.toLowerCase();
        });
        if (kodeSama) {
          alert("Kode barang sudah ada di katalog.");
          return;
        }

        const bukuBaru = {
          kodeBarang: kode,
          namaBarang: nama,
          jenisBarang: jenis,
          edisi: edisi,
          stok: Number(stok),
          harga: "Rp " + Number(harga).toLocaleString("id-ID"),
          cover: ""
        };

        dataKatalogBuku.push(bukuBaru);
        simpanKatalog();
        tabelStok.appendChild(buatBarisStok(bukuBaru));
        alert("Stok baru berhasil ditambahkan.");
        this.reset();
        document.getElementById("jenisBarang").value = "Buku Ajar";
      });
    }
  }

  // ===== Halaman Tracking =====
  const formTracking = document.getElementById("formTracking");
  if (formTracking && cekLogin()) {
    const hasil = document.getElementById("hasilTracking");
    const daftarTahap = ["Diproses", "Dikirim", "Dalam Perjalanan", "Selesai"];

    formTracking.addEventListener("submit", function (e) {
      e.preventDefault();
      const nomor = document.getElementById("nomorDO").value.trim();

      if (nomor === "") {
        alert("Nomor Delivery Order wajib diisi.");
        hasil.hidden = true;
        return;
      }

      const item = cariDO(nomor);
      if (!item) {
        alert("Nomor Delivery Order tidak ditemukan.");
        hasil.hidden = true;
        return;
      }

      document.getElementById("hNama").textContent = item.nama;
      document.getElementById("hEkspedisi").textContent = item.ekspedisi;
      document.getElementById("hTanggal").textContent = item.tanggalKirim;
      document.getElementById("hPaket").textContent = item.paket;
      document.getElementById("hTotal").textContent = item.total;

      let posisi = daftarTahap.indexOf(item.status);
      if (posisi === -1) posisi = 0;

      const catatanTerakhir = item.perjalanan[item.perjalanan.length - 1].keterangan;
      if (catatanTerakhir.startsWith("Selesai")) posisi = daftarTahap.length - 1;

      const selesai = posisi === daftarTahap.length - 1;

      const badge = document.getElementById("hStatus");
      badge.textContent = daftarTahap[posisi];
      badge.classList.toggle("status-selesai", selesai);

      const persen = ((posisi + 1) / daftarTahap.length) * 100;
      const isi = document.getElementById("progressIsi");
      isi.style.width = persen + "%";
      isi.classList.toggle("status-selesai", selesai);
      document.getElementById("progressWrap").setAttribute("aria-valuenow", persen);

      const tahapList = document.getElementById("tahapList");
      tahapList.textContent = "";
      daftarTahap.forEach(function (nama, i) {
        const li = document.createElement("li");
        li.textContent = nama;
        if (i <= posisi) li.className = "selesai";
        tahapList.appendChild(li);
      });

      const riwayatList = document.getElementById("riwayatList");
      riwayatList.textContent = "";
      item.perjalanan.slice().reverse().forEach(function (catatan) {
        const li = document.createElement("li");
        const waktu = document.createElement("span");
        waktu.className = "waktu";
        waktu.textContent = catatan.waktu;
        li.appendChild(waktu);
        li.appendChild(document.createTextNode(catatan.keterangan));
        riwayatList.appendChild(li);
      });

      hasil.hidden = false;
    });
  }

  // ===== Halaman Checkout / Pemesanan =====
  const formCheckout = document.getElementById("formCheckout");
  const userCheckout = formCheckout ? cekLogin() : null;
  if (formCheckout && userCheckout) {
    const pilihBuku = document.getElementById("pilihBuku");
    const tbodyPesanan = document.getElementById("tbodyPesanan");
    const totalBayar = document.getElementById("totalBayar");
    let keranjang = []; 

    function angkaHarga(teks) {
      return Number(String(teks).replace(/[^0-9]/g, ""));
    }
    function rupiah(angka) {
      return "Rp " + angka.toLocaleString("id-ID");
    }
    function dua(n) {
      return String(n).padStart(2, "0");
    }

    // ISI DROPDOWN BUKU DARI dataKatalogBuku (INI BAGIAN YANG MEMUNCULKAN PILIHAN BUKU)
    if (pilihBuku) {
      pilihBuku.innerHTML = '<option value="">-- Pilih buku --</option>';
      dataKatalogBuku.forEach(function (buku) {
        const opsi = document.createElement("option");
        opsi.value = buku.kodeBarang;
        opsi.textContent = buku.namaBarang + " (" + buku.harga + ")";
        pilihBuku.appendChild(opsi);
      });
    }

    // Isi otomatis nama dan email dari akun yang login
    const namaPemesan = document.getElementById("namaPemesan");
    const emailPemesan = document.getElementById("emailPemesan");
    if (namaPemesan) namaPemesan.value = userCheckout.nama;
    if (emailPemesan) emailPemesan.value = userCheckout.email;

    function renderKeranjang() {
      tbodyPesanan.textContent = "";

      if (keranjang.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 6;
        td.className = "kosong";
        td.textContent = "Belum ada buku dipilih.";
        tr.appendChild(td);
        tbodyPesanan.appendChild(tr);
      }

      let total = 0;
      keranjang.forEach(function (item, index) {
        const subtotal = item.harga * item.jumlah;
        total += subtotal;

        const tr = document.createElement("tr");

        [item.kode, item.nama, rupiah(item.harga)].forEach(function (isi) {
          const td = document.createElement("td");
          td.textContent = isi;
          tr.appendChild(td);
        });

        const tdJumlah = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.max = item.stok;
        input.value = item.jumlah;
        input.className = "input-jumlah";
        input.setAttribute("aria-label", "Jumlah " + item.nama);
        input.addEventListener("change", function () {
          const jumlahBaru = Number(input.value);
          if (!Number.isInteger(jumlahBaru) || jumlahBaru < 1) {
            alert("Jumlah minimal 1.");
          } else if (jumlahBaru > item.stok) {
            alert("Jumlah melebihi stok (tersedia " + item.stok + ").");
          } else {
            item.jumlah = jumlahBaru;
          }
          renderKeranjang();
        });
        tdJumlah.appendChild(input);
        tr.appendChild(tdJumlah);

        const tdSub = document.createElement("td");
        tdSub.textContent = rupiah(subtotal);
        tr.appendChild(tdSub);

        const tdAksi = document.createElement("td");
        const btnHapus = document.createElement("button");
        btnHapus.type = "button";
        btnHapus.className = "btn-hapus";
        btnHapus.textContent = "Hapus";
        btnHapus.addEventListener("click", function () {
          keranjang.splice(index, 1);
          renderKeranjang();
        });
        tdAksi.appendChild(btnHapus);
        tr.appendChild(tdAksi);

        tbodyPesanan.appendChild(tr);
      });

      totalBayar.textContent = rupiah(total);
    }

    renderKeranjang();

    const formItem = document.getElementById("formItem");
    if (formItem) {
      formItem.addEventListener("submit", function (e) {
        e.preventDefault();
        const kode = pilihBuku.value;
        const jumlah = Number(document.getElementById("jumlahBuku").value);

        if (kode === "") {
          alert("Pilih buku terlebih dahulu.");
          return;
        }
        if (!Number.isInteger(jumlah) || jumlah < 1) {
          alert("Jumlah minimal 1.");
          return;
        }

        const buku = dataKatalogBuku.find(function (b) { return b.kodeBarang === kode; });
        const sudahAda = keranjang.find(function (k) { return k.kode === kode; });
        const jumlahAkhir = (sudahAda ? sudahAda.jumlah : 0) + jumlah;

        if (jumlahAkhir > buku.stok) {
          alert("Jumlah melebihi stok (tersedia " + buku.stok + ").");
          return;
        }

        if (sudahAda) {
          sudahAda.jumlah = jumlahAkhir;
        } else {
          keranjang.push({
            kode: buku.kodeBarang,
            nama: buku.namaBarang,
            harga: angkaHarga(buku.harga),
            jumlah: jumlah,
            stok: buku.stok
          });
        }
        renderKeranjang();
        pilihBuku.value = "";
        document.getElementById("jumlahBuku").value = 1;
      });
    }

    formCheckout.addEventListener("submit", function (e) {
      e.preventDefault();

      const nama = document.getElementById("namaPemesan").value.trim();
      const email = document.getElementById("emailPemesan").value.trim();
      const telp = document.getElementById("telpPemesan").value.trim();
      const ekspedisi = document.getElementById("ekspedisi").value;
      const metode = document.getElementById("metodeBayar").value;
      const alamat = document.getElementById("alamat").value.trim();

      if (keranjang.length === 0) {
        alert("Pesanan masih kosong. Tambahkan buku terlebih dahulu.");
        return;
      }
      if (nama === "" || email === "" || telp === "" || alamat === "") {
        alert("Nama, email, telepon, dan alamat wajib diisi.");
        return;
      }
      if (!email.includes("@")) {
        alert("Format email tidak valid.");
        return;
      }
      if (!/^[0-9]{9,15}$/.test(telp)) {
        alert("Nomor telepon harus berupa angka (9-15 digit).");
        return;
      }
      if (alamat.length < 10) {
        alert("Alamat terlalu singkat, tulis alamat lengkap.");
        return;
      }
      if (ekspedisi === "" || metode === "") {
        alert("Pilih ekspedisi dan metode pembayaran.");
        return;
      }

      let total = 0;
      keranjang.forEach(function (k) { total += k.harga * k.jumlah; });

      let nomorDO;
      do {
        nomorDO = "2026" + Math.floor(1000 + Math.random() * 9000);
      } while (cariDO(nomorDO));

      const sekarang = new Date();
      const tanggal = sekarang.getFullYear() + "-" + dua(sekarang.getMonth() + 1) + "-" + dua(sekarang.getDate());
      const waktu = tanggal + " " + dua(sekarang.getHours()) + ":" + dua(sekarang.getMinutes()) + ":" + dua(sekarang.getSeconds());

      const pesanan = {
        nomorDO: nomorDO,
        nama: nama,
        status: "Diproses",
        ekspedisi: ekspedisi,
        tanggalKirim: tanggal,
        paket: "Reguler",
        total: rupiah(total),
        perjalanan: [
          { waktu: waktu, keterangan: "Pesanan diterima dan sedang diproses. Pembayaran: " + metode }
        ]
      };

      const daftar = ambilPesananBaru();
      daftar.push(pesanan);
      sessionStorage.setItem("pesananBaru", JSON.stringify(daftar));

      keranjang.forEach(function (k) {
        const buku = dataKatalogBuku.find(function (b) { return b.kodeBarang === k.kode; });
        if (buku) buku.stok = buku.stok - k.jumlah;
      });
      simpanKatalog();

      const modalSuksesNomor = document.getElementById("nomorDOBaru");
      if (modalSuksesNomor) modalSuksesNomor.textContent = nomorDO;
      bukaModal("modalSukses");

      keranjang = [];
      renderKeranjang();
      document.getElementById("telpPemesan").value = "";
      document.getElementById("alamat").value = "";
      document.getElementById("ekspedisi").value = "";
      document.getElementById("metodeBayar").value = "";
    });
  }

});