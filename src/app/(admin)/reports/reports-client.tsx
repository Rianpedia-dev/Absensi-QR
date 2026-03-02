"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Download, Loader2, FileSpreadsheet, ShieldCheck, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportAttendances } from "./actions";
import { motion } from "framer-motion";

export default function ReportsPage() {
    const [date, setDate] = useState<{ from: Date; to?: Date }>({
        from: new Date(),
        to: new Date()
    });
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!date.from) return;

        setIsExporting(true);
        try {
            // Format as YYYY-MM-DD
            const startDate = format(date.from, "yyyy-MM-dd");
            const endDate = date.to ? format(date.to, "yyyy-MM-dd") : startDate;

            const result = await exportAttendances(startDate, endDate);

            if (result.success && result.data) {
                // Konversi base64 kembali ke blob/buffer di client
                const binaryString = window.atob(result.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.filename || "Laporan_Absensi.xlsx";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert(result.error || "Terjadi kesalahan saat mengekspor");
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in-fade">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-6 border-primary/10">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100 uppercase">
                        Data <span className="text-primary italic">Export</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium italic">
                        Generate official attendance records in high-fidelity Excel format.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-emerald-500/5 px-4 py-2 rounded-2xl border border-emerald-500/10">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Secure Export Active</span>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:col-span-12 lg:col-span-5"
                >
                    <Card className="glass-card border-0 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold uppercase tracking-tight">Configuration</CardTitle>
                            </div>
                            <CardDescription className="italic">Tentukan rentang waktu data yang ingin ditarik dari sistem.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                                    <History className="w-3 h-3" /> Select Period Range
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full h-14 justify-start text-left font-bold rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                                            {date?.from ? (
                                                date.to ? (
                                                    <span className="text-sm">
                                                        {format(date.from, "dd MMM yyyy", { locale: id })} — {format(date.to, "dd MMM yyyy", { locale: id })}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm">{format(date.from, "dd MMM yyyy", { locale: id })}</span>
                                                )
                                            ) : (
                                                <span className="text-sm italic opacity-50">Silakan pilih tanggal...</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-white/10 glass-card" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={date?.from}
                                            selected={{
                                                from: date.from,
                                                to: date.to
                                            }}
                                            onSelect={(range: any) => setDate(range)}
                                            numberOfMonths={2}
                                            className="rounded-xl"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 group relative overflow-hidden"
                                    onClick={handleExport}
                                    disabled={!date?.from || isExporting}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-600 to-primary bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-10 transition-opacity" />
                                    {isExporting ? (
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    ) : (
                                        <Download className="mr-3 h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                                    )}
                                    {isExporting ? "GENERATING..." : "GENERATE EXCEL"}
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-12 lg:col-span-7 flex flex-col gap-6"
                >
                    <div className="glass-card p-8 rounded-[2rem] border-0 flex-1 flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <h3 className="text-2xl font-black italic mb-4">Export Protocol <span className="text-primary italic">Note</span></h3>
                        <ul className="space-y-4">
                            {[
                                "Data diekspor dalam format .xlsx (Microsoft Excel Open XML).",
                                "Laporan mencakup detail keterlambatan dan durasi kerja.",
                                "Hanya admin terverifikasi yang dapat mengunduh database.",
                                "Semua operasi ekspor dicatat dalam audit log sistem."
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-4 text-sm font-medium text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

