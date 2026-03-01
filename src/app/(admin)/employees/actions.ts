"use server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getEmployees() {
    return await db.select().from(user).where(eq(user.role, "EMPLOYEE")).orderBy(desc(user.createdAt));
}

export async function createEmployee(data: { name: string; email: string; password?: string }) {
    // Gunakan auth api untuk mendaftarkan user baru
    // Karena kita di server, kita tidak bisa langsung menggunakan signUp dari client.
    // Tapi kita bisa langsung insert ke database jika hanya butuh data dasar,
    // namun sebaiknya pakai betterAuth API untuk hashing password dll.

    try {
        const password = data.password || "password123";
        const res = await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: password,
                name: data.name,
            }
        });

        if (res?.user) {
            // pastikan role EMPLOYEE
            await db.update(user).set({ role: "EMPLOYEE" }).where(eq(user.id, res.user.id!));
        }

        revalidatePath("/employees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Gagal membuat karyawan" };
    }
}

export async function deleteEmployee(id: string) {
    try {
        await db.delete(user).where(eq(user.id, id));
        revalidatePath("/employees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Gagal menghapus karyawan" };
    }
}
