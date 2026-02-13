"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Shield, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CoverageSummaryScroll } from "./CoverageSummaryScroll";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

import { CoverageItem, AnalysisSummary } from "@/types";

interface AnalysisResultsProps {
    items: CoverageItem[];
    summary: AnalysisSummary;
}

function ResultCard({ title, value, subtext, icon: Icon, colorClass, delay }: {
    title: string;
    value: string | number;
    subtext: string;
    icon: any;
    colorClass: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.5 }}
            className="bg-white p-6 rounded-3xl border border-meritz-gray/10 shadow-lg hover:shadow-xl transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl bg-opacity-10", colorClass.replace('text-', 'bg-'))}>
                    <Icon className={cn("w-6 h-6", colorClass)} />
                </div>
            </div>
            <h3 className="text-3xl font-black text-meritz-text mb-1 tracking-tight">{value}</h3>
            <p className="text-sm font-bold text-meritz-text/80 mb-1">{title}</p>
            <p className="text-xs text-meritz-text/50">{subtext}</p>
        </motion.div>
    );
}

export function AnalysisResults({ items, summary }: AnalysisResultsProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 mb-24">

            {/* Header */}
            <div className="text-center mb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-meritz-red/10 text-meritz-red text-sm font-bold mb-4"
                >
                    <CheckCircle2 size={16} />
                    분석 완료
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-black text-meritz-text mb-3">
                    전체 보장 내역 분석 결과
                </h2>
                <p className="text-meritz-text/60">
                    추출된 암 치료비 관련 담보 내역입니다.
                </p>
            </div>



            {/* Tablet Scroll View for Treatment Costs */}
            <div id="summary-section" className="mb-10 relative p-8 md:p-12 bg-meritz-bg rounded-[2.5rem]">
                <CoverageSummaryScroll summary={summary} />
            </div>

            <div className="flex justify-center mb-24">
                <Button
                    variant="primary"
                    size="lg"
                    className="pl-6 pr-8 py-6 rounded-full text-base font-bold shadow-xl hover:shadow-Meritz-red/20 hover:scale-105 transition-all"
                    onClick={async () => {
                        // Change target to the inner grid for full content capture
                        const element = document.getElementById('summary-content-grid');
                        if (element) {
                            try {
                                const canvas = await html2canvas(element, {
                                    scale: 3, // Higher resolution
                                    backgroundColor: "#EBEBEB", // Match Meritz BG
                                    useCORS: true,
                                    logging: false,
                                    allowTaint: true,
                                    ignoreElements: (el) => el.tagName === 'BUTTON',
                                    onclone: (clonedDoc) => {
                                        // Optional: Add padding to cloned element if needed for better look
                                        const clonedElement = clonedDoc.getElementById('summary-content-grid');
                                        if (clonedElement) {
                                            clonedElement.style.padding = "40px";
                                            clonedElement.style.borderRadius = "30px";
                                        }
                                    }
                                });
                                const link = document.createElement('a');
                                link.download = 'Meritz_Cancer_Analysis_Summary.png';
                                link.href = canvas.toDataURL('image/png');
                                link.click();
                            } catch (err) {
                                console.error("Failed to save image", err);
                                alert("이미지 저장에 실패했습니다.");
                            }
                        }
                    }}
                >
                    <Download className="mr-2" size={20} />
                    이미지를 갤러리에 저장하기
                </Button>
            </div>

            {/* Details Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] shadow-xl border border-meritz-gray/10 overflow-hidden"
            >
                <div
                    className="p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-meritz-bg/30 transition-colors"
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-meritz-text/5 flex items-center justify-center">
                            <FileTextIcon className="text-meritz-text/70" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-meritz-text">상세 보장 내역</h3>
                            <p className="text-sm text-meritz-text/50">추출된 담보 리스트 확인</p>
                        </div>
                    </div>


                    <button className="p-2 rounded-full hover:bg-meritz-bg">
                        {isDetailsOpen ? <ChevronUp className="text-meritz-text/50" /> : <ChevronDown className="text-meritz-text/50" />}
                    </button>
                </div>

                <AnimatePresence>
                    {isDetailsOpen && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-meritz-bg/10"
                        >
                            <motion.ul
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="divide-y divide-meritz-gray/10"
                            >
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <CoverageListItem key={item.id} item={item} itemVariant={itemVariant} />
                                    ))
                                ) : (
                                    <li className="p-12 text-center text-meritz-text/40">
                                        추출된 담보 내역이 없습니다.
                                    </li>
                                )}
                            </motion.ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function CoverageListItem({ item, itemVariant }: { item: CoverageItem; itemVariant: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubDetails = item.subDetails && item.subDetails.length > 0;

    return (
        <motion.li
            variants={itemVariant}
            className="group p-5 md:px-8 hover:bg-white transition-colors border-b border-meritz-gray/5 last:border-0"
        >
            <div
                className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer", hasSubDetails ? "" : "cursor-default")}
                onClick={() => hasSubDetails && setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-meritz-text/10 text-meritz-text/60">
                            NO. {item.id}
                        </span>
                        {item.status === 'warning' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-meritz-red/10 text-meritz-red">
                                확인 필요
                            </span>
                        )}
                        {hasSubDetails && (
                            <span className="ml-auto md:ml-2 text-xs text-meritz-text/40 flex items-center gap-1 group-hover:text-meritz-red transition-colors">
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {isExpanded ? "접기" : "상세보기"}
                            </span>
                        )}
                    </div>
                    <h4 className="text-base font-bold text-meritz-text break-keep leading-snug">
                        {item.name}
                    </h4>
                    <p className="text-xs text-meritz-text/40 mt-1 font-mono">
                        {item.original}
                    </p>
                </div>

                <div className="flex items-center gap-6 md:gap-10 self-end md:self-center">
                    <div className="text-right">
                        <span className="block text-xs text-meritz-text/40 mb-0.5">가입금액</span>
                        <span className="text-lg font-black text-meritz-dark-red tracking-tight">
                            {item.amount}
                        </span>
                    </div>
                    <div className="text-right min-w-[80px]">
                        <span className="block text-xs text-meritz-text/40 mb-0.5">보험료</span>
                        <span className="text-sm font-bold text-meritz-text">
                            {item.premium}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sub Details */}
            <AnimatePresence>
                {hasSubDetails && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-meritz-gray/10 bg-meritz-bg/30 -mx-5 px-5 md:-mx-8 md:px-8 py-4 rounded-b-xl">
                            <h5 className="text-xs font-bold text-meritz-text/60 mb-2">세부 보장 내역</h5>
                            <ul className="space-y-2">
                                {item.subDetails!.map((sub, idx) => (
                                    <li key={idx} className="flex justify-between text-sm">
                                        <span className="text-meritz-text/80">• {sub.name}</span>
                                        <span className="font-bold text-meritz-text/60">{sub.amount}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.li>
    );
}

function FileTextIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-6 h-6", className)}
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    )
}
