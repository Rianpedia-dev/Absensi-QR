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
    try {
        const adminRes = await auth.api.signUpEmail({
            body: {
                email: "admin@kantor.com",
                password: "adminpassword123",
                name: "Bapak Admin Utama",
            }
        });

        if (adminRes?.user) {
            await db.update(user).set({ role: "ADMIN" }).where(eq(user.id, adminRes.user.id));
            console.log("✅ Akun Admin berhasil dibuat: admin@kantor.com | adminpassword123");
        }
    } catch (e) {
        console.log("Admin mungkin sudah ada: admin@kantor.com");
    }

    // 2. Create Employee User
    try {
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
    } catch (e) {
        console.log("Karyawan mungkin sudah ada: budi@kantor.com");
    }

    // 3. Create Joko with history
    let jokoId: string | null = null;
    try {
        const jokoRes = await auth.api.signUpEmail({
            body: {
                email: "joko@gmail.com",
                password: "joko12345",
                name: "Joko Susilo",
            }
        });
        if (jokoRes?.user) jokoId = jokoRes.user.id;
    } catch (e: any) {
        console.log("Joko mungkin sudah ada, mencari ID-nya...");
    }

    if (!jokoId) {
        const jokoUser = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.email, "joko@gmail.com")
        });
        if (jokoUser) jokoId = jokoUser.id;
    }

    if (jokoId) {
        const { attendances } = await import("../lib/db/schema");
        const crypto = await import("crypto");

        const today = new Date();
        const dummyHistory = [];

        for (let i = 1; i <= 5; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            
            const checkIn = new Date(date);
            checkIn.setHours(8, 0, 0, 0); 
            
            const checkOut = new Date(date);
            checkOut.setHours(17, 0, 0, 0); 

            dummyHistory.push({
                id: crypto.randomUUID(),
                userId: jokoId,
                date: dateStr,
                checkIn: checkIn,
                checkOut: checkOut
            });
        }

        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayCheckIn = new Date(today);
        todayCheckIn.setHours(8, 5, 0, 0);

        dummyHistory.push({
            id: crypto.randomUUID(),
            userId: jokoId,
            date: todayStr,
            checkIn: todayCheckIn,
            checkOut: null 
        });

        // check if attendances already exist for joko to prevent duplicate seeding
        await db.delete(attendances).where(eq(attendances.userId, jokoId));

        await db.insert(attendances).values(dummyHistory);
        console.log(`✅ Data history absensi joko berhasil ditambahkan (ID: ${jokoId}).`);
    }

    } catch (error) {
        console.error("Gagal melakukan seeding:", error);
    }

    process.exit(0);
}

main();
