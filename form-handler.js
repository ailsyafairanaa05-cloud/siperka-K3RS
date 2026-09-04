const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzILPforg9ogmeGQYi-GmWZgEsnrEE-qgK9G3BeXWr6kLKYFFe5hRQY5j1HBwvbk_xd4w/exec";

// Inisialisasi listener preview dan tanggal default
document.addEventListener("DOMContentLoaded", () => {
  const tanggalInput = document.getElementById("tanggal");
  if (tanggalInput && !tanggalInput.value) {
    tanggalInput.value = new Date().toISOString().split("T")[0];
  }

  const fotoBefore = document.getElementById("fotoBefore");
  if (fotoBefore) {
    fotoBefore.addEventListener("change", function () {
      handlePreview(this, "previewBefore");
    });
  }

  const fotoAfter = document.getElementById("fotoAfter");
  if (fotoAfter) {
    fotoAfter.addEventListener("change", function () {
      handlePreview(this, "previewAfter");
    });
  }
});

function handlePreview(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (!file.type.startsWith("image/")) {
      alert("Berkas yang dipilih harus berupa gambar.");
      input.value = "";
      preview.style.display = "none";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none";
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => reject(new Error("Gagal memproses gambar."));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Gagal membaca berkas gambar."));
    reader.readAsDataURL(file);
  });
}

function showStatus(message, type) {
  const box = document.getElementById("statusMessage");
  if (!box) return;
  box.textContent = message;
  box.className = `status-message status-${type}`;
  box.style.display = "block";
}

async function kirimData(jenis) {
  const btn = document.querySelector(".btn-submit");
  const textAwal = btn ? btn.textContent : "SIMPAN PEMANTAUAN";

  const tanggal = document.getElementById("tanggal").value.trim();
  const petugas = document.getElementById("petugas").value.trim();
  const unit = document.getElementById("unit").value.trim();
  const lokasi = document.getElementById("lokasi").value.trim();
  const risiko = document.getElementById("risiko").value.trim();
  const dampak = document.getElementById("dampak").value.trim();
  const pengendalian = document.getElementById("pengendalian").value.trim();
  const hasil = document.getElementById("hasil").value.trim();
  const rekomendasi = document.getElementById("rekomendasi").value.trim();
  const statusCheck = document.getElementById("statusCheck");

  // Validasi kolom teks
  if (!tanggal || !petugas || !unit || !lokasi || !risiko || !dampak || !pengendalian || !hasil || !rekomendasi) {
    showStatus("Mohon lengkapi seluruh formulir yang bertanda bintang (*).", "error");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "MEMPROSES...";
  }
  showStatus("Sedang mengirim data ke server. Mohon tunggu...", "loading");

  try {
    const fileBefore = document.getElementById("fotoBefore")?.files[0] || null;
    const fileAfter = document.getElementById("fotoAfter")?.files[0] || null;

    const fotoBeforeBase64 = await compressImage(fileBefore);
    const fotoAfterBase64 = await compressImage(fileAfter);

    const payload = {
      jenisPemantauan: jenis,
      tanggal: tanggal,
      petugas: petugas,
      unit: unit,
      lokasi: lokasi,
      risiko: risiko,
      dampak: dampak,
      pengendalian: pengendalian,
      hasil: hasil,
      rekomendasi: rekomendasi,
      status: statusCheck?.checked ? "Sudah Ditindaklanjuti" : "Belum Ditindaklanjuti",
      fotoBefore: fotoBeforeBase64,
      fotoAfter: fotoAfterBase64
    };

    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    showStatus("Data pemantauan berhasil disimpan ke database.", "success");
    alert("Berhasil! Data pemantauan telah tersimpan.");

    const form = document.querySelector("form");
    if (form) form.reset();

    const pBefore = document.getElementById("previewBefore");
    const pAfter = document.getElementById("previewAfter");
    if (pBefore) pBefore.style.display = "none";
    if (pAfter) pAfter.style.display = "none";

    document.getElementById("tanggal").value = new Date().toISOString().split("T")[0];

  } catch (error) {
    console.error("Error submit:", error);
    showStatus("Gagal mengirim data. Periksa koneksi internet Anda.", "error");
    alert("Gagal mengirim data. Silakan coba lagi.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = textAwal;
    }
  }
}