# STANDAR ARSITEKTUR & PENGEMBANGAN GAME EDUKASI PKBM PENERUS BANGSA
========================================================================

Dokumen ini menjadi acuan mutlak bagi seluruh pengembangan game pembelajaran interaktif PKBM Penerus Bangsa (baik sesi Google Meet 1-on-1 online maupun pembelajaran on-site di kelas).

---

## 1. INTEGRASI WAJIB: UNIVERSAL LIVE SYNC ENGINE (`pkbm_sync.js`)
Setiap kali berkas game HTML baru dibuat, **WAJIB menyertakan skrip sinkronisasi universal sebelum tag penutup `</body>`**:

* **Jika game berada di subfolder (misal `/english/`, `/bahasa/`, `/math/`, `/science/`, `/pai/`):**
  ```html
  <!-- PKBM Universal Remote Telemetry & Live Sync Engine -->
  <script src="../assets/js/pkbm_sync.js"></script>
  </body>
  ```
* **Jika game berada di root folder (misal `/bab3.html`):**
  ```html
  <!-- PKBM Universal Remote Telemetry & Live Sync Engine -->
  <script src="assets/js/pkbm_sync.js"></script>
  </body>
  ```

---

## 2. DUA KEMAMPUAN UTAMA YANG OTOMATIS AKTIF
Dengan menyertakan `pkbm_sync.js`, game langsung memiliki fitur mutakhir berikut:

1. **Remote Navigation (Kendali Pindah Layar dari HP/Laptop Guru):**
   * Guru dari halaman `dashboard.html` dapat memilih nama game dan menekan **"🚀 Luncurkan"**.
   * Layar laptop/tablet murid seketika berpindah otomatis ke game tujuan tanpa murid harus mencari tautan.
2. **Live Screen Mirroring (Murid Tidak Perlu Share Screen di Google Meet):**
   * Pilihan jawaban yang diklik murid, status benar/salah, perolehan skor, dan teks soal yang sedang dibaca langsung terkirim ke monitor guru dalam hitungan milidetik (*latency < 100ms* via Cloud WebSockets EMQX).
3. **Remote Screen Lock (Jeda Layar Siswa):**
   * Saat guru menekan **"⏸️ Kunci Layar"** di Dashboard, layar murid tertutup modal ramah yang mengarahkan murid untuk memperhatikan Google Meet.
4. **Pencatatan Nilai Otomatis ke Raport (`localStorage['pkbm_score_history']`):**
   * Nilai akhir, persentase akurasi, dan bintang prestasi otomatis tercatat dan dapat dicetak ke format raport PDF resmi PKBM Penerus Bangsa.

---

## 3. API CODE CONVENIENCE (`window.PKBM_SYNC`)
Untuk game kustom tingkat lanjut (seperti game 3D Three.js), developer dapat memanggil fungsi eksplisit berikut:

```javascript
// 1. Laporkan saat soal atau level baru dimuat
if (window.PKBM_SYNC) {
  window.PKBM_SYNC.reportQuestion("Where is the safety helmet?", currentLevel, totalLevels);
}

// 2. Laporkan saat murid memilih opsi jawaban
if (window.PKBM_SYNC) {
  window.PKBM_SYNC.reportAnswer("on the study desk", isCorrect, pointsEarned, feedbackExplanation);
}

// 3. Laporkan saat seluruh game selesai (Victory Modal)
if (window.PKBM_SYNC) {
  window.PKBM_SYNC.reportGameComplete(finalScore, maxScore, starsCount, "Menuntaskan seluruh misi");
}
```

---

## 4. TAUTAN SISTEM
* **Teacher Command Center & Raport:** `dashboard.html`
* **Portal Utama Game:** `index.html`
* **Skrip Mesin Telemetri:** `assets/js/pkbm_sync.js`
