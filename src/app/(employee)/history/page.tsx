"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getMyHistory } from "./actions";
import { Loader2, CalendarClock, LogIn, LogOut, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function EmployeeHistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            const data = await getMyHistory();
            setHistory(data);
            setLoading(false);
        }
        fetchHistory();
    }, []);

    return (
        <div className="space-y-8 animate-in-fade max-w-lg mx-auto pb-12">
            <div className="px-2">
                <h1 className="text-3xl font-black tracking-tight uppercase italic">
                    My <span className="text-primary not-italic">ATTENDANCE</span>
                </h1>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Log kehadiran personal Anda.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Accessing History...</span>
                </div>
            ) : history.length === 0 ? (
                <Card className="glass-card border-dashed border-2 border-white/10 bg-transparent py-20">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <CalendarClock className="w-16 h-16 mb-6 text-primary opacity-10" />
                        <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Belum ada catatan aktivitas.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence>
                        {history.map((record, idx) => (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="glass-card border-0 shadow-xl overflow-hidden group">
                                    <div className="bg-white/5 dark:bg-zinc-900/50 px-5 py-3 border-b border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                                {format(new Date(record.date), "EEEE, d MMM yyyy", { locale: id })}
                                            </span>
                                        </div>
                                        {record.checkOut ? (
                                            <div className="flex items-center gap-1 bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-lg border border-blue-500/20">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase">COMPLETED</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-lg border border-emerald-500/20 animate-pulse">
                                                <Circle className="w-3 h-3 fill-emerald-500" />
                                                <span className="text-[9px] font-black uppercase">SESSION ACTIVE</span>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-2 divide-x divide-white/5">
                                            <div className="p-6 flex flex-col items-center justify-center group-hover:bg-primary/5 transition-colors">
                                                <div className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5 mb-2">
                                                    <LogIn className="w-3 h-3 text-primary" /> Check-in
                                                </div>
                                                <div className="text-3xl font-black italic tracking-tighter text-gray-800 dark:text-gray-100">
                                                    {format(new Date(record.checkIn), "HH:mm")}
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col items-center justify-center group-hover:bg-indigo-500/5 transition-colors">
                                                <div className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5 mb-2">
                                                    <LogOut className="w-3 h-3 text-indigo-500" /> Check-out
                                                </div>
                                                <div className={cn(
                                                    "text-3xl font-black italic tracking-tighter",
                                                    record.checkOut ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-zinc-700 opacity-30"
                                                )}>
                                                    {record.checkOut ? format(new Date(record.checkOut), "HH:mm") : "--:--"}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

