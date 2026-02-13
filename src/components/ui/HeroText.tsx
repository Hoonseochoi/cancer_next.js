"use client";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroTextProps {
    text?: string;
    className?: string;
}

export default function HeroText({
    text = "HOONSEOCHOI",
    className = "",
}: HeroTextProps) {
    const [count, setCount] = useState(0);
    const characters = text.split("");

    // Auto-trigger animation on mount
    useEffect(() => {
        setCount(1);
    }, []);

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center h-full w-full bg-meritz-bg transition-colors duration-700",
                className
            )}
        >
            {/* Immersive Background Grid - Adjusted for Meritz Theme */}
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)`,
                    backgroundSize: "clamp(20px, 5vw, 60px) clamp(20px, 5vw, 60px)",
                }}
            />

            {/* Main Text Container */}
            <div className="relative z-10 w-full px-4 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={count}
                        className="flex flex-wrap justify-center items-center w-full"
                    >
                        {characters.map((char, i) => (
                            <div
                                key={i}
                                className="relative px-[0.1vw] overflow-hidden group"
                            >
                                {/* Main Character */}
                                <motion.span
                                    initial={{ opacity: 0, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, filter: "blur(0px)" }}
                                    transition={{ delay: i * 0.05 + 0.3, duration: 0.8 }}
                                    className="text-[10vw] md:text-[8rem] leading-none font-black text-meritz-text tracking-tighter"
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>

                                {/* Top Slice Layer - Meritz Red */}
                                <motion.span
                                    initial={{ x: "-100%", opacity: 0 }}
                                    animate={{ x: "100%", opacity: [0, 1, 0] }}
                                    transition={{
                                        duration: 0.8,
                                        delay: i * 0.05,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 text-[10vw] md:text-[8rem] leading-none font-black text-meritz-red z-10 pointer-events-none"
                                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)" }}
                                >
                                    {char}
                                </motion.span>

                                {/* Middle Slice Layer - Dark Red */}
                                <motion.span
                                    initial={{ x: "100%", opacity: 0 }}
                                    animate={{ x: "-100%", opacity: [0, 1, 0] }}
                                    transition={{
                                        duration: 0.8,
                                        delay: i * 0.05 + 0.1,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 text-[10vw] md:text-[8rem] leading-none font-black text-meritz-dark-red z-10 pointer-events-none"
                                    style={{
                                        clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
                                    }}
                                >
                                    {char}
                                </motion.span>

                                {/* Bottom Slice Layer - Meritz Red */}
                                <motion.span
                                    initial={{ x: "-100%", opacity: 0 }}
                                    animate={{ x: "100%", opacity: [0, 1, 0] }}
                                    transition={{
                                        duration: 0.8,
                                        delay: i * 0.05 + 0.2,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 text-[10vw] md:text-[8rem] leading-none font-black text-meritz-red z-10 pointer-events-none"
                                    style={{
                                        clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
                                    }}
                                >
                                    {char}
                                </motion.span>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Loading Indicator */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-12 text-meritz-text/60 text-lg font-medium animate-pulse"
            >
                제안서를 정밀 분석 중입니다...
            </motion.p>
        </div>
    );
}
