import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
    console.log("Seeding database...");

    // Dynamic imports to ensure dotenv.config() runs first
    const { db } = await import("../lib/db");
    const { user } = await import("../lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const { auth } = await import("../lib/auth");

    try {
        // 1. Create Admin User
        const adminRes = await auth.api.signUpEmail({
            body: {
                email: "admin@kantor.com",
                password: "adminpassword123",
                name: "Bapak Admin Utama",
            }
        });

        // Set to ADMIN role
        if (adminRes?.user) {
            await db.update(user).set({ role: "ADMIN" }).where(eq(user.id, adminRes.user.id));
            console.log("✅ Akun Admin berhasil dibuat: admin@kantor.com | adminpassword123");
        }

        // 2. Create Employee User
        const empRes = await auth.api.signUpEmail({
            body: {
                email: "budi@kantor.com",
                password: "karyawanpassword",
                name: "Budi Santoso",
            }
        });

        if (empRes?.user) {
            console.log("✅ Akun Karyawan berhasil dibuat: budi@kantor.com | karyawanpassword");
        }

    } catch (error) {
        console.error("Gagal melakukan seeding:", error);
    }

    process.exit(0);
}

main();
