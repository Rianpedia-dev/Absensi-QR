import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import EmployeeLayoutClient from "./employee-layout-client";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "EMPLOYEE") {
        redirect("/login");
    }

    return <EmployeeLayoutClient>{children}</EmployeeLayoutClient>;
}
