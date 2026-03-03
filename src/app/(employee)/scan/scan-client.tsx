"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2, Camera, ScanLine, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<{ success: boolean; type?: string; time?: string; error?: string } | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isStopped, setIsStopped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isStartingRef = useRef(false);

    const handleQrData = useCallback(async (data: string) => {
        setLoading(true);
        // Stop scanner first
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (e) { /* ignore */ }
        }
        setIsScanning(false);

        try {
            const res = await fetch("/api/attendance/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrData: data }),
            });

            const result = await res.json();

            if (res.ok) {
                setScanResult({ success: true, type: result.type, time: result.time });
            } else {
                setScanResult({ success: false, error: result.error });
            }
        } catch (error) {
            setScanResult({ success: false, error: "Gagal menyambung ke server." });
        } finally {
            setLoading(false);
        }
    }, []);

    const startCamera = useCallback(async () => {
        if (isStartingRef.current || scannerRef.current?.isScanning) return;
        isStartingRef.current = true;
        setCameraError(null);

        try {
            // Create scanner instance if needed
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }

            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 15,
                    qrbox: { width: 260, height: 260 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    handleQrData(decodedText);
                },
                () => {
                    // scan failure - ignore (fires every frame without QR)
                }
            );

            setIsScanning(true);
            setIsStopped(false);
        } catch (err: any) {
            console.error("Camera start error:", err);
            if (err?.toString?.().includes("NotAllowedError") || err?.toString?.().includes("Permission")) {
                setCameraError("denied");
            } else if (err?.toString?.().includes("NotFoundError") || err?.toString?.().includes("No camera")) {
                setCameraError("notfound");
            } else {
                setCameraError("error");
            }
        } finally {
            isStartingRef.current = false;
        }
    }, [handleQrData]);

    const stopCamera = useCallback(async () => {
        if (scannerRef.current?.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (e) {
                console.error("Failed to stop scanner", e);
            }
        }
        setIsScanning(false);
        setIsStopped(true);
    }, []);

    // Start camera on mount
    useEffect(() => {
        if (!scanResult && !isStopped) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                startCamera();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [scanResult, isStopped, startCamera]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const resetScanner = () => {
        setScanResult(null);
        setCameraError(null);
    };

    const handleStartScanner = () => {
        setIsStopped(false);
        setCameraError(null);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-full w-full max-w-sm mx-auto animate-in-fade pb-10">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4 mt-2"
            >
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-2 border border-primary/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Secure Scanning System
                </div>
                <p className="text-muted-foreground text-[11px] font-medium opacity-70 px-4">
                    Arahkan kamera ke QR Code Admin untuk konfirmasi absensi otomatis.
                </p>
            </motion.div>

            <Card className="w-full max-w-sm glass-card border-0 shadow-2xl relative">
                <CardContent className="p-0 flex flex-col items-center">

                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping" />
                                    <Loader2 className="w-12 h-12 animate-spin text-primary relative" />
                                </div>
                                <p className="font-black text-xs uppercase tracking-[0.2em] mt-6 animate-pulse">Memproses Absensi...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!scanResult ? (
                        <>
                            <div className="w-full relative bg-black aspect-square overflow-hidden">
                                {/* Video container - html5-qrcode renders video here */}
                                <div id="reader" className="absolute inset-0 w-full h-full" />

                                {/* Scan Overlay - only show when camera is active */}
                                {isScanning && (
                                    <div className="absolute inset-0 z-20 pointer-events-none">
                                        {/* Darkened Backdrop with Hole (Spotlight) */}
                                        <div className="absolute inset-0 bg-black/40" style={{ clipPath: 'polygon(0% 0%, 0% 100%, calc(50% - 130px) 100%, calc(50% - 130px) calc(50% - 130px), calc(50% + 130px) calc(50% - 130px), calc(50% + 130px) calc(50% + 130px), calc(50% - 130px) calc(50% + 130px), calc(50% - 130px) 100%, 100% 100%, 100% 0%)' }} />

                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative w-[260px] h-[260px]">
                                                {/* Corners */}
                                                <div className="absolute top-0 left-0 w-12 h-12 border-t-[6px] border-l-[6px] border-primary rounded-tl-3xl shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                                                <div className="absolute top-0 right-0 w-12 h-12 border-t-[6px] border-r-[6px] border-primary rounded-tr-3xl shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                                                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[6px] border-l-[6px] border-primary rounded-bl-3xl shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                                                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[6px] border-r-[6px] border-primary rounded-br-3xl shadow-[0_0_20px_rgba(var(--primary),0.5)]" />

                                                {/* Scanning Bar */}
                                                <motion.div
                                                    animate={{ top: ['8%', '92%', '8%'] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                    className="absolute left-[4%] right-[4%] h-[4px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#6366f1] rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Camera Permission Denied */}
                                {cameraError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-30 px-8">
                                        <div className="relative mb-4">
                                            <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500/20 rounded-full flex items-center justify-center">
                                                <ShieldAlert className="w-10 h-10 text-amber-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-2">
                                            {cameraError === "denied" ? "Izin Kamera Ditolak" : cameraError === "notfound" ? "Kamera Tidak Ditemukan" : "Gagal Membuka Kamera"}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground text-center leading-relaxed mb-4">
                                            {cameraError === "denied"
                                                ? "Silakan izinkan akses kamera di pengaturan browser Anda."
                                                : cameraError === "notfound"
                                                    ? "Perangkat Anda tidak memiliki kamera yang terdeteksi."
                                                    : "Terjadi masalah saat membuka kamera. Coba refresh halaman."}
                                        </p>
                                        {cameraError === "denied" && (
                                            <div className="text-[10px] text-muted-foreground/60 text-center space-y-1 mb-5 bg-white/5 border border-white/10 rounded-xl p-3 w-full">
                                                <p className="font-bold uppercase tracking-wider opacity-70">Cara Mengaktifkan:</p>
                                                <p>1. Tap ikon 🔒 di address bar</p>
                                                <p>2. Pilih <strong>&quot;Izin Situs&quot;</strong> / <strong>&quot;Permissions&quot;</strong></p>
                                                <p>3. Aktifkan <strong>&quot;Kamera&quot;</strong></p>
                                                <p>4. Refresh halaman ini</p>
                                            </div>
                                        )}
                                        <Button
                                            onClick={() => {
                                                setCameraError(null);
                                                startCamera();
                                            }}
                                            className="w-full font-black uppercase tracking-[0.15em] rounded-xl h-11 text-xs"
                                        >
                                            <Camera className="w-4 h-4 mr-2" />
                                            Coba Lagi
                                        </Button>
                                    </div>
                                )}

                                {/* Loading state - waiting for camera */}
                                {!isScanning && !loading && !isStopped && !cameraError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 italic">
                                            Mengaktifkan Kamera...
                                        </p>
                                    </div>
                                )}

                                {/* Stopped state */}
                                {isStopped && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                                        <Camera className="w-12 h-12 text-muted-foreground/40" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-3 opacity-60">
                                            Kamera Dihentikan
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Custom Buttons */}
                            {isScanning && (
                                <div className="w-full flex justify-center py-4 px-4">
                                    <Button
                                        onClick={stopCamera}
                                        variant="outline"
                                        className="w-full font-black uppercase tracking-[0.15em] rounded-xl h-12 text-xs border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Stop Scanning
                                    </Button>
                                </div>
                            )}
                            {isStopped && (
                                <div className="w-full flex justify-center py-4 px-4">
                                    <Button
                                        onClick={handleStartScanner}
                                        className="w-full font-black uppercase tracking-[0.15em] rounded-xl h-12 text-xs"
                                    >
                                        <ScanLine className="w-4 h-4 mr-2" />
                                        Start Scanning
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 px-6 flex flex-col items-center text-center space-y-8 w-full"
                        >
                            {scanResult.success ? (
                                <>
                                    <div className="relative">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 10 }}
                                            className="w-24 h-24 bg-emerald-500/10 border-4 border-emerald-500/20 rounded-full flex items-center justify-center relative z-10"
                                        >
                                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                        </motion.div>
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-tight uppercase">
                                            {scanResult.type === 'checkin' ? 'Check-In' : 'Check-Out'} <span className="text-emerald-500 italic">SUCCESS</span>
                                        </h2>
                                        <p className="text-muted-foreground font-medium text-sm italic">
                                            Data kehadiran Anda telah tercatat pada pukul <span className="text-foreground font-bold not-italic underline decoration-emerald-500 underline-offset-4">{scanResult.time}</span>.
                                        </p>
                                    </div>
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                                </>
                            ) : (
                                <>
                                    <div className="relative">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 10 }}
                                            className="w-24 h-24 bg-rose-500/10 border-4 border-rose-500/20 rounded-full flex items-center justify-center relative z-10"
                                        >
                                            <AlertCircle className="w-12 h-12 text-rose-500" />
                                        </motion.div>
                                        <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-tight uppercase">
                                            SCAN <span className="text-rose-500 italic">FAILED</span>
                                        </h2>
                                        <p className="text-muted-foreground font-medium text-xs leading-relaxed max-w-[240px]">
                                            {scanResult.error || "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi."}
                                        </p>
                                    </div>
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
                                </>
                            )}

                            <Button onClick={resetScanner} size="lg" variant={scanResult.success ? "default" : "outline"} className="w-full font-black uppercase tracking-[0.2em] rounded-xl h-12">
                                {scanResult.success ? "Selesai" : "Coba Lagi"}
                            </Button>
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center"
            >
                End-to-End Encrypted Verification System
            </motion.p>

            <style dangerouslySetInnerHTML={{
                __html: `
        /* Style html5-qrcode elements for seamless camera view */
        #reader { border: none !important; background: transparent !important; width: 100% !important; height: 100% !important; }
        #reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
        }
        #reader img[alt="Info icon"] { display: none !important; }
        #reader br { display: none !important; }
        #reader canvas {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
        }
        /* Hide the built-in QR scanning region border */
        #qr-shaded-region { display: none !important; }
      `}} />
        </div>
    );
}
