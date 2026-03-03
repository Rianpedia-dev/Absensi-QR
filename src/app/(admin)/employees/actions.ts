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
    try {
        const password = data.password || "password123";
        const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

        // Use HTTP fetch to call the auth sign-up endpoint
        const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": baseUrl,
                "Referer": baseUrl,
            },
            body: JSON.stringify({
                email: data.email,
                password: password,
                name: data.name,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Auth signup error:", result);
            return { success: false, error: result?.message || result?.error || "Gagal membuat akun karyawan" };
        }

        if (result?.user?.id) {
            // Set role to EMPLOYEE
            await db.update(user).set({ role: "EMPLOYEE" }).where(eq(user.id, result.user.id));
        }

        revalidatePath("/employees");
        return { success: true };
    } catch (error: any) {
        console.error("Create employee error:", error);
        return { success: false, error: error.message || "Gagal membuat karyawan" };
    }
}

export async function updateEmployee(id: string, data: { name: string; email: string }) {
    try {
        await db.update(user).set({
            name: data.name,
            email: data.email,
            updatedAt: new Date(),
        }).where(eq(user.id, id));
        revalidatePath("/employees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Gagal mengupdate karyawan" };
    }
}

export async function resetPassword(id: string) {
    try {
        const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");

        const response = await fetch(`${baseUrl}/api/auth/admin/set-user-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": baseUrl,
                "Referer": baseUrl,
                "Cookie": cookieHeader,
            },
            body: JSON.stringify({
                userId: id,
                newPassword: "karyawanpassword",
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Reset password error:", result);
            return { success: false, error: result?.message || "Gagal mereset password" };
        }

        revalidatePath("/employees");
        return { success: true };
    } catch (error: any) {
        console.error("Reset password error:", error);
        return { success: false, error: error.message || "Gagal mereset password" };
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
