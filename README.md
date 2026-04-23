# Demo PWA System (DemoPOS)

Aplikasi kasir (POS) berbasis React + TypeScript + Vite dengan pendekatan offline-first menggunakan PWA dan IndexedDB (Dexie).

## Fitur Utama

- Offline-first: data produk dan transaksi tetap bisa dipakai tanpa internet
- PWA installable (`standalone`) untuk pengalaman seperti aplikasi native
- Status koneksi real-time (`LIVE ACCESS` / `LOCAL ONLY`)
- Pencarian produk lokal (client-side)
- Keranjang belanja dengan mode Retail dan Wholesale
- Checkout menyimpan transaksi ke database lokal
- Update stok otomatis saat checkout

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Dexie + dexie-react-hooks
- vite-plugin-pwa
- lucide-react

## Struktur Project

```txt
src/
  App.tsx           # UI utama kasir + logic cart/checkout
  main.tsx          # bootstrap app + seeding data awal
  db/schema.ts      # schema IndexedDB (products, sales)
  index.css         # styling global + tema
public/
  pwa-192x192.png
  pwa-512x512.png
```

## Menjalankan Project

### 1) Install dependency

```bash
npm install
```

### 2) Jalankan development server

```bash
npm run dev
```

### 3) Build production

```bash
npm run build
```

### 4) Preview build

```bash
npm run preview
```

## Konfigurasi PWA

Konfigurasi ada di `vite.config.ts` menggunakan `VitePWA`:

- `registerType: "autoUpdate"`
- Manifest app:
- `name: DemoPOS`
- `short_name: D-POS`
- `display: standalone`
- icon `192x192` dan `512x512`

## Data Model (IndexedDB)

### `products`

- `id`
- `name`
- `basePrice`
- `stockInBaseUnit`
- `unitName`
- `wholesaleUnit`
- `conversionRatio`

### `sales`

- `id`
- `items` (snapshot cart item)
- `totalPrice`
- `timestamp`
- `synced` (status sinkronisasi ke backend, saat ini `false`)

## Alur Utama

1. App startup melakukan pengecekan tabel produk.
2. Jika kosong, app melakukan seeding data awal di `main.tsx`.
3. User mencari produk dan menambah item ke cart (retail/wholesale).
4. Saat checkout, transaksi disimpan ke `sales` dan stok di `products` dikurangi sesuai `finalQty`.
5. Cart di-reset setelah transaksi berhasil.
