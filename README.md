<div align="center">
  <a href="https://github.com/meongganas/vericert">
    <img src="public/logo.webp" alt="VeriCert Logo" width="100" height="120">
  </a>

  <br />
  
  <a href="https://github.com/meongganas/vericert">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=40&pause=1000&color=38B2AC&center=true&vCenter=true&width=435&lines=VeriCert" alt="Typing SVG" />
  </a>

  <p align="center">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&pause=1000&color=38B2AC&center=true&vCenter=true&width=800&lines=Protokol+Verifikasi+Sertifikat+Terdesentralisasi+%26+Didukung+AI;Decentralized+%26+AI-Powered+Certificate+Verification+Protocol" alt="Typing SVG" />
  </p>

  <p align="center">
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    </a>
    <a href="https://supabase.com">
      <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    </a>
    <a href="https://tailwindcss.com">
      <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://deepmind.google/technologies/gemini/">
      <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat-square&logo=googlebard&logoColor=white" alt="Gemini AI" />
    </a>
  </p>

  <p align="center">
    <br />
    <a href="#-fitur-unggulan"><strong>Jelajahi Fitur</strong></a> ·
    <a href="#-demo-visual"><strong>Lihat Demo</strong></a> ·
    <a href="#-instalasi"><strong>Instalasi</strong></a>
  </p>
</div>

<br />

---

## ⚡ Ringkasan Project

**VeriCert** adalah platform modern yang dirancang untuk memecahkan masalah pemalsuan dokumen akademik maupun non akademik. Dengan menggabungkan keamanan **Blockchain** (melalui cryptographic hashing) dan kecerdasan **Google Gemini AI**, VeriCert memungkinkan institusi untuk menerbitkan sertifikat digital yang **Immutable (Tak Terubah)**, **Permanent**, dan **Fraud-Proof**.

Dibangun dengan **Next.js 16** dan **Framer Motion**, aplikasi ini menawarkan pengalaman pengguna yang fluid, responsif, dan penuh animasi interaktif.

---

## 🚀 Fitur Unggulan

### 🛡️ Core Security

- **Blockchain-Backed Ledger:** Setiap sertifikat di-hash menggunakan SHA-256 dan dicatat dalam _ledger_ terdesentralisasi (Supabase + Cryptographic chaining).
- **Tamper-Proof Verification:** Sistem secara otomatis mendeteksi jika satu piksel atau satu huruf pada file telah dimodifikasi.

### 🤖 AI Powerhouse

- **Gemini AI Extraction:** Tidak perlu input manual! Upload gambar sertifikat/ijazah, dan AI akan otomatis membaca Nama, Predikat, Tanggal, dan Institusi dengan presisi tinggi.

### 💎 User Experience

- **Glassmorphism UI:** Desain antarmuka modern dengan efek kaca (glass), neon glow, dan animasi halus.
- **Bulk Issuance:** Terbitkan ratusan sertifikat sekaligus dengan fitur _Bulk Upload_ yang cerdas.
- **Public Ledger Feed:** Transparansi total dengan feed data _live_ yang menampilkan transaksi sertifikat terbaru.

---

## 📸 Demo Visual

<div align="center">

### Landing Page

_Halaman depan futuristik dengan animasi blob dan glassmorphism._
<img src="/public/dokumentasi/landing-page.jpg" alt="Landing Page" width="90%" style="border-radius: 10px; border: 1px solid #333; margin-bottom: 20px;">

### Issuer Dashboard & AI Extraction

_Dasbor penerbit untuk upload sertifikat. Lihat bagaimana sistem menangani single & bulk upload._
<img src="/public/dokumentasi/issuer-dashboard.jpg" alt="Issuer Dashboard" width="90%" style="border-radius: 10px; border: 1px solid #333; margin-bottom: 20px;">

### Public Verification

_Halaman verifikasi publik. Siapapun dapat mengecek keaslian dokumen tanpa login._
<img src="/public/dokumentasi/public-verification.jpg" alt="Verification Page" width="90%" style="border-radius: 10px; border: 1px solid #333; margin-bottom: 20px;">

### Authentication (Login & Signup)

_Sistem autentikasi aman untuk Institusi Penerbit._

<div style="display: flex; justify-content: center; gap: 10px;">
  <img src="/public/dokumentasi/login.jpg" alt="Login Page" width="48%" style="border-radius: 10px; border: 1px solid #333;">
  <img src="/public/dokumentasi/signup.jpg" alt="Signup Page" width="48%" style="border-radius: 10px; border: 1px solid #333;">
</div>

</div>

---

<div align="center">

## 🛠️ Teknologi yang Digunakan

| Kategori            | Teknologi                                  |
| :------------------ | :----------------------------------------- |
| **Framework**       | Next.js 16 (App Router)                    |
| **Language**        | TypeScript                                 |
| **Styling**         | Tailwind CSS v4, Framer Motion (Animation) |
| **Database & Auth** | Supabase                                   |
| **AI Model**        | Google Gemini                              |
| **Security**        | Ethers.js (Hashing), SHA-256               |
| **Icons**           | Lucide React                               |

</div>

---

## 💻 Instalasi

Ikuti langkah ini untuk menjalankan VeriCert di mesin lokal Anda.

### 1. Clone Repositori

```bash
git clone https://github.com/username/vericert.git
cd vericert
```

### 2. Install Dependencies

```bash
npm install
# atau
pnpm install
# atau
yarn install
```

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di root folder dan isi dengan kredensial Supabase dan Google AI Anda:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SECRET_KEY=your_custom_secret_hashing_key
GOOGLE_API_KEY=your_gemini_api_key
```

### 4. Jalankan Database (SQL)

Jalankan query SQL berikut di SQL Editor Supabase Anda untuk membuat tabel yang diperlukan:

```sql
create table public.certificates (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  hash text not null,
  metadata jsonb not null,
  timestamp timestamp with time zone null,
  tx_hash text null,
  issuer uuid null,
  is_valid boolean null default true,
  constraint certificates_pkey primary key (id),
  constraint certificates_hash_key unique (hash)
) tablespace pg_default;
```

### 5. Jalankan Server Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

<br />

<div align="center">
  <p>© 2025 VeriCert. All rights reserved.</p>
</div>
