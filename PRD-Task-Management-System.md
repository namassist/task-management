# 1. Executive Summary

## Problem Statement
Tim atau individu membutuhkan sistem manajemen tugas yang sederhana, cepat dipahami, dan dapat dipakai untuk mencatat, memperbarui, memantau, serta menyelesaikan tugas harian tanpa proses yang rumit. Dalam konteks technical test ini, dibutuhkan aplikasi full-stack yang membuktikan kemampuan implementasi CRUD end-to-end dengan React, Express.js, MySQL, dan TypeScript.

## Proposed Solution
Membangun Task Management System berbasis web dengan frontend React + TypeScript yang menggunakan Tailwind CSS, shadcn/ui, dan Zustand, serta backend Express.js + TypeScript dengan Drizzle ORM dan MySQL. Sistem mendukung CRUD tugas, dokumentasi API berbasis OpenAPI, logging backend, validasi input, proteksi keamanan minimum OWASP, dan pengujian menggunakan Jest.

## Success Criteria
- Pengguna dapat menyelesaikan alur CRUD tugas penuh dengan tingkat keberhasilan minimal 95% pada skenario uji manual utama.
- Waktu respons API untuk operasi CRUD standar berada di bawah 500 ms pada dataset kecil hingga menengah untuk lingkungan technical test. Asumsi: hingga 1.000 data tugas.
- 100% endpoint yang diwajibkan, yaitu GET, POST, PUT, DELETE, dan PATCH `/tasks`, tersedia dan lolos pengujian endpoint/API berbasis Jest.
- Validasi sisi klien mencegah submit data tidak valid untuk field wajib pada minimal 100% skenario input kosong yang diuji.
- Status tugas dapat diubah antara `Pending` dan `Completed` tanpa inkonsistensi data pada 100% skenario uji utama.
- Dokumentasi API berbasis OpenAPI tersedia dan mencakup seluruh endpoint utama yang diwajibkan.
- Backend menerapkan logging dasar serta proteksi minimum untuk rate limiting, pencegahan SQL injection, dan CSRF pada endpoint yang mengubah data.
- Fitur bonus pagination dan sorting, jika diimplementasikan, bekerja konsisten pada daftar tugas tanpa merusak perilaku CRUD utama.
- Reviewer technical test dapat menjalankan aplikasi dan test utama melalui instruksi setup yang ringkas dan konsisten di dalam repo.

# 2. User Experience & Functionality

## User Personas
### 1. Pengguna Individu
Pengguna yang ingin mencatat tugas pribadi, melihat tenggat waktu, dan menandai tugas sebagai selesai atau belum selesai.

### 2. Evaluator Technical Test
Reviewer yang menilai kualitas implementasi full-stack, struktur kode, kebenaran endpoint, kualitas validasi, dan cakupan pengujian.

### 3. Developer Full-Stack
Pengembang yang akan memakai dokumen ini sebagai acuan implementasi MVP dan dasar pengembangan lanjutan.

## User Stories
### Story 1
Sebagai pengguna, saya ingin melihat daftar tugas agar saya bisa mengetahui semua pekerjaan yang harus diselesaikan.

### Story 2
Sebagai pengguna, saya ingin menambahkan tugas baru agar saya bisa mencatat pekerjaan yang perlu dilakukan.

### Story 3
Sebagai pengguna, saya ingin mengubah data tugas agar informasi tugas tetap akurat ketika ada perubahan.

### Story 4
Sebagai pengguna, saya ingin menghapus tugas agar daftar tugas tetap relevan dan tidak penuh dengan item yang sudah tidak dibutuhkan.

### Story 5
Sebagai pengguna, saya ingin mengubah status tugas menjadi `Pending` atau `Completed` agar saya bisa memantau progres pekerjaan.

### Story 6
Sebagai evaluator technical test, saya ingin backend memiliki endpoint CRUD yang jelas dan teruji agar kualitas implementasi dapat diverifikasi secara objektif.

### Story 7
Sebagai pengguna, saya ingin mendapatkan validasi input di sisi klien agar kesalahan pengisian dapat diketahui sebelum data dikirim ke server.

### Story 8
Sebagai pengguna, saya ingin melihat daftar tugas dengan pagination atau sorting jika tersedia agar data lebih mudah ditinjau saat jumlah tugas bertambah.

## Acceptance Criteria
### Untuk Story 1, Melihat daftar tugas
- Sistem menampilkan daftar seluruh tugas yang tersimpan di database.
- Setiap item tugas minimal menampilkan `title`, `description`, `due_date`, dan `status`.
- Bila data kosong, UI menampilkan state kosong yang jelas. Asumsi: teks state kosong ditentukan saat implementasi.
- Data daftar tugas diambil dari endpoint GET `/tasks`.

### Untuk Story 2, Menambahkan tugas
- Pengguna dapat membuka form tambah tugas dari halaman utama atau area yang setara. Asumsi: pola navigasi final TBD.
- Form menerima field `title`, `description`, `due_date`, dan `status`.
- Field wajib minimal mencakup `title`, `due_date`, dan `status`.
- `description` bersifat opsional untuk MVP.
- Validasi sisi klien mencegah submit jika field wajib kosong atau format tanggal tidak valid.
- Setelah submit berhasil, data baru tersimpan di MySQL dan muncul di daftar tanpa perlu refresh penuh halaman melalui pembaruan state aplikasi yang konsisten.

### Untuk Story 3, Mengubah data tugas
- Pengguna dapat membuka mode edit untuk tugas yang sudah ada.
- Pengguna dapat memperbarui `title`, `description`, `due_date`, dan `status`.
- Sistem mengirim pembaruan ke endpoint PUT `/tasks/:id` untuk pembaruan penuh.
- Setelah pembaruan berhasil, tampilan daftar merefleksikan data terbaru.
- Jika ID tugas tidak ditemukan, backend mengembalikan error yang sesuai dan frontend menampilkan pesan error yang jelas. Asumsi: format pesan final TBD.

### Untuk Story 4, Menghapus tugas
- Pengguna dapat menghapus tugas dari daftar.
- Sistem meminta konfirmasi sebelum penghapusan. Asumsi: bentuk konfirmasi, modal atau dialog browser, TBD.
- Setelah berhasil dihapus, item hilang dari daftar dan database.
- Backend memakai endpoint DELETE `/tasks/:id`.
- Jika penghapusan gagal, pengguna menerima pesan error yang dapat dipahami.

### Untuk Story 5, Mengubah status tugas
- Pengguna dapat mengubah status tugas dari `Pending` ke `Completed`, atau sebaliknya.
- Perubahan status menggunakan endpoint PATCH `/tasks/:id` dan endpoint ini pada MVP hanya digunakan untuk mengubah field `status`.
- Status yang ditampilkan di UI selalu sinkron dengan data terbaru dari backend.
- Sistem hanya menerima nilai status yang valid, yaitu `Pending` atau `Completed`.

### Untuk Story 6, Endpoint teruji
- Tersedia endpoint GET `/tasks`, POST `/tasks`, PUT `/tasks/:id`, DELETE `/tasks/:id`, dan PATCH `/tasks/:id`.
- Setiap endpoint memiliki minimal satu pengujian endpoint/API berbasis Jest yang memverifikasi perilaku sukses.
- Endpoint utama juga memiliki pengujian untuk skenario gagal yang relevan, seperti ID tidak ditemukan atau payload tidak valid.
- Semua test backend wajib dapat dijalankan melalui perintah tunggal. Asumsi: script final di `package.json` TBD.
- Reviewer dapat menjalankan backend, frontend, dan test dengan instruksi setup yang terdokumentasi jelas di repo.

### Untuk Story 7, Validasi sisi klien
- Submit tidak boleh berjalan jika data wajib belum lengkap.
- Validasi ditampilkan dekat field atau dalam area notifikasi yang jelas. Asumsi: gaya UI final TBD.
- Pengguna dapat memperbaiki input lalu mengirim ulang tanpa reload halaman.
- Frontend tetap memvalidasi meski backend juga melakukan validasi dasar.

### Untuk Story 8, Pagination dan sorting, jika diimplementasikan
- Pengguna dapat berpindah halaman daftar tugas bila jumlah data melewati batas per halaman.
- Pengguna dapat mengurutkan tugas setidaknya berdasarkan `due_date` atau `status`. Asumsi: kriteria final TBD.
- Implementasi pagination dan sorting tidak mengubah kontrak endpoint CRUD utama.
- Jika fitur bonus tidak diimplementasikan pada MVP, tidak dianggap gagal terhadap cakupan inti.

## Non-Goals
- Autentikasi, otorisasi, dan manajemen peran.
- Notifikasi email, push notification, atau pengingat otomatis.
- Aplikasi mobile native atau hybrid.
- Kolaborasi multi-user secara real-time.
- Lampiran file, label, prioritas, komentar, atau subtugas.
- Dashboard analitik lanjutan.
- Sinkronisasi offline.
- Integrasi pihak ketiga di luar stack inti technical test.

# 3. AI System Requirements (If Applicable)

## Tool Requirements
Tidak berlaku untuk MVP ini karena sistem yang diminta adalah aplikasi CRUD konvensional tanpa komponen AI.

## Evaluation Strategy
Tidak berlaku untuk MVP ini. Jika di masa depan ditambahkan fitur AI, misalnya ringkasan tugas atau prioritisasi otomatis, kebutuhan evaluasi harus didefinisikan sebagai dokumen lanjutan.

# 4. Technical Specifications

## Architecture Overview
Sistem memakai arsitektur tiga lapis sederhana:

1. Frontend React + TypeScript dengan Tailwind CSS, shadcn/ui, dan Zustand
   - Menampilkan daftar tugas.
   - Menyediakan form tambah dan edit tugas.
   - Mengelola state aplikasi di sisi klien menggunakan Zustand.
   - Melakukan validasi input sebelum request dikirim.

2. Backend Express.js + TypeScript dengan Drizzle ORM
   - Menyediakan REST API untuk operasi CRUD.
   - Menangani validasi dasar server-side.
   - Mengelola error handling dan respons HTTP.
   - Menyediakan logging backend dan dokumentasi API OpenAPI.
   - Menerapkan proteksi keamanan minimum untuk endpoint aplikasi.
   - Menjadi penghubung antara frontend dan database.

3. Database MySQL
   - Menyimpan data pada tabel `tasks`.
   - Menjadi sumber kebenaran utama untuk seluruh data tugas.

Alur data utama:
- Pengguna berinteraksi dengan UI React.
- Frontend memanggil API Express melalui HTTP.
- Backend memproses request lalu membaca atau menulis ke MySQL.
- Backend mengembalikan respons JSON.
- Frontend memperbarui state dan merender ulang tampilan.

### Skema Data
Tabel: `tasks`

Field minimum:
- `id`: INT, AUTO_INCREMENT, PRIMARY KEY
- `title`: VARCHAR, NOT NULL
- `description`: TEXT
- `due_date`: DATE, NOT NULL
- `status`: ENUM('Pending','Completed'), NOT NULL

Keputusan MVP:
- `description` boleh kosong atau null.
- Format input dan output tanggal untuk API menggunakan `YYYY-MM-DD`.
- `due_date` di masa lalu diperbolehkan agar tugas yang sudah overdue tetap bisa dicatat dan diedit.

Asumsi:
- Panjang maksimum `title` belum ditentukan, TBD.
- Timestamp seperti `created_at` dan `updated_at` tidak termasuk scope wajib karena tidak disebutkan pada sumber.

### Kontrak API Minimum
#### GET `/tasks`
Tujuan:
- Mengambil seluruh daftar tugas.
- Dapat diperluas untuk mendukung pagination dan sorting.

Respons sukses minimum:
- HTTP 200
- Body berupa array JSON langsung dengan struktur item minimum:
  - `id`: number
  - `title`: string
  - `description`: string | null
  - `due_date`: string (`YYYY-MM-DD`)
  - `status`: `Pending` | `Completed`

Respons error minimum:
- HTTP 500 untuk error server
- Body error minimum: `{ "message": "Internal server error" }`

#### POST `/tasks`
Tujuan:
- Menambahkan tugas baru.

Payload minimum:
- `title`: string, wajib
- `description`: string, opsional
- `due_date`: string (`YYYY-MM-DD`), wajib
- `status`: `Pending` | `Completed`, wajib

Respons sukses minimum:
- HTTP 201
- Mengembalikan objek tugas yang dibuat dengan field minimum:
  - `id`
  - `title`
  - `description`
  - `due_date`
  - `status`

Respons error minimum:
- HTTP 400 untuk payload tidak valid
- Body error minimum: `{ "message": "Validation error", "errors": [...] }`
- HTTP 500 untuk error server dengan body `{ "message": "Internal server error" }`

#### PUT `/tasks/:id`
Tujuan:
- Memperbarui seluruh data tugas berdasarkan ID.

Payload minimum:
- `title`: string, wajib
- `description`: string, opsional
- `due_date`: string (`YYYY-MM-DD`), wajib
- `status`: `Pending` | `Completed`, wajib

Respons sukses minimum:
- HTTP 200
- Mengembalikan objek tugas terbaru setelah update.

Respons error minimum:
- HTTP 400 untuk payload tidak valid
- HTTP 404 jika `id` tidak ditemukan
- HTTP 500 untuk error server

#### DELETE `/tasks/:id`
Tujuan:
- Menghapus tugas berdasarkan ID.

Respons sukses minimum:
- HTTP 200
- Body sukses minimum: `{ "message": "Task deleted successfully" }`

Respons error minimum:
- HTTP 404 jika `id` tidak ditemukan
- HTTP 500 untuk error server

#### PATCH `/tasks/:id`
Tujuan:
- Memperbarui field `status` saja pada MVP.

Payload minimum:
- `status`: `Pending` | `Completed`, wajib

Respons sukses minimum:
- HTTP 200
- Mengembalikan objek tugas terbaru setelah status diperbarui.

Respons error minimum:
- HTTP 400 jika nilai `status` tidak valid
- HTTP 404 jika `id` tidak ditemukan
- HTTP 500 untuk error server

### Validasi Backend Minimum
- `title` wajib ada dan tidak boleh berupa string kosong setelah trimming.
- `due_date` wajib ada dan harus valid dalam format `YYYY-MM-DD`.
- `status` wajib bernilai `Pending` atau `Completed`.
- `id` pada parameter route harus berupa integer valid.
- `description`, jika dikirim, harus berupa teks.
- Backend wajib menolak payload di luar kontrak minimum dengan respons error yang konsisten.

### Frontend Requirements
- Framework utama: React.
- Bahasa wajib: TypeScript.
- Styling utama: Tailwind CSS.
- Component library utama: shadcn/ui.
- State management utama: Zustand.
- Layout: **Kanban-style** (mirip Trello) — tugas ditampilkan dalam kolom berdasarkan status (`Pending` dan `Completed`). Pengguna dapat memindahkan tugas antar kolom dengan mengubah status.
- Tema: **Catppuccin Frappé** — palet warna hangat dan lembut dengan background gelap (#303446), surface (#414559), overlay (#626880), text (#C6D0F5), dan accent colors (Mauve #CA9EE6, Blue #8CAAEE, Green #A6D189, Peach #EF9F76, Red #E78284, Yellow #E5C890, Teal #81C8BE). Lihat https://catppuccin.com/palette untuk referensi lengkap.
- Komponen minimum:
  - Kanban Board dengan kolom Pending dan Completed
  - Task Card (ditampilkan di dalam kolom Kanban)
  - Task Form (tambah dan edit, via dialog/modal)
  - Error or Empty State
- Validasi sisi klien minimal mencakup:
  - `title` tidak boleh kosong
  - `due_date` harus berupa tanggal valid
  - `status` harus salah satu dari `Pending` atau `Completed`
- Frontend harus menangani loading state dan error state. Asumsi: desain detail state TBD.
- UI harus cukup responsif untuk desktop dasar. Asumsi: optimasi mobile bukan fokus utama, tetapi layout Tailwind harus tetap adaptif.
- Komponen UI harus konsisten memakai shadcn/ui untuk elemen inti seperti form, button, dialog, dan feedback state bila relevan.

### Backend Requirements
- Runtime: Node.js
- Bahasa wajib: TypeScript.
- Framework: Express.js.
- ORM wajib: Drizzle ORM.
- Endpoint wajib sesuai sumber.
- API mengembalikan status HTTP yang sesuai untuk sukses, validasi gagal, dan data tidak ditemukan.
- Error handling harus konsisten dan tidak membocorkan detail internal database ke klien.
- Backend harus menyediakan logging request dan error minimal untuk kebutuhan debugging dan observability dasar.
- Backend harus menyediakan dokumentasi API dengan standar OpenAPI untuk endpoint utama.
- Struktur kode backend harus mendukung pemisahan minimal antara route, controller, service, dan data access layer berbasis Drizzle. Asumsi: pola final TBD sesuai preferensi implementasi.

### Database Requirements
- DBMS: MySQL
- Tabel utama: `tasks`
- Query harus mendukung operasi insert, select, update, delete, dan partial update melalui Drizzle ORM.
- Jika pagination bonus diimplementasikan, query harus mendukung limit dan offset.
- Jika sorting bonus diimplementasikan, query harus memakai whitelist field untuk mencegah input sorting arbitrer yang berisiko.

## Integration Points
### Frontend ke Backend
- Komunikasi via HTTP REST API.
- Format data utama: JSON.
- Base URL environment belum dikonfirmasi, TBD.
- Asumsi: frontend dan backend berjalan sebagai aplikasi terpisah selama development.
- Frontend state global untuk daftar tugas, loading, dan error dikelola dengan Zustand. State lokal komponen tetap boleh dipakai untuk kebutuhan form sementara.

### Backend ke Database
- Backend terhubung ke MySQL menggunakan Drizzle ORM.
- Koneksi database harus mendukung environment configuration.

### API Documentation
- Seluruh endpoint utama harus terdokumentasi dengan standar OpenAPI.
- Dokumentasi API harus mencakup method, path, parameter, payload, response sukses, dan response error minimum.
- Dokumentasi API harus dapat diakses reviewer selama proses evaluasi. Asumsi: endpoint path final untuk docs TBD.

### Testing
- Jest digunakan untuk pengujian endpoint/API Node.js.
- Implementasi boleh memakai `supertest` untuk pengujian HTTP endpoint.
- Prioritas test:
  - GET `/tasks` sukses
  - POST `/tasks` sukses dan validasi gagal
  - PUT `/tasks/:id` sukses dan ID tidak ditemukan
  - DELETE `/tasks/:id` sukses dan ID tidak ditemukan
  - PATCH `/tasks/:id` sukses dan status tidak valid

### Setup & Run Requirements
- Repo final harus memiliki instruksi setup singkat untuk frontend, backend, dan database.
- Repo final harus menyebut perintah untuk menjalankan frontend, backend, dan test.
- Repo final harus menyebut cara mengakses dokumentasi API OpenAPI.
- Reviewer harus dapat memahami langkah menjalankan aplikasi dalam sekali baca tanpa perlu menebak konfigurasi dasar.

## Security & Privacy
Karena scope adalah technical test MVP tanpa autentikasi, kebutuhan keamanan difokuskan pada perlindungan dasar aplikasi:

- Validasi input wajib dilakukan di frontend dan backend.
- Backend wajib menerapkan rate limiting minimum untuk endpoint publik, terutama endpoint write seperti POST, PUT, PATCH, dan DELETE.
- Query database harus aman terhadap SQL injection dengan memanfaatkan Drizzle ORM dan query terparameterisasi.
- Backend wajib menerapkan proteksi CSRF minimum untuk request yang mengubah state aplikasi. Mekanisme implementasi final boleh disesuaikan dengan arsitektur request frontend-backend, tetapi proteksi ini wajib ada.
- Backend tidak boleh mengembalikan stack trace atau detail koneksi database ke klien.
- Error message harus informatif untuk pengguna, tetapi tidak membuka detail internal sistem.
- Logging tidak boleh mencatat secret, kredensial, token, atau payload sensitif secara mentah.
- CORS configuration perlu ditetapkan sesuai kebutuhan deployment. Asumsi: aturan origin final TBD.
- Tidak ada data sensitif tingkat tinggi yang disebutkan dalam scope. Namun tetap perlu menjaga kebersihan log agar tidak menyimpan payload berlebihan secara tidak perlu.
- Sanitasi input teks perlu dipertimbangkan untuk mencegah input yang merusak tampilan. Asumsi: strategi sanitasi final TBD.

# 5. Risks & Roadmap

## Phased Rollout
### MVP
Target fase ini adalah memenuhi seluruh kebutuhan inti technical test.

Prinsip prioritas:
- Karena batas pengerjaan adalah maksimal 48 jam atau 2 hari kerja, tim harus memprioritaskan fitur inti yang diwajibkan terlebih dahulu.
- Fitur bonus hanya dikerjakan setelah alur CRUD utama, validasi, error handling, dan test endpoint stabil.

Cakupan:
- Setup frontend React + TypeScript dengan Tailwind CSS, Zustand, dan shadcn/ui
- Setup backend Express.js + TypeScript dengan Drizzle ORM
- Setup koneksi MySQL
- Implementasi tabel `tasks`
- Implementasi endpoint GET, POST, PUT, DELETE, dan PATCH `/tasks`
- Implementasi daftar tugas
- Implementasi tambah tugas
- Implementasi edit tugas
- Implementasi hapus tugas
- Implementasi ubah status `Pending` atau `Completed`
- Implementasi validasi sisi klien
- Implementasi error handling dasar
- Implementasi logging backend dasar
- Implementasi dokumentasi API OpenAPI
- Implementasi proteksi minimum OWASP: rate limiting, SQL injection prevention, dan CSRF
- Implementasi Jest unit tests untuk endpoint API

Kriteria selesai:
- Semua acceptance criteria inti terpenuhi
- Semua endpoint wajib berjalan
- Test backend utama lolos
- Aplikasi dapat dijalankan reviewer sesuai instruksi setup

### v1.1
Fase ini berisi penguatan kualitas dan fitur bonus yang masih relevan dengan technical test.

Cakupan potensial:
- Pagination daftar tugas
- Sorting daftar tugas
- Peningkatan UX pada loading, empty state, dan error state
- Refactor struktur kode agar lebih mudah diuji dan dipelihara
- Penambahan validasi backend yang lebih rinci

Kriteria selesai:
- Fitur bonus tidak memecah perilaku CRUD utama
- Respons API tetap konsisten
- Pengalaman pengguna lebih stabil saat jumlah data bertambah

### v2.0
Fase ini untuk extensibility setelah technical test selesai, bukan bagian dari scope implementasi wajib.

Rekomendasi masa depan, bukan komitmen scope:
- Filtering tugas berdasarkan status atau tanggal
- Penambahan metadata seperti `created_at` dan `updated_at`
- Pengujian frontend
- Peningkatan observability dan deployment pipeline

## Technical Risks
### 1. Inkonsistensi kontrak API
Risiko:
Frontend dan backend bisa memakai struktur payload atau respons yang berbeda.

Dampak:
Operasi CRUD gagal atau butuh penyesuaian ulang di banyak titik.

Mitigasi:
- Tetapkan kontrak request dan response sejak awal implementasi.
- Dokumentasikan status code dan field respons minimum.

### 2. Validasi hanya dilakukan di sisi klien
Risiko:
Payload tidak valid tetap bisa masuk ke backend melalui request langsung.

Dampak:
Data kotor tersimpan di database.

Mitigasi:
- Lakukan validasi minimum di backend untuk field wajib dan nilai enum status.
- Tambahkan pengujian negatif pada endpoint.

### 3. Penanganan error database tidak konsisten
Risiko:
Kegagalan query atau koneksi membuat API mengembalikan pesan yang tidak jelas.

Dampak:
Sulit di-debug dan menurunkan kualitas penilaian technical test.

Mitigasi:
- Gunakan pola error handling terpusat.
- Tetapkan format respons error yang konsisten.

### 4. Proteksi keamanan minimum tidak diterapkan dengan benar
Risiko:
Rate limiting, CSRF, atau pencegahan SQL injection diabaikan atau diterapkan sebagian.

Dampak:
Aplikasi gagal memenuhi requirement keamanan minimum dan terlihat kurang matang saat direview.

Mitigasi:
- Tetapkan security middleware sebagai bagian dari setup backend awal.
- Verifikasi bahwa query data hanya lewat Drizzle ORM atau query terparameterisasi.
- Dokumentasikan strategi CSRF yang dipakai agar implementasi konsisten.

### 5. State frontend tidak sinkron setelah operasi CRUD
Risiko:
UI tidak langsung memperlihatkan hasil tambah, edit, hapus, atau perubahan status.

Dampak:
Pengguna mengira aksi gagal padahal data sudah berubah di backend.

Mitigasi:
- Perbarui state lokal segera setelah respons sukses.
- Gunakan strategi refetch jika diperlukan pada titik tertentu.

### 6. Desain database terlalu minim untuk pengembangan lanjutan
Risiko:
MVP lolos, tetapi sulit diperluas bila kebutuhan meningkat.

Dampak:
Refactor lebih besar dibutuhkan pada fase lanjutan.

Mitigasi:
- Jaga struktur kode tetap modular.
- Tandai kebutuhan extensibility sebagai Asumsi atau TBD tanpa memperluas scope MVP.

### 7. Fitur bonus mengganggu fitur inti
Risiko:
Pagination atau sorting ditambahkan terlalu cepat lalu merusak daftar tugas dasar.

Dampak:
Kualitas MVP turun.

Mitigasi:
- Selesaikan CRUD inti terlebih dahulu.
- Tambahkan fitur bonus hanya setelah alur utama stabil dan teruji.

### 8. Keterbatasan waktu technical test
Risiko:
Deadline 48 jam atau 2 hari kerja membuat implementasi terlalu terburu-buru.

Dampak:
Testing, dokumentasi, atau penanganan edge case menjadi kurang matang.

Mitigasi:
- Prioritaskan MVP yang memenuhi source requirement secara penuh.
- Tempatkan fitur bonus sebagai prioritas setelah fungsi inti dan test selesai.

## Catatan Asumsi dan TBD
- Tidak ada autentikasi, otorisasi, dan role management dalam scope.
- Tidak ada notifikasi dan tidak ada aplikasi mobile dalam scope.
- `description` ditetapkan opsional untuk MVP.
- Format respons error minimum ditetapkan sebagai objek dengan field `message` dan dapat menyertakan `errors` untuk kasus validasi.
- DELETE ditetapkan menggunakan HTTP 200 dengan pesan sukses.
- PATCH ditetapkan khusus untuk perubahan `status` pada MVP.
- Frontend wajib menggunakan TypeScript, Tailwind CSS, Zustand, dan shadcn/ui.
- Backend wajib menggunakan Express.js, TypeScript, dan Drizzle ORM.
- Strategi implementasi logging dan path endpoint OpenAPI final masih TBD, tetapi keduanya wajib tersedia.
- Mekanisme teknis CSRF final dapat menyesuaikan arsitektur request frontend-backend, tetapi proteksinya wajib ada.
- Pola folder backend dan detail organisasi store Zustand masih TBD.
- Pagination dan sorting adalah bonus, bukan bagian dari kriteria wajib MVP.
- Deployment environment, base URL, konfigurasi CORS, dan nilai non-fungsional rinci seperti target throughput produksi masih TBD karena tidak disebutkan dalam konteks sumber.
