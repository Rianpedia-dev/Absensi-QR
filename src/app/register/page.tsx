"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, QrCode, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name,
        });

        if (error) {
            setError(error.message || "Terjadi kesalahan saat mendaftar");
            setLoading(false);
        } else {
            router.push("/scan");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-zinc-50 to-white dark:from-indigo-950 dark:via-zinc-950 dark:to-black">
            <div className="absolute inset-0 bg-grid-zinc-200/50 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white shadow-2xl shadow-primary/40 mb-4"
                    >
                        <QrCode className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                        Absensi <span className="text-primary not-italic">Berbasis QR</span>
                    </h1>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.4em] mt-1 opacity-50">Create Employee Account</p>
                </div>

                <Card className="glass-card border-0 shadow-2xl relative overflow-hidden p-2">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mt-12 blur-2xl" />

                    <CardHeader className="text-center pb-8 pt-6">
                        <CardTitle className="text-2xl font-black italic">REGISTRATION</CardTitle>
                        <CardDescription className="font-medium text-xs">Mulai perjalanan Anda di sistem Absensi-QR.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Full Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 rounded-xl bg-black/[0.03] dark:bg-white/5 border-black/[0.08] dark:border-white/10 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Work Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-xl bg-black/[0.03] dark:bg-white/5 border-black/[0.08] dark:border-white/10 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Secure Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 rounded-xl bg-black/[0.03] dark:bg-white/5 border-black/[0.08] dark:border-white/10 focus:ring-primary/20"
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="text-xs text-rose-500 font-bold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 group" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Register Account
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex-col gap-6 pb-8">
                        <div className="flex items-center gap-2 w-full">
                            <div className="h-px bg-white/10 flex-1" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter px-2">Access Portal</span>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>
                        <div className="text-center text-xs text-muted-foreground w-full">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="font-black text-primary hover:underline underline-offset-4 transition-all flex items-center justify-center gap-1 mt-1 uppercase tracking-widest">
                                Authorized Login <ShieldCheck className="ml-1 w-3 h-3" />
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                <p className="text-center mt-12 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.5em]">
                    SECURE REGISTRATION PROTOCOL 5.0
                </p>
            </motion.div>
        </div>
    );
}

