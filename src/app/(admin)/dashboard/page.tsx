import { db } from "@/lib/db";
import { attendances, user } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatedDashboardCards } from "@/components/dashboard/animated-cards";
import { format } from "date-fns";
import { id } from "date-fns/locale";

async function getDashboardData() {
    // Get today's date in YYYY-MM-DD format based on local time
    const today = new Date().toLocaleDateString("en-CA"); // Gets YYYY-MM-DD safely

    // Total employees
    const employeesRecord = await db.select().from(user).where(eq(user.role, "EMPLOYEE"));
    const totalEmployees = employeesRecord.length;

    // Today's attendances joined with users
    const todayAttendances = await db.select({
        id: attendances.id,
        userId: attendances.userId,
        checkIn: attendances.checkIn,
        checkOut: attendances.checkOut,
        userName: user.name,
        userEmail: user.email
    })
        .from(attendances)
        .leftJoin(user, eq(attendances.userId, user.id))
        .where(eq(attendances.date, today))
        .orderBy(desc(attendances.checkIn));

    return {
        totalEmployees,
        presentToday: todayAttendances.length,
        attendances: todayAttendances,
    };
}

export default async function DashboardPage() {
    const data = await getDashboardData();
    const todayFormatted = format(new Date(), "EEEE, d MMMM yyyy", { locale: id });

    return (
        <div className="space-y-8 animate-in-fade">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 border-primary/10">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                        Monitor <span className="text-primary">Dashboard</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Selamat datang kembali, Admin. Berikut ringkasan kehadiran hari ini.
                    </p>
                </div>
                <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 flex items-center shadow-inner">
                    <span className="text-sm font-bold text-primary">{todayFormatted}</span>
                </div>
            </div>

            <AnimatedDashboardCards data={data} />

            <Card className="glass-card overflow-hidden transition-all duration-300">
                <CardHeader className="border-b bg-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Log Absensi Terkini</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Daftar kehadiran karyawan yang diperbarui secara real-time.</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold py-4">Nama Karyawan</TableHead>
                                    <TableHead className="font-bold py-4">Check-in</TableHead>
                                    <TableHead className="font-bold py-4">Check-out</TableHead>
                                    <TableHead className="font-bold py-4 text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.attendances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground opacity-50 italic">
                                            Belum ada aktivitas absensi hari ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.attendances.map((record) => (
                                        <TableRow key={record.id} className="hover:bg-primary/5 transition-colors group">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                                        {record.userName?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold group-hover:text-primary transition-colors">{record.userName || "Unknown"}</div>
                                                        <div className="text-xs text-muted-foreground">{record.userEmail || "No Email"}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono font-medium">
                                                {format(new Date(record.checkIn), "HH:mm")}
                                            </TableCell>
                                            <TableCell className="font-mono font-medium">
                                                {record.checkOut ? format(new Date(record.checkOut!), "HH:mm") : <span className="text-muted-foreground opacity-30 italic">Belum</span>}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {record.checkOut ? (
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10">Selesai</span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20 animate-pulse">Aktif</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

