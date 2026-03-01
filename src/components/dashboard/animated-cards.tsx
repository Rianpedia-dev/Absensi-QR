"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardCardsProps {
    data: {
        totalEmployees: number;
        presentToday: number;
    }
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function AnimatedDashboardCards({ data }: DashboardCardsProps) {
    const cards = [
        {
            title: "Total Karyawan",
            value: data.totalEmployees,
            description: "Karyawan terdaftar",
            icon: Users,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-900/20"
        },
        {
            title: "Hadir Hari Ini",
            value: data.presentToday,
            description: "Karyawan sudah check-in",
            icon: CheckCircle2,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            title: "Belum Hadir",
            value: Math.max(0, data.totalEmployees - data.presentToday),
            description: "Belum melakukan absen",
            icon: Clock,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-900/20"
        }
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-3"
        >
            {cards.map((card, idx) => (
                <motion.div key={idx} variants={item}>
                    <Card className="glass-card hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full ${card.bg} group-hover:scale-110 transition-transform duration-500`} />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold tracking-wide uppercase opacity-70">{card.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${card.bg}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-black">{card.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${card.color.replace('text', 'bg')}`} />
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
}
