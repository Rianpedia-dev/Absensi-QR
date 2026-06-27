const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ImageRun,
    PageBreak,
    Tab,
    ShadingType
} = require("docx");
const fs = require("fs");
const path = require("path");

// Konfigurasi spasi paragraf standar (1.5 spasi = 360 TWIPs, jarak sesudah paragraf = 120 TWIPs)
const paragraphSpacing = { before: 0, after: 120, line: 360 };

// Daftar istilah asing (Bahasa Inggris) yang harus dicetak miring (italics)
const englishTerms = [
    "invalid credentials", "internal server error", "black-box testing",
    "single codebase", "better-auth/next-js", "drizzle.config.ts",
    "Tailwind CSS", "Better Auth", "Drizzle ORM", "App Router", "Next.js App Router", "Next.js",
    "NextResponse", "PostgreSQL", "Drizzle Kit", "Drizzle-Kit", "BetterAuth", "DrizzleORM",
    "access_token_expires_at", "refresh_token_expires_at",
    "accessTokenExpiresAt", "refreshTokenExpiresAt",
    "email_verified", "password_hash", "passwordHash", "emailVerified",
    "created_at", "updated_at", "createdAt", "updatedAt",
    "ip_address", "user_agent", "ipAddress", "userAgent",
    "account_id", "provider_id", "access_token", "refresh_token",
    "accountId", "providerId", "accessToken", "refreshToken",
    "id_token", "idToken", "ban_reason", "banReason",
    "expires_at", "expiresAt", "user_id", "userId",
    "check-in", "check-out", "checkin", "checkout", "check_in", "check_out",
    "timestamp", "salt", "real-time", "realtime", "monolithic", "cookie",
    "webapp", "web-app", "scanning", "scan", "scanner", "endpoint", "payload",
    "route", "session", "black-box", "database", "user", "admin", "employee",
    "role", "UUID", "Excel", "xlsx", "Spreadsheet", "auth", "server", "client",
    "frontend", "backend", "development", "testing", "timer", "polling", "refresh",
    "credentials", "expired", "unauthorized", "drizzle-orm", "better-auth", "drizzle", "orm",
    "primary key", "foreign key", "primary-key", "foreign-key", "Unique", "unique", "credentials", "credential",
    "Mobile-First", "Desktop-First", "Mobile First", "Desktop First", "Login", "login", "Logout", "logout",
    "Dashboard", "dashboard", "Consolas", "dotenv", "config", "schema", "kit", "dialect", "pgTable", "references",
    "better-auth/adapters/drizzle", "nextCookies", "adminRoles", "trustedOrigins", "emailAndPassword",
    "additionalFields"
];

// Buat regex pencarian otomatis istilah asing (case-insensitive, diurutkan dari yang terpanjang)
const sortedTerms = englishTerms
    .sort((a, b) => b.length - a.length)
    .map(term => term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s+'));
const regex = new RegExp('\\b(' + sortedTerms.join('|') + ')\\b', 'gi');

// Fungsi bantu untuk membagi teks dan memberikan format cetak miring (italics) pada kata asing
function formatTextToRuns(text, baseConfig = {}) {
    if (typeof text !== "string") return [];
    
    const parts = text.split(regex);
    const runs = [];
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;
        
        const isEnglish = (i % 2 === 1);
        
        runs.push(new TextRun({
            text: part,
            font: baseConfig.font || "Times New Roman",
            size: baseConfig.size || 24,
            bold: baseConfig.bold || false,
            italics: isEnglish ? true : (baseConfig.italics || false),
            color: baseConfig.color || undefined
        }));
    }
    
    return runs;
}

// Fungsi bantu untuk membuat paragraf normal skripsi
function createNormalParagraph(textRuns, options = {}) {
    let children = [];
    if (typeof textRuns === "string") {
        children = formatTextToRuns(textRuns);
    } else {
        children = [];
        for (const run of textRuns) {
            if (typeof run === "string") {
                children.push(...formatTextToRuns(run));
            } else if (run.text) {
                children.push(...formatTextToRuns(run.text, run));
            } else {
                children.push(new TextRun({
                    font: "Times New Roman",
                    size: 24,
                    ...run
                }));
            }
        }
    }

    return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: paragraphSpacing,
        indent: { firstLine: 720 }, // Indentasi baris pertama 0.5 inci (720 TWIPs)
        children: children,
        ...options
    });
}

// Fungsi bantu untuk membuat item daftar (list/bullet)
function createListItem(bulletText, textRuns, options = {}) {
    let children = [
        new TextRun({ text: bulletText, bold: true, font: "Times New Roman", size: 24 }),
        new Tab()
    ];
    if (typeof textRuns === "string") {
        children.push(...formatTextToRuns(textRuns));
    } else {
        for (const run of textRuns) {
            if (typeof run === "string") {
                children.push(...formatTextToRuns(run));
            } else if (run.text) {
                children.push(...formatTextToRuns(run.text, run));
            } else {
                children.push(new TextRun({
                    font: "Times New Roman",
                    size: 24,
                    ...run
                }));
            }
        }
    }
    return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: paragraphSpacing,
        indent: { start: 720, hanging: 360 },
        children: children,
        ...options
    });
}

// Fungsi bantu untuk Heading 2 (Sub-bab)
function createHeading2(text, options = {}) {
    return new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120, line: 360 },
        keepWithNext: true,
        children: formatTextToRuns(text, { bold: true }),
        ...options
    });
}

// Fungsi bantu untuk Heading 3 (Anak Sub-bab)
function createHeading3(text) {
    return new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 180, after: 90, line: 360 },
        keepWithNext: true,
        children: formatTextToRuns(text, { bold: true })
    });
}

// Fungsi bantu untuk menyisipkan judul gambar
function createFigureTitle(numberStr, label) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120, line: 240 },
        keepWithNext: true,
        children: formatTextToRuns(`Gambar ${numberStr} - ${label}`, { bold: true, size: 22 })
    });
}

// Fungsi bantu untuk memeriksa dan menyisipkan Gambar UI / Diagram
function createFigurePlaceholder(imageFileName, label, numberStr) {
    // Cari di folder image-halaman-halaman-web-app terlebih dahulu, lalu di public/images
    let imgPath = path.join(__dirname, "image-halaman-halaman-web-app", imageFileName);
    if (!fs.existsSync(imgPath)) {
        imgPath = path.join(__dirname, "public", "images", imageFileName);
    }
    const paragraphs = [];

    if (fs.existsSync(imgPath)) {
        try {
            const isMobile = !imageFileName.includes("admin");
            const width = isMobile ? 180 : 450;
            const height = isMobile ? 360 : 250;

            paragraphs.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 60 },
                children: [
                    new ImageRun({
                        data: fs.readFileSync(imgPath),
                        transformation: {
                            width: width,
                            height: height
                        }
                    })
                ]
            }));
        } catch (e) {
            console.error(`Gagal menyisipkan gambar ${imageFileName}:`, e);
        }
    }

    if (paragraphs.length === 0) {
        // Fallback jika file tidak ada
        paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
                new TextRun({
                    text: `[TEMPATKAN GAMBAR: ${label}]`,
                    bold: true,
                    color: "FF0000",
                    font: "Times New Roman",
                    size: 24
                }),
                new TextRun({
                    text: `(Taruh file gambar di image-halaman-halaman-web-app/${imageFileName})`,
                    bold: true,
                    color: "FF0000",
                    font: "Times New Roman",
                    size: 20,
                    break: 1
                })
            ]
        }));
    }

    // Tambahkan judul gambar di bawah gambar
    paragraphs.push(createFigureTitle(numberStr, label));
    return paragraphs;
}

// Fungsi bantu untuk membuat blok kode (Code Block)
function createCodeBlock(codeText) {
    // Menghilangkan carriage return (\r) untuk mencegah kerusakan XML OpenXML
    const cleanCode = codeText.replace(/\r/g, "");
    const lines = cleanCode.split('\n');
    const paragraphs = lines.map(line => new Paragraph({
        spacing: { before: 0, after: 0, line: 240 },
        children: [
            new TextRun({
                text: line,
                font: "Consolas",
                size: 18,
                color: "1F2937"
            })
        ]
    }));

    return new Table({
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: paragraphs
                    })
                ]
            })
        ]
    });
}

// Fungsi bantu untuk membuat tabel database / tabel pengujian
function createTableHeader(columns) {
    return new TableRow({
        children: columns.map(col => new TableCell({
            children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
                children: formatTextToRuns(col.text, { bold: true, size: 22 })
            })]
        }))
    });
}

function createTableRowData(data) {
    return new TableRow({
        children: data.map((val, idx) => new TableCell({
            children: [new Paragraph({
                alignment: idx === 0 || idx === 1 ? AlignmentType.LEFT : AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
                children: formatTextToRuns(val, { size: 22 })
            })]
        }))
    });
}

function createTable(columns, rowData) {
    const rows = [createTableHeader(columns)];
    for (const data of rowData) {
        rows.push(createTableRowData(data));
    }
    return new Table({
        rows: rows
    });
}

// ==========================================
// KONTEN SKRIPSI BAB IV
// ==========================================

const childrenContent = [];

// --- JUDUL BAB ---
childrenContent.push(
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0, line: 360 },
        children: [
            new TextRun({
                text: "BAB IV",
                bold: true,
                font: "Times New Roman",
                size: 28,
            })
        ]
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 360, line: 360 },
        children: [
            new TextRun({
                text: "PERANCANGAN DAN PEMBANGUNAN SISTEM",
                bold: true,
                font: "Times New Roman",
                size: 28,
            })
        ]
    }),
    new Paragraph({ spacing: { before: 0, after: 240 } }) // Jarak setelah judul bab
);

// --- PENGANTAR BAB IV ---
childrenContent.push(
    createNormalParagraph(
        "Bab ini memaparkan seluruh rangkaian kegiatan perancangan dan pembangunan sistem absensi berbasis kode QR dinamis pada proyek Rianpedia. Tahapan ini dimulai dari perancangan arsitektur sistem, skema basis data, dan antarmuka pengguna (UI), kemudian dilanjutkan dengan tahap pembangunan (implementasi) kode sumber dari setiap modul sistem, hingga diakhiri dengan tahap pengujian sistem menggunakan metode Black-box Testing untuk memverifikasi fungsionalitas seluruh fitur yang telah dibangun."
    )
);

// --- 4.1 PERANCANGAN SISTEM ---
childrenContent.push(createHeading2("4.1 Perancangan Sistem"));
childrenContent.push(
    createNormalParagraph(
        "Perancangan sistem bertindak sebagai acuan teknis dalam proses pembangunan perangkat lunak agar sistem dapat berjalan secara terstruktur, efisien, dan memiliki skalabilitas yang baik. Perancangan ini mencakup aspek arsitektur, struktur basis data, serta tata letak antarmuka pengguna."
    )
);

// --- 4.1.1 Arsitektur Sistem ---
childrenContent.push(createHeading3("4.1.1 Arsitektur Sistem"));
childrenContent.push(
    createNormalParagraph(
        "Pembangunan sistem absensi berbasis kode QR dinamis pada proyek Rianpedia ini mengadopsi arsitektur Monolitik Modern berbasis Next.js App Router. Pola arsitektur ini menggabungkan modul Frontend (antarmuka pengguna) dan Backend (logika server serta API) ke dalam satu kesatuan kode program (single codebase). Hal ini meminimalkan biaya infrastruktur serta kompleksitas jaringan yang umumnya terjadi pada arsitektur terdistribusi."
    ),
    createNormalParagraph(
        "Dalam implementasinya, interaksi antar komponen sistem dijabarkan ke dalam diagram alur (sequence diagram) sebagai berikut:"
    ),
    // Penjelasan Sequence Diagram dalam teks terstruktur akademis
    createListItem("1.", "Sisi Admin (Layar Utama Kantor): Admin melakukan otentikasi masuk ke sistem dan mengakses halaman generator QR. Server Next.js secara dinamis membuat token terenkripsi unik berdasarkan timestamp waktu server saat itu dan salt acak (misal: 1718167890000-xyz123)."),
    createListItem("2.", "Pembaruan QR Dinamis: Token QR dirender menjadi kode batang dua dimensi (QR Code) di layar admin. Token ini dikonfigurasi untuk kadaluwarsa dalam waktu 30 detik. Setelah 30 detik, sistem di sisi klien (admin) akan secara otomatis memicu fungsi generasi token baru ke server untuk menghindari penggunaan foto QR statis oleh karyawan di luar kantor."),
    createListItem("3.", "Pemindaian Karyawan: Karyawan yang telah tiba di lokasi absensi masuk ke aplikasi lewat HP mereka, mengaktifkan kamera pemindai (scanner) berbasis browser web, lalu memindai kode QR dinamis pada layar Admin."),
    createListItem("4.", "Validasi dan Pencatatan Server: Data token hasil pindaian beserta ID sesi otentikasi karyawan dikirimkan ke endpoint API server `/api/attendance/scan` lewat metode POST. Server menerima payload, mengekstrak timestamp asli dari token, dan menghitung selisihnya terhadap waktu server saat ini. Toleransi keterlambatan jaringan ditetapkan sebesar 5 detik (total validitas 35 detik)."),
    createListItem("5.", "Pencatatan Kehadiran: Jika token dinyatakan valid dan karyawan belum tercatat absen pada hari tersebut, server melakukan Check-in. Jika karyawan memindai kode QR untuk kedua kalinya di hari yang sama, server memperbarui status absensi tersebut menjadi Check-out. Data tersebut secara real-time tersimpan pada basis data PostgreSQL.")
);

// --- 4.1.2 Perancangan Use Case Diagram ---
childrenContent.push(createHeading3("4.1.2 Perancangan Use Case Diagram"));
childrenContent.push(
    createNormalParagraph(
        "Use Case Diagram menggambarkan fungsionalitas sistem yang diharapkan dari sudut pandang interaksi antara pengguna (aktor) dengan sistem absensi. Dalam sistem absensi berbasis QR Code dinamis ini, terdapat 2 (dua) aktor utama, yaitu:"
    ),
    createListItem("1.", "Admin (Administrator): Merupakan pengguna yang memiliki hak akses penuh untuk mengelola data master karyawan, memantau kehadiran harian, menampilkan layar generator kode QR absensi di kantor, serta mengunduh laporan bulanan."),
    createListItem("2.", "Karyawan (Employee): Merupakan pengguna yang memiliki hak akses untuk memindai kode QR absensi menggunakan kamera perangkat mobile (smartphone) untuk melakukan pencatatan check-in/check-out, serta melihat riwayat kehadiran pribadi."),
    createNormalParagraph(
        "Deskripsi hubungan kasus penggunaan (use case) beserta aktor yang terlibat dirincikan dalam Tabel 4.1 berikut:"
    ),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        keepWithNext: true,
        children: formatTextToRuns("Tabel 4.1 Daftar Kasus Penggunaan (Use Case) Sistem", { bold: true, size: 22 })
    }),
    createTable(
        [
            { text: "No", width: 600 },
            { text: "Use Case Utama", width: 2000 },
            { text: "Aktor Terkait", width: 1500 },
            { text: "Deskripsi Singkat Fungsionalitas", width: 3400 }
        ],
        [
            ["1", "Login Akun", "Admin, Karyawan", "Melakukan autentikasi masuk ke dalam sistem menggunakan email dan password."],
            ["2", "Kelola Data Karyawan", "Admin", "Menambah, memperbarui, dan menghapus (nonaktifkan) data akun karyawan."],
            ["3", "Generate QR Dinamis", "Admin", "Membuat dan memperbarui token absensi berbasis waktu secara otomatis tiap 30 detik."],
            ["4", "Monitoring Real-time", "Admin", "Memantau daftar kehadiran karyawan secara langsung pada hari berjalan."],
            ["5", "Unduh Rekap Laporan", "Admin", "Mengekspor data riwayat kehadiran karyawan ke dalam format file Microsoft Excel (.xlsx)."],
            ["6", "Pindai (Scan) QR Absen", "Karyawan", "Melakukan absensi masuk (check-in) dan pulang (check-out) dengan memindai QR dinamis."],
            ["7", "Lihat Riwayat Mandiri", "Karyawan", "Melihat log riwayat waktu kehadiran masuk dan pulang milik akun pribadi."]
        ]
    ),
    new Paragraph({ children: [new TextRun("")] })
);

// --- 4.1.3 Perancangan Activity Diagram (Flowchart) ---
childrenContent.push(createHeading3("4.1.3 Perancangan Activity Diagram (Flowchart)"));
childrenContent.push(
    createNormalParagraph(
        "Activity Diagram (Diagram Aktivitas) atau diagram alir (flowchart) menggambarkan aliran kontrol kerja dari satu aktivitas ke aktivitas lainnya dalam sistem absensi. Terdapat 2 (dua) alur proses bisnis utama yang menjadi fokus utama dalam perancangan sistem absensi dinamis ini, yaitu:"
    ),
    createNormalParagraph(
        "1. Alur Proses Pembuatan QR Code Dinamis (Admin):"
    ),
    createListItem("a.", "Sistem admin di sisi klien memicu fungsi pemanggilan token baru ke server saat halaman dibuka."),
    createListItem("b.", "Server Next.js membuat data token dengan format gabungan timestamp server saat itu dan string acak (salt) untuk mencegah duplikasi token."),
    createListItem("c.", "Token dikirim ke klien, lalu pustaka QR generator merender nilai token tersebut menjadi gambar kode QR pada layar kantor."),
    createListItem("d.", "Sistem klien menjalankan penghitung mundur (timer) 30 detik secara berkala (real-time)."),
    createListItem("e.", "Setelah waktu timer habis (0 detik), sistem secara otomatis mengulangi langkah pertama untuk memperbarui token dan gambar QR di layar."),
    createNormalParagraph(
        "2. Alur Proses Pemindaian & Validasi Kehadiran (Karyawan & Server):"
    ),
    createListItem("a.", "Karyawan mengaktifkan menu pemindai pada aplikasi mobile browser, yang meminta izin kamera perangkat."),
    createListItem("b.", "Karyawan memindai gambar QR di layar admin untuk mengambil payload token."),
    createListItem("c.", "Payload token yang didapatkan beserta data sesi login karyawan dikirimkan ke server menggunakan API endpoint POST /api/attendance/scan."),
    createListItem("d.", "Server memisahkan payload token menjadi timestamp dan salt."),
    createListItem("e.", "Server membandingkan timestamp token dengan waktu server saat ini. Jika selisih waktu melebihi 35 detik (30 detik validitas + 5 detik toleransi delay jaringan), server membatalkan proses dan membalas dengan respon error 'QR Code Kadaluarsa'."),
    createListItem("f.", "Jika waktu valid, server memeriksa log database absensi karyawan bersangkutan pada hari tersebut. Apabila belum ada log kehadiran hari itu, server menyimpan data absensi sebagai Check-in."),
    createListItem("g.", "Apabila sudah ada log Check-in namun belum ada log Check-out pada hari tersebut, server memperbarui data log kehadiran tersebut menjadi Check-out."),
    createListItem("h.", "Server mengembalikan respon sukses kepada perangkat mobile karyawan, dan secara real-time memperbarui grafik dashboard admin.")
);

// --- 4.1.4 Perancangan Database (Skema Basis Data) ---
childrenContent.push(createHeading3("4.1.4 Perancangan Database"));
childrenContent.push(
    createNormalParagraph(
        "Struktur penyimpanan data dirancang menggunakan konsep basis data relasional guna memastikan konsistensi dan integritas data. Skema basis data dikelola menggunakan Drizzle ORM yang bertindak sebagai database adapter. Tabel utama terdiri atas tabel user untuk menampung data karyawan/admin serta tabel attendances untuk log kehadiran harian. Tabel pendukung lainnya adalah session, account, dan verification yang secara otomatis dibuat oleh pustaka Better Auth untuk menangani otentikasi sistem."
    ),
    createNormalParagraph(
        "Relasi antar entitas (Entity Relationship) pada sistem absensi Rianpedia dirancang secara terstruktur sebagai berikut:"
    ),
    createListItem("1.", "Tabel user dengan tabel attendances memiliki relasi satu-ke-banyak (One-to-Many), di mana satu pengguna (karyawan) dapat memiliki banyak log catatan kehadiran harian. Relasi dihubungkan melalui kolom user_id pada tabel attendances sebagai Foreign Key yang merujuk pada kolom id di tabel user."),
    createListItem("2.", "Tabel user dengan tabel session memiliki relasi satu-ke-banyak (One-to-Many), di mana satu akun pengguna dapat memiliki lebih dari satu sesi browser aktif secara bersamaan. Sesi ini dikelola otomatis oleh Better Auth melalui kolom user_id."),
    createListItem("3.", "Tabel user dengan tabel account memiliki relasi satu-ke-banyak (One-to-Many), untuk menyimpan detail autentikasi eksternal maupun internal (kredensial password) yang terhubung ke satu akun user."),
    createListItem("4.", "Tabel verification berdiri secara terpisah tanpa relasi asing langsung untuk mengelola token verifikasi pendaftaran atau reset sandi sementara yang memiliki batas waktu kadaluarsa."),
    createNormalParagraph(
        "Berikut adalah rincian perancangan kolom (field) dari masing-masing tabel database:"
    ),
    // Tabel 2: User
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        keepWithNext: true,
        children: formatTextToRuns("Tabel 4.2 Struktur Kolom Tabel User (Pengguna)", { bold: true, size: 22 })
    }),
    createTable(
        [
            { text: "Nama Kolom (Field)", width: 1800 },
            { text: "Tipe Data (PostgreSQL)", width: 2000 },
            { text: "Kunci", width: 1300 },
            { text: "Keterangan / Fungsi", width: 2800 }
        ],
        [
            ["id", "text", "Primary Key", "ID unik pengguna (UUID/String)"],
            ["name", "text", "-", "Nama lengkap admin atau karyawan"],
            ["email", "text", "Unique", "Alamat email untuk otentikasi"],
            ["password_hash", "text", "-", "Kata sandi yang telah dienkripsi"],
            ["role", "text", "-", "Peran sistem: 'ADMIN' atau 'EMPLOYEE'"],
            ["email_verified", "boolean", "-", "Status verifikasi email pengguna"],
            ["image", "text", "-", "URL/Path tautan foto profil"],
            ["banned", "boolean", "-", "Status pemblokiran akun"],
            ["ban_reason", "text", "-", "Alasan akun diblokir"],
            ["created_at", "timestamp", "-", "Waktu pembuatan akun"],
            ["updated_at", "timestamp", "-", "Waktu pembaruan akun terbaru"]
        ]
    ),
    new Paragraph({ children: [new TextRun("")] }),

    // Tabel 3: Attendances
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        keepWithNext: true,
        children: formatTextToRuns("Tabel 4.3 Struktur Kolom Tabel Attendances (Absensi)", { bold: true, size: 22 })
    }),
    createTable(
        [
            { text: "Nama Kolom (Field)", width: 1800 },
            { text: "Tipe Data (PostgreSQL)", width: 2000 },
            { text: "Kunci", width: 1300 },
            { text: "Keterangan / Fungsi", width: 2800 }
        ],
        [
            ["id", "text", "Primary Key", "ID unik log kehadiran harian"],
            ["user_id", "text", "Foreign Key (user.id)", "Relasi ke ID karyawan yang absen"],
            ["date", "text", "-", "Tanggal pencatatan absen (YYYY-MM-DD)"],
            ["check_in", "timestamp", "-", "Stempel waktu masuk kerja karyawan"],
            ["check_out", "timestamp", "-", "Stempel waktu pulang kerja karyawan"]
        ]
    ),
    new Paragraph({ children: [new TextRun("")] }),

    // Tabel 4: Session
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        keepWithNext: true,
        children: formatTextToRuns("Tabel 4.4 Struktur Kolom Tabel Session (Sesi Otentikasi)", { bold: true, size: 22 })
    }),
    createTable(
        [
            { text: "Nama Kolom (Field)", width: 1800 },
            { text: "Tipe Data (PostgreSQL)", width: 2000 },
            { text: "Kunci", width: 1300 },
            { text: "Keterangan / Fungsi", width: 2800 }
        ],
        [
            ["id", "text", "Primary Key", "ID unik sesi otentikasi"],
            ["user_id", "text", "Foreign Key (user.id)", "ID pengguna pemilik sesi"],
            ["token", "text", "Unique", "Token otentikasi unik browser"],
            ["expires_at", "timestamp", "-", "Batas kedaluwarsa sesi"],
            ["ip_address", "text", "-", "IP Address asal peramban klien"],
            ["user_agent", "text", "-", "Spesifikasi browser & OS klien"],
            ["created_at", "timestamp", "-", "Waktu pembuatan sesi"],
            ["updated_at", "timestamp", "-", "Waktu pembaruan sesi"]
        ]
    ),
    new Paragraph({ children: [new TextRun("")] }),

    // Tabel 5: Account
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        keepWithNext: true,
        children: formatTextToRuns("Tabel 4.5 Struktur Kolom Tabel Account (Akun Kredensial)", { bold: true, size: 22 })
    }),
    createTable(
        [
            { text: "Nama Kolom (Field)", width: 1800 },
            { text: "Tipe Data (PostgreSQL)", width: 2000 },
            { text: "Kunci", width: 1300 },
            { text: "Keterangan / Fungsi", width: 2800 }
        ],
        [
            ["id", "text", "Primary Key", "ID unik akun kredensial"],
            ["user_id", "text", "Foreign Key (user.id)", "ID pengguna pemilik akun kredensial"],
            ["account_id", "text", "-", "ID unik eksternal penyedia auth"],
            ["provider_id", "text", "-", "Penyedia autentikasi (misal: 'credential')"],
            ["access_token", "text", "-", "Token akses untuk provider eksternal"],
            ["refresh_token", "text", "-", "Token penyegaran untuk provider eksternal"],
            ["access_token_expires_at", "timestamp", "-", "Waktu kadaluarsa token akses"],
            ["refresh_token_expires_at", "timestamp", "-", "Waktu kadaluarsa token penyegaran"],
            ["scope", "text", "-", "Cakupan izin akses akun"],
            ["id_token", "text", "-", "ID Token JWT untuk provider eksternal"],
            ["password", "text", "-", "Kata sandi terenkripsi (hanya untuk provider kredensial)"],
            ["created_at", "timestamp", "-", "Waktu pembuatan data akun"],
            ["updated_at", "timestamp", "-", "Waktu pembaruan data akun"]
        ]
    ),
    new Paragraph({ children: [new TextRun("")] }),

    // Tabel 6: Verification
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        keepWithNext: true,
        children: formatTextToRuns("Tabel 4.6 Struktur Kolom Tabel Verification (Token Verifikasi)", { bold: true, size: 22 })
    }),
    createTable(
        [
            { text: "Nama Kolom (Field)", width: 1800 },
            { text: "Tipe Data (PostgreSQL)", width: 2000 },
            { text: "Kunci", width: 1300 },
            { text: "Keterangan / Fungsi", width: 2800 }
        ],
        [
            ["id", "text", "Primary Key", "ID unik record verifikasi"],
            ["identifier", "text", "-", "Pengenal target verifikasi (misal: email)"],
            ["value", "text", "-", "Nilai token verifikasi unik"],
            ["expires_at", "timestamp", "-", "Batas kedaluwarsa token verifikasi"],
            ["created_at", "timestamp", "-", "Waktu pembuatan token"],
            ["updated_at", "timestamp", "-", "Waktu pembaruan token"]
        ]
    ),
    new Paragraph({ children: [new TextRun("")] })
);

// --- 4.1.5 Perancangan Antarmuka Pengguna (UI) ---
childrenContent.push(createHeading3("4.1.5 Perancangan Antarmuka Pengguna"));
childrenContent.push(
    createNormalParagraph(
        "Perancangan antarmuka aplikasi bertujuan untuk menyajikan visualisasi tata letak halaman yang ramah pengguna (user-friendly) serta responsif di berbagai ukuran perangkat. Aplikasi didesain dengan konsep Mobile-First untuk halaman pemindaian karyawan dan Desktop-First untuk dashboard manajemen admin."
    ),
    createNormalParagraph(
        "Halaman-halaman utama yang akan dibangun meliputi:"
    ),
    createListItem("1.", "Halaman Login: Digunakan oleh admin maupun karyawan untuk masuk ke dalam aplikasi menggunakan Email dan Password."),
    createListItem("2.", "Halaman Dashboard Admin: Berisi metrik ringkasan jumlah kehadiran karyawan secara real-time pada hari tersebut, statistik absensi, serta pintasan menu."),
    createListItem("3.", "Halaman Manajemen Karyawan: Memuat tabel daftar karyawan, opsi penambahan karyawan baru, edit data profil, dan penghapusan akun."),
    createListItem("4.", "Halaman QR Generator: Layar utama untuk menampilkan kode QR absensi di area pintu masuk kantor. Halaman ini diperbarui otomatis tiap 30 detik."),
    createListItem("5.", "Halaman Riwayat Kehadiran (Admin & Karyawan): Admin dapat memantau log masuk-pulang semua karyawan, sedangkan karyawan hanya dapat melihat riwayat absensi pribadi mereka."),
    createListItem("6.", "Halaman Laporan Lanjutan: Menyediakan antarmuka filter tanggal untuk ekspor laporan data absensi ke format Excel (.xlsx).")
);

// --- 4.2 IMPLEMENTASI SISTEM ---
childrenContent.push(createHeading2("4.2 Implementasi Sistem", { pageBreakBefore: true }));
childrenContent.push(
    createNormalParagraph(
        "Tahap implementasi menjelaskan konversi perancangan sistem menjadi baris-baris kode program. Pembangunan proyek ini menggunakan teknologi Next.js App Router (TypeScript), Tailwind CSS sebagai framework desain responsif, Better Auth sebagai pustaka otentikasi, serta Drizzle ORM dengan PostgreSQL sebagai basis data utama."
    )
);

// --- 4.2.1 Konfigurasi Database dan ORM ---
childrenContent.push(createHeading3("4.2.1 Konfigurasi Database dan ORM"));
childrenContent.push(
    createNormalParagraph(
        "Koneksi ke database PostgreSQL serta skema migrasi dikonfigurasi melalui Drizzle ORM. Berkas utama konfigurasi ORM didefinisikan pada drizzle.config.ts sebagai berikut:"
    ),
    createCodeBlock(`import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    }
});`),
    createNormalParagraph(
        "Definisi skema tabel data absensi dan data pengguna ditulis pada file src/lib/db/schema.ts menggunakan bahasa pemodelan skema Drizzle ORM sebagai berikut:"
    ),
    createCodeBlock(`import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('EMPLOYEE'), // 'ADMIN' or 'EMPLOYEE'
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const attendances = pgTable('attendances', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  date: text('date').notNull(), // format: YYYY-MM-DD
  checkIn: timestamp('check_in').notNull(),
  checkOut: timestamp('check_out'),
});`),
    createNormalParagraph(
        "Skema di atas menerapkan integritas referensial (Foreign Key) yang menghubungkan tabel attendances ke tabel user.id melalui kolom user_id."
    )
);

// --- 4.2.2 Implementasi Autentikasi (Better Auth) ---
childrenContent.push(createHeading3("4.2.2 Implementasi Autentikasi"));
childrenContent.push(
    createNormalParagraph(
        "Modul keamanan login menggunakan pustaka Better Auth. Untuk mendukung pembagian peran akses sistem, ditambahkan kolom kustom role pada metadata pengguna. Berikut konfigurasi inisialisasi Better Auth pada file src/lib/auth.ts:"
    ),
    createCodeBlock(`import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "EMPLOYEE",
            },
        },
    },
    plugins: [nextCookies(), admin({ adminRoles: ["ADMIN"] })],
    trustedOrigins: [
        "https://absensi-qr-ten.vercel.app/",
        "http://localhost:3000"
    ]
});`),
    createNormalParagraph(
        "Melalui plugin admin() yang disediakan Better Auth, aplikasi secara otomatis mengenali peran 'ADMIN' untuk mengakses dashboard, sedangkan 'EMPLOYEE' secara terpisah diarahkan menuju halaman pemindai QR."
    )
);

// --- 4.2.3 Implementasi QR Absensi Dinamis ---
childrenContent.push(createHeading3("4.2.3 Implementasi QR Absensi Dinamis"));
childrenContent.push(
    createNormalParagraph(
        "Fokus utama pembangunan sistem ini adalah menjaga validitas kehadiran karyawan secara fisik menggunakan kode QR dinamis. Logika generator di halaman Admin secara terus-menerus memperbarui token unik dalam selang waktu 30 detik. Fungsi pembuatan token ditulis sebagai berikut pada file qr-client.tsx:"
    ),
    createCodeBlock(`const generateToken = () => {
    // Menghasilkan token valid untuk 30 detik (timestamp saat ini + salt acak)
    const timestamp = Date.now();
    const randomSalt = Math.random().toString(36).substring(2, 10);
    const payload = \`\${timestamp}-\${randomSalt}\`;
    setToken(payload);
    setTimeLeft(30);
};`),
    createNormalParagraph(
        "Token QR di atas ditangkap oleh kamera HP karyawan dan dikirimkan ke backend server untuk diverifikasi secara aman. Penanganan API Route backend tersebut diimplementasikan pada file src/app/api/attendance/scan/route.ts sebagai berikut:"
    ),
    createCodeBlock(`export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { qrData } = await req.json();
        if (!qrData) {
            return NextResponse.json({ error: "Data QR tidak valid" }, { status: 400 });
        }

        const parts = qrData.split("-");
        if (parts.length !== 2) {
            return NextResponse.json({ error: "Format QR tidak dikenali" }, { status: 400 });
        }

        const qrTimestamp = parseInt(parts[0], 10);
        const now = Date.now();

        // Validasi kadaluwarsa token (30 detik + 5 detik toleransi jaringan)
        if (now - qrTimestamp > 35000 || qrTimestamp > now + 5000) {
            return NextResponse.json({ error: "Kode QR sudah kadaluarsa. Silakan segarkan kode di layar Admin." }, { status: 400 });
        }

        const today = new Date().toLocaleDateString("en-CA"); // Format YYYY-MM-DD
        const userId = session.user.id;

        // Cek log absensi hari ini untuk menentukan Check-in atau Check-out
        const existingRecord = await db.select().from(attendances).where(
            and(eq(attendances.userId, userId), eq(attendances.date, today))
        ).limit(1);

        if (existingRecord.length === 0) {
            // Proses CHECK-IN
            await db.insert(attendances).values({
                id: crypto.randomUUID(),
                userId: userId,
                date: today,
                checkIn: new Date(now),
            });
            return NextResponse.json({ success: true, type: "checkin", time: new Date(now).toLocaleString("id-ID") });
        } else if (!existingRecord[0].checkOut) {
            // Proses CHECK-OUT
            await db.update(attendances).set({
                checkOut: new Date(now)
            }).where(eq(attendances.id, existingRecord[0].id));
            return NextResponse.json({ success: true, type: "checkout", time: new Date(now).toLocaleString("id-ID") });
        } else {
            return NextResponse.json({ error: "Anda sudah melakukan Check-in dan Check-out hari ini." }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
    }
}`)
);

// --- 4.3 Implementasi Antarmuka Sisi Admin ---
childrenContent.push(createHeading2("4.3 Implementasi Antarmuka Sisi Admin"));

// 4.3.1 Halaman Dashboard Admin
childrenContent.push(createHeading3("4.3.1 Halaman Dashboard Admin"));
childrenContent.push(
    createNormalParagraph(
        "Halaman Dashboard Admin diimplementasikan pada berkas dashboard-client.tsx yang bertugas menampilkan statistik total kehadiran karyawan secara real-time. Data kehadiran divisualisasikan menggunakan kartu informasi dinamis dengan pustaka framer-motion untuk efek transisi yang halus. Visualisasi antarmuka dashboard admin ditunjukkan pada Gambar 4.1."
    ),
    ...createFigurePlaceholder("dashboard-admin.png", "Halaman Dashboard Admin", "4.1"),
    createNormalParagraph(
        "Gambar 4.1 merupakan pusat kendali utama bagi Admin, menampilkan metrik kehadiran karyawan secara real-time, seperti jumlah karyawan yang hadir, terlambat, atau tidak hadir pada hari yang berjalan."
    )
);

// 4.3.2 Halaman QR Generator Kehadiran Admin
childrenContent.push(createHeading3("4.3.2 Halaman QR Generator Kehadiran Admin"));
childrenContent.push(
    createNormalParagraph(
        "Halaman QR Generator Kehadiran Admin disajikan pada Gambar 4.2. Pada halaman ini, kode QR absensi di-render secara visual di layar kantor dan diperbarui secara otomatis setiap 30 detik guna mencegah manipulasi kehadiran oleh karyawan."
    ),
    ...createFigurePlaceholder("qr-absensi-admin.png", "Halaman QR Generator Kehadiran Admin", "4.2"),
    createNormalParagraph(
        "Gambar 4.2 menampilkan kode QR absensi di layar. Generator ini menggunakan token dinamis berbasis waktu (timestamp-salt) untuk menjaga keamanan data kehadiran karyawan agar tidak dapat dimanipulasi dengan cara difoto."
    )
);

// 4.3.3 Halaman Manajemen Data Karyawan
childrenContent.push(createHeading3("4.3.3 Halaman Manajemen Data Karyawan"));
childrenContent.push(
    createNormalParagraph(
        "Halaman Manajemen Data Karyawan disajikan pada Gambar 4.3. Antarmuka ini memuat tabel interaktif untuk menambah, mengubah, atau menonaktifkan akun karyawan dalam database."
    ),
    ...createFigurePlaceholder("manajemen-karyawan-admin.png", "Halaman Manajemen Data Karyawan", "4.3"),
    createNormalParagraph(
        "Gambar 4.3 menampilkan antarmuka pengelolaan karyawan di sisi Admin. Admin dapat menambahkan karyawan baru dengan memasukkan nama, email, dan kata sandi awal, serta mengedit detail karyawan yang sudah terdaftar."
    )
);

// 4.3.4 Halaman Laporan Absensi Admin
childrenContent.push(createHeading3("4.3.4 Halaman Laporan Absensi Admin"));
childrenContent.push(
    createNormalParagraph(
        "Halaman Laporan Absensi Admin disajikan pada Gambar 4.4. Halaman ini memungkinkan Admin untuk memilih rentang tanggal absensi tertentu dan mengunduh berkas rekap kehadiran dalam bentuk Excel."
    ),
    ...createFigurePlaceholder("laporan-admin.png", "Halaman Laporan Absensi Admin", "4.4"),
    createNormalParagraph(
        "Gambar 4.4 menampilkan halaman penarikan laporan absensi. Fungsionalitas ekspor rekapitulasi kehadiran karyawan ke dalam format Spreadsheet (Excel) diimplementasikan menggunakan pustaka xlsx. Script mengambil rentang tanggal yang dipilih oleh Admin, melakukan kueri gabungan (JOIN) data kehadiran dengan nama karyawan pada tabel user, menyusun baris data secara terstruktur, lalu mengonversinya menjadi dokumen Excel siap unduh. Implementasi ekspor data ini memberikan efisiensi tinggi bagi staf HRD/Admin dalam menghitung penggajian bulanan."
    )
);

// --- 4.4 Implementasi Antarmuka Sisi Karyawan ---
childrenContent.push(createHeading2("4.4 Implementasi Antarmuka Sisi Karyawan"));

// 4.4.1 Halaman Webapp Scanner QR HP Karyawan
childrenContent.push(createHeading3("4.4.1 Halaman Webapp Scanner QR HP Karyawan"));
childrenContent.push(
    createNormalParagraph(
        "Halaman Webapp Scanner QR HP Karyawan disajikan pada Gambar 4.5. Antarmuka mobile ini membuka kamera perangkat HP milik karyawan untuk memindai kode QR dinamis yang dipasang di area kantor guna memproses absensi masuk dan pulang."
    ),
    ...createFigurePlaceholder("scan-qr-karyawan.png", "Halaman Webapp Scanner QR HP Karyawan", "4.5"),
    createNormalParagraph(
        "Gambar 4.5 merupakan antarmuka pemindai QR berbasis kamera HP karyawan. Karyawan wajib menyetujui izin akses kamera pada browser mobile untuk dapat memindai QR dinamis kantor."
    )
);

// 4.4.2 Halaman Riwayat Kehadiran Karyawan
childrenContent.push(createHeading3("4.4.2 Halaman Riwayat Kehadiran Karyawan"));
childrenContent.push(
    createNormalParagraph(
        "Halaman Riwayat Kehadiran Karyawan disajikan pada Gambar 4.6. Halaman ini menyajikan log catatan waktu check-in dan check-out karyawan secara kronologis agar karyawan dapat memantau log kehadiran mandiri."
    ),
    ...createFigurePlaceholder("riwayat-karyawan.png", "Halaman Riwayat Absensi Karyawan", "4.6"),
    createNormalParagraph(
        "Gambar 4.6 menyajikan log kehadiran harian karyawan yang login ke HP. Informasi yang ditampilkan meliputi tanggal kehadiran, stempel waktu masuk (Check-in), dan stempel waktu pulang (Check-out)."
    )
);

// 4.4.3 Halaman Profil Akun Karyawan
childrenContent.push(createHeading3("4.4.3 Halaman Profil Akun Karyawan"));
childrenContent.push(
    createNormalParagraph(
        "Halaman Profil Akun Karyawan disajikan pada Gambar 4.7. Antarmuka ini menampilkan data akun karyawan berupa nama, email, serta tombol logout untuk mengakhiri sesi masuk pada browser perangkat mobile."
    ),
    ...createFigurePlaceholder("profil-karyawan.png", "Halaman Profil Akun Karyawan", "4.7"),
    createNormalParagraph(
        "Gambar 4.7 menyajikan informasi detail akun karyawan beserta tombol keluar (logout) untuk menghapus cookie sesi di peramban HP."
    )
);

// --- 4.5 PENGUJIAN SISTEM ---
childrenContent.push(createHeading2("4.5 Pengujian Sistem"));
childrenContent.push(
    createNormalParagraph(
        "Pengujian perangkat lunak dilakukan untuk memastikan seluruh modul, API, dan komponen antarmuka yang telah dibangun berfungsi dengan baik tanpa adanya bug kritis. Metode pengujian yang dipilih adalah Black-box Testing, yakni metode pengujian yang berfokus pada hasil masukan dan keluaran sistem tanpa perlu memeriksa struktur kode program internal secara langsung."
    )
);

// --- 4.5.1 Skenario Pengujian ---
childrenContent.push(createHeading3("4.5.1 Skenario Pengujian"));
childrenContent.push(
    createNormalParagraph(
        "Skenario pengujian dirancang mencakup alur otentikasi, validitas token QR presensi, pencatatan waktu kehadiran karyawan, dan fungsionalitas ekspor laporan. Semua kasus uji dirancang sedemikian rupa agar mewakili interaksi pengguna yang sesungguhnya di lapangan."
    )
);

// --- 4.5.2 Hasil Pengujian Fungsional ---
childrenContent.push(createHeading3("4.5.2 Hasil Pengujian Fungsional (Black-box)"));
childrenContent.push(
    createNormalParagraph(
        "Berikut adalah tabel yang mendokumentasikan hasil pelaksanaan pengujian fungsional pada aplikasi absensi berbasis kode QR dinamis Rianpedia:"
    ),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        keepWithNext: true,
        children: formatTextToRuns("Tabel 4.7 Hasil Pengujian Fungsional Aplikasi", { bold: true, size: 22 })
    }),
    createTable(
        [
            { text: "ID Uji", width: 800 },
            { text: "Fitur Aplikasi", width: 1300 },
            { text: "Kasus / Skenario Uji", width: 2000 },
            { text: "Hasil yang Diharapkan", width: 3000 },
            { text: "Status", width: 800 }
        ],
        [
            ["TC-01", "Login Akun", "Input email & password yang terdaftar dan menekan tombol login", "Sistem memvalidasi kredensial, mengalihkan rute berdasarkan peran (Admin ke /dashboard, Karyawan ke /scan)", "Sukses"],
            ["TC-02", "Login Akun", "Input kata sandi salah atau email tidak terdaftar", "Sistem menampilkan pesan kegagalan otentikasi 'Invalid Credentials'", "Sukses"],
            ["TC-03", "QR Generator", "Membuka menu QR Absensi Hari Ini di sisi Admin", "Sistem merender QR Code secara acak dan memperbarui token otomatis setiap 30 detik", "Sukses"],
            ["TC-04", "Presensi Masuk", "Karyawan memindai QR dinamis yang baru digenerasi", "Sistem memvalidasi token, mencatat checkIn di database, menampilkan notifikasi absen masuk berhasil beserta jam server", "Sukses"],
            ["TC-05", "Presensi Pulang", "Karyawan memindai QR dinamis yang sama untuk kedua kali di hari yang sama", "Sistem mendeteksi absensi hari ini telah ada, memperbarui kolom checkOut, menampilkan notifikasi absen pulang berhasil", "Sukses"],
            ["TC-06", "Validasi QR Expired", "Karyawan memindai QR code lama yang telah kedaluwarsa (>35 detik)", "Sistem membandingkan selisih timestamp server, memblokir pencatatan presensi, dan merespon pesan 'Kode QR sudah kadaluarsa'", "Sukses"],
            ["TC-07", "Ekspor Laporan", "Admin melakukan filter rentang tanggal dan mengklik 'Download Excel'", "Sistem mengekspor tabel data absensi ke file .xlsx dan mengunduh berkas laporan secara otomatis", "Sukses"]
        ]
    ),
    new Paragraph({ children: [new TextRun("")] }),
    createNormalParagraph(
        "Berdasarkan hasil pengujian fungsional yang ditunjukkan pada Tabel 4.7, seluruh modul utama dari aplikasi absensi berbasis kode QR dinamis pada proyek Rianpedia ini telah memenuhi kriteria kelayakan produk dan berfungsi secara tepat sesuai spesifikasi kebutuhan pengguna yang ditetapkan sebelumnya."
    )
);

// ==========================================
// PROSES EKSPOR KE WORD DENGAN SECTIONS
// ==========================================

const doc = new Document({
    sections: [
        {
            properties: {
                page: {
                    margin: {
                        top: 1701,    // 3 cm
                        bottom: 1701, // 3 cm
                        left: 2268,   // 4 cm
                        right: 1701   // 3 cm
                    }
                }
            },
            children: childrenContent
        }
    ]
});

// Simpan file hasil ke Bab_IV_Skripsi.docx
Packer.toBuffer(doc).then((buffer) => {
    const outputPath = path.join(__dirname, "Bab_IV_Skripsi.docx");
    fs.writeFileSync(outputPath, buffer);
    console.log("=========================================");
    console.log("SUKSES: Dokumen Word Bab IV Skripsi berhasil digenerasi!");
    console.log(`Lokasi berkas: ${outputPath}`);
    console.log("=========================================");
}).catch((err) => {
    console.error("EROR saat menulis berkas dokumen:", err);
});
