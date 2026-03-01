"use server";

import { db } from "@/lib/db";
import { attendances } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getMyHistory() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) return [];

    return await db.select()
        .from(attendances)
        .where(eq(attendances.userId, session.user.id))
        .orderBy(desc(attendances.date));
}
