"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { QrCode, ClipboardList, LogOut, UserCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "@/components/mode-toggle";

export default function EmployeeLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="sticky top-0 z-10 glass-card bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-white/10 px-6 h-16 flex items-center justify-between shadow-sm">
                <h1 className="text-xl font-black tracking-tighter italic">
                    ABSENSI <span className="text-primary not-italic">QR</span>
                </h1>
                <div className="flex items-center gap-3">
                    <ModeToggle />
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                        aria-label="Logout Securely"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 p-4">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white dark:bg-zinc-900 border-t pb-safe">
                <div className="flex justify-around items-center h-16">
                    <Link
                        href="/scan"
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/scan" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <QrCode className="w-6 h-6" />
                        <span className="text-xs font-medium">Scan QR</span>
                    </Link>
                    <Link
                        href="/history"
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/history" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <ClipboardList className="w-6 h-6" />
                        <span className="text-xs font-medium">Riwayat</span>
                    </Link>
                    <Link
                        href="/profile"
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <UserCircle className="w-6 h-6" />
                        <span className="text-xs font-medium">Profil</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
