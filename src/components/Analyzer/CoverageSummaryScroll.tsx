"use client";
import React from "react";
import { ContainerScroll } from "../ui/container-scroll-animation";
import { AnalysisSummary, SummaryGroup } from "@/types";
import { motion } from "framer-motion";

export function CoverageSummaryScroll({ summary }: { summary: AnalysisSummary }) {
    if (!summary.groups || summary.groups.length === 0) return null;

    return (
        <div className="flex flex-col overflow-hidden">
            <ContainerScroll
                titleComponent={
                    <>
                        <h1 className="text-4xl font-semibold text-meritz-text dark:text-white">
                            암치료비 한눈에 보기 <br />
                            <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-meritz-red">
                                보장 분석 요약
                            </span>
                        </h1>
                    </>
                }
            >
                <div id="summary-content-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-full bg-white dark:bg-black rounded-2xl">
                    {summary.groups.map((group, idx) => (
                        <SummaryCard key={idx} group={group} index={idx} />
                    ))}
                </div>
            </ContainerScroll>
        </div>
    );
}

function SummaryCard({ group, index }: { group: SummaryGroup; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col gap-2 p-4 rounded-xl border border-[#8C8C8C1A] shadow-sm bg-white hover:shadow-md transition-all sm:p-5"
        >
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-meritz-text truncate">{group.name}</h3>
            </div>

            <div className="text-2xl font-black text-meritz-red my-1">
                {formatAmount(group.totalMin)}
            </div>

            <div className="flex-1 space-y-2 mt-2 pr-1">
                {group.items.map((item, idx) => (
                    <div key={idx} className="bg-[#EBEBEB0D] p-2 rounded-lg text-sm">
                        <div className="flex justify-between items-start gap-2">
                            <span className="text-[#404040B3] break-keep text-xs leading-snug">{item.name}</span>
                            <span className="font-bold text-meritz-text whitespace-nowrap text-xs">{item.amount}</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function formatAmount(val: number): string {
    if (val === 0) return "0원";
    let uk = Math.floor(val / 10000);
    let man = val % 10000;
    let result = "";
    if (uk > 0) result += `${uk}억 `;
    if (man > 0) result += `${man.toLocaleString()}만`;
    return result.trim() + "원";
}
