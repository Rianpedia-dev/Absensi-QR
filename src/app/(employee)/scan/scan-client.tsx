"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2, Camera, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<{ success: boolean; type?: string; time?: string; error?: string } | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Start scanner only if no result is showing
        if (scanResult) return;

        if (!scannerRef.current) {
            setIsScanning(true);
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 15,
                    qrbox: { width: 260, height: 260 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    rememberLastUsedCamera: true,
                    videoConstraints: {
                        facingMode: "environment"
                    }
                },
                false
            );

            scannerRef.current.render(onScanSuccess, onScanFailure);
        }

        function onScanSuccess(decodedText: string) {
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
                setIsScanning(false);
            }
            handleQrData(decodedText);
        }

        function onScanFailure(error: any) {
            // console.warn(`Code scan error = ${error}`);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
                scannerRef.current = null;
            }
        };
    }, [scanResult]);

    const handleQrData = async (data: string) => {
        setLoading(true);
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
    };

    const resetScanner = () => {
        setScanResult(null);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-sm mx-auto animate-in-fade">
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
                    Arahkan kamera ke QR Code Admin untuk konvirmasi absensi otomatis.
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
                        <div className="w-full relative bg-zinc-100 dark:bg-zinc-800/50">
                            <div id="reader" className="w-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

                            {/* Professional Scan Overlay with Spotlight Effect */}
                            <div className="absolute top-0 left-0 w-full aspect-square z-20 pointer-events-none">
                                {/* Darkened Backdrop with Hole (Spotlight) */}
                                <div className="absolute inset-0 bg-black/40" style={{ clipPath: 'polygon(0% 0%, 0% 100%, calc(50% - 130px) 100%, calc(50% - 130px) calc(50% - 130px), calc(50% + 130px) calc(50% - 130px), calc(50% + 130px) calc(50% + 130px), calc(50% - 130px) calc(50% + 130px), calc(50% - 130px) 100%, 100% 100%, 100% 0%)' }} />

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-[260px] h-[260px]">
                                        {/* Corners - Refined Blue Style (Matching QR Box Exactly) */}
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

                            {!isScanning && !loading && (
                                <div className="absolute top-0 left-0 w-full aspect-square flex flex-col items-center justify-center bg-muted/20 z-10">
                                    <Camera className="w-10 h-10 text-muted-foreground/30 animate-pulse" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4 opacity-50 italic">
                                        Mengaktifkan Kamera...
                                    </p>
                                </div>
                            )}
                        </div>
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
                                            {scanResult.error || "Terjadi kesalahan yang tidak diketahui. SIlakan coba lagi."}
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
        #reader button {
            background-color: hsl(var(--primary)) !important;
            color: hsl(var(--primary-foreground)) !important;
            padding: 0.85rem 2rem !important;
            border-radius: 0.75rem !important;
            border: none !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.15em !important;
            font-size: 0.75rem !important;
            margin: 1rem auto !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 4px 12px rgba(var(--primary), 0.3) !important;
            display: block !important;
            width: fit-content !important;
        }
        #reader button:hover {
            opacity: 0.8;
            transform: scale(0.98);
        }
        #reader a { display: none !important; }
        #reader { border: none !important; background: transparent !important; width: 100% !important; }
        #reader img { display: none !important; } /* Hide the helper images */
        #reader__scan_region { 
            display: flex !important; 
            justify-content: center !important; 
            align-items: center !important;
            width: 100% !important;
            aspect-ratio: 1 / 1 !important;
            overflow: hidden !important;
            position: relative !important; 
            border: none !important; 
        }
        #reader__scan_region video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
        #reader__scan_region svg { display: none !important; }  /* Aggregate SVG removal */
        #reader__dashboard { 
            position: relative !important;
            display: flex !important; 
            flex-direction: column !important; 
            align-items: center !important; 
            padding: 20px 10px !important; 
            background: transparent !important;
            backdrop-filter: none !important;
            z-index: 30 !important;
            min-height: 80px !important;
        }
        .dark #reader__dashboard {
            background: rgba(0, 0, 0, 0.5) !important;
        }
        #reader__dashboard_section_csr button { 
            width: auto !important; 
            margin: 5px auto !important; 
            font-size: 10px !important;
            padding: 8px 16px !important;
        }
        #reader__status_span {
            font-size: 10px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
        }
        /* Ensure buttons are visible, hide only selection text and dropdown */
        #reader__dashboard_section_csr {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
        }
        #reader__dashboard_section_csr > span, 
        #reader__dashboard_section_csr > select { 
            display: none !important; 
        }
        #reader__dashboard_section_csr button {
            order: 1 !important;
        }
      `}} />
        </div>
    );
}
