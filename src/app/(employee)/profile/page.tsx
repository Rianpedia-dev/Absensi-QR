"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { data: session, isPending } = authClient.useSession();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword.length < 8) {
            setMessage({ type: "error", text: "Password baru minimal 8 karakter." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
            return;
        }

        setLoading(true);
        try {
            const { error } = await authClient.changePassword({
                newPassword,
                currentPassword,
                revokeOtherSessions: true,
            });

            if (error) {
                setMessage({ type: "error", text: error.message || "Gagal mengganti password." });
            } else {
                setMessage({ type: "success", text: "Password berhasil diubah!" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch {
            setMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
        } finally {
            setLoading(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                    Loading Profile...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in-fade max-w-lg mx-auto pb-12">
            {/* Header */}
            <div className="px-2">
                <h1 className="text-3xl font-black tracking-tight uppercase italic">
                    MY <span className="text-primary not-italic">PROFILE</span>
                </h1>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1 opacity-60">
                    Informasi akun & keamanan Anda.
                </p>
            </div>

            {/* Identity Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <Card className="glass-card border-0 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-3 border-b border-white/5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                            Identitas Karyawan
                        </span>
                    </div>
                    <CardContent className="p-6 space-y-5">
                        {/* Name */}
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">
                                    Nama Lengkap
                                </p>
                                <p className="text-lg font-bold tracking-tight truncate">
                                    {session?.user?.name || "—"}
                                </p>
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-white/5" />

                        {/* Email */}
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">
                                    Email
                                </p>
                                <p className="text-lg font-bold tracking-tight truncate">
                                    {session?.user?.email || "—"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Change Password Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <Card className="glass-card border-0 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-5 py-3 border-b border-white/5 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                            Ganti Password
                        </span>
                    </div>
                    <CardContent className="p-6">
                        <form onSubmit={handleChangePassword} className="space-y-5">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword" className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                    Password Saat Ini
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="currentPassword"
                                        type={showCurrent ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Masukkan password saat ini"
                                        className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-primary/50"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                    Password Baru
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="newPassword"
                                        type={showNew ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Masukkan password baru"
                                        className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-primary/50"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground opacity-50">Minimal 8 karakter</p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                    Konfirmasi Password Baru
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Ulangi password baru"
                                        className={cn(
                                            "pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-primary/50",
                                            confirmPassword && confirmPassword !== newPassword && "border-rose-500/50 focus:border-rose-500"
                                        )}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Password tidak cocok
                                    </p>
                                )}
                            </div>

                            {/* Feedback Message */}
                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold",
                                            message.type === "success"
                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                        )}
                                    >
                                        {message.type === "success" ? (
                                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                        )}
                                        {message.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                                className="w-full h-12 font-bold uppercase tracking-wider text-xs bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menyimpan...
                                    </span>
                                ) : (
                                    "Simpan Password Baru"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
