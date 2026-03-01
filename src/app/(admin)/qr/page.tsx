"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function QRGeneratorPage() {
    const [token, setToken] = useState("");
    const [timeLeft, setTimeLeft] = useState(30);

    const generateToken = () => {
        // Generate token valid untuk 30 detik (timestamp saat ini + 30s + salt random)
        const timestamp = Date.now();
        const randomSalt = Math.random().toString(36).substring(2, 10);
        const payload = `${timestamp}-${randomSalt}`;
        setToken(payload);
        setTimeLeft(30);
    };

    useEffect(() => {
        generateToken();
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    generateToken();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] animate-in-fade px-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10 space-y-3"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2 border border-primary/20">
                    <Sparkles className="w-3 h-3" />
                    Security Protocol Active
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-gray-100 italic">
                    QR <span className="text-primary not-italic">ATTENDANCE</span>
                </h1>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm md:text-base">
                    Pindai kode unik ini melalui aplikasi karyawan untuk verifikasi kehadiran otomatis.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="glass-card w-full max-w-[420px] shadow-2xl overflow-hidden border-0 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                    <CardHeader className="text-center pb-2 pt-8">
                        <CardTitle className="text-2xl font-black flex items-center justify-center gap-2">
                            SCAN ME
                        </CardTitle>
                        <CardDescription className="font-medium opacity-60 italic">Dynamic encryption in progress...</CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center space-y-8 pt-4 pb-10">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border-8 border-primary/5 relative transition-transform duration-500 group-hover:scale-105">
                                <AnimatePresence mode="wait">
                                    {token ? (
                                        <motion.div
                                            key={token}
                                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                                            transition={{ type: "spring", damping: 15 }}
                                        >
                                            <QRCode
                                                value={token}
                                                size={240}
                                                level="H"
                                                className="w-full h-auto"
                                                fgColor="#0f172a"
                                            />
                                        </motion.div>
                                    ) : (
                                        <div className="w-[240px] h-[240px] flex items-center justify-center">
                                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="w-full space-y-4 px-4">
                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">Token Life</span>
                                <span className={timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-primary"}>
                                    00:{timeLeft.toString().padStart(2, '0')}
                                </span>
                            </div>
                            <div className="w-full bg-secondary/50 h-3 rounded-full overflow-hidden border border-white/10 shadow-inner">
                                <motion.div
                                    initial={false}
                                    animate={{ width: `${(timeLeft / 30) * 100}%` }}
                                    className={`h-full transition-colors duration-1000 rounded-full ${timeLeft <= 5 ? "bg-red-500" : "bg-primary"}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full px-4">
                            <Button variant="outline" onClick={generateToken} className="rounded-xl font-bold gap-2 hover:bg-primary/5 border-primary/20 h-11 text-xs">
                                <RefreshCw className="w-3 h-3" /> FORCE REFRESH
                            </Button>
                            <div className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl px-3 border border-emerald-500/20">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Verified Link</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
            >
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Sistem Sinkronisasi Aktif & Terenkripsi
                </p>
                <p className="text-[10px] text-muted-foreground/40 mt-1 uppercase tracking-[0.2em] font-bold">
                    © 2026 Admin Portal v2.0
                </p>
            </motion.div>
        </div>
    );
}

