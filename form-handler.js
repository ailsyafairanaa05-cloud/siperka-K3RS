const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzILPforg9ogmeGQYi-GmWZgEsnrEE-qgK9G3BeXWr6kLKYFFe5hRQY5j1HBwvbk_xd4w/exec";

async function kirimData(jenis) {
  const btn = document.querySelector(".btn-submit");
  const textAwal = btn ? btn.textContent : "SIMPAN";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "MENYIMPAN...";
  }

  const payload = {
    jenisPemantauan: jenis,
    tanggal: document.getElementById("tanggal") ? document.getElementById("tanggal").value : "",
    petugas: document.getElementById("petugas") ? document.getElementById("petugas").value : "",
    unit: document.getElementById("unit") ? document.getElementById("unit").value : "",
    lokasi: document.getElementById("lokasi") ? document.getElementById("lokasi").value : "",
    risiko: document.getElementById("risiko") ? document.getElementById("risiko").value : "",
    dampak: document.getElementById("dampak") ? document.getElementById("dampak").value : "",
    pengendalian: document.getElementById("pengendalian") ? document.getElementById("pengendalian").value : "",
    hasil: document.getElementById("hasil") ? document.getElementById("hasil").value : "",
    rekomendasi: document.getElementById("rekomendasi") ? document.getElementById("rekomendasi").value : "",
    status: "Belum Ditindaklanjuti",
    fotoBefore: "-",
    fotoAfter: "-"
  };

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    alert("Berhasil! Data pemantauan " + jenis + " sudah terkirim.");
    const form = document.querySelector("form");
    if (form) form.reset();

  } catch (error) {
    console.error("Error:", error);
    alert("Gagal mengirim data. Cek koneksi.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = textAwal;
    }
  }
}