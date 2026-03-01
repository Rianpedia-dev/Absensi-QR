"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 glass-card border-white/5 hover:bg-primary/10 transition-all active:scale-95">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/10 rounded-2xl p-1 min-w-[120px]">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 focus:bg-primary focus:text-white transition-colors cursor-pointer"
                >
                    <Sun className="h-3.5 w-3.5" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 focus:bg-primary focus:text-white transition-colors cursor-pointer"
                >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 focus:bg-primary focus:text-white transition-colors cursor-pointer"
                >
                    <Monitor className="h-3.5 w-3.5" />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
