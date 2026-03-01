"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950">
                <div className="flex items-center h-14 border-b px-4 lg:hidden bg-white dark:bg-zinc-900">
                    <SidebarTrigger />
                    <h1 className="ml-4 font-semibold text-sm">Menu Admin</h1>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}
