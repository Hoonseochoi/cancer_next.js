"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeroGeometric } from "@/components/ui/HeroGeometric";
import HeroText from "@/components/ui/HeroText";
import { PDFUploader } from "@/components/Analyzer/PDFUploader";
import { AnalysisResults } from "@/components/Analyzer/AnalysisResults";
import { type CoverageItem, type AnalysisSummary } from "@/types";
import { extractTextFromPDF, extractRawCoverages } from "@/lib/pdf-processor";
import { analyzeCoverages } from "@/lib/analyzer-logic";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    items: CoverageItem[];
    summary: AnalysisSummary;
  } | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setProgress(0);

    try {
      // 1. Extract Text
      setStatusText("PDF 텍스트 추출 중...");
      const text = await extractTextFromPDF(file, (p, msg) => {
        setProgress(p);
        setStatusText(msg);
      });

      // 2. Extract Raw Coverages
      setStatusText("보장 내역 분석 중...");
      const rawCoverages = extractRawCoverages(text);

      // 3. Analyze & Categorize
      setStatusText("데이터 정밀 분석 중...");
      const result = analyzeCoverages(rawCoverages);

      // Simulate a short delay for better UX if it was too fast
      await new Promise(resolve => setTimeout(resolve, 2500));

      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("파일 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
      setStatusText("");
    }
  };

  return (
    <main className="min-h-screen bg-meritz-bg selection:bg-meritz-red/20 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="analyzing-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-50 bg-meritz-bg"
          >
            <HeroText />
          </motion.div>
        ) : !analysisResult ? (
          <motion.div
            key="input-section"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.8 } }}
            className="relative z-10"
          >
            <HeroGeometric
              badge="Meritz Fire & Marine Insurance"
              title1="암 치료비"
              title2="정밀 분석 시스템"
            >
              <div className="w-full max-w-lg mx-auto">
                <div className="bg-white/80 backdrop-blur-md p-1 rounded-[2.5rem] shadow-2xl border border-white/50">
                  <PDFUploader
                    onFileSelected={handleFileSelected}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              </div>
            </HeroGeometric>
          </motion.div>
        ) : (
          <motion.div
            key="result-section"
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 min-h-screen bg-meritz-bg pb-20"
          >
            <div className="fixed top-6 right-6 z-50">
              <button
                onClick={() => setAnalysisResult(null)}
                className="bg-white/80 backdrop-blur hover:bg-white text-meritz-text/60 hover:text-meritz-red px-5 py-2.5 rounded-full text-sm font-bold shadow-lg border border-meritz-gray/10 transition-all"
              >
                ↺ 다른 파일 분석하기
              </button>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-meritz-red/[0.02] via-transparent to-meritz-dark-red/[0.02] blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 pt-10">
              <AnalysisResults
                items={analysisResult.items}
                summary={analysisResult.summary}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Copyright */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 py-6 text-center text-meritz-text/30 text-[10px] pointer-events-none z-0"
        animate={{ opacity: analysisResult ? 0 : 1 }}
      >
        <p>본 분석 결과는 단순 참고용이며, 실제 가입 설계 내용과 다를 수 있습니다.</p>
        <p className="mt-1">© 2026 Meritz Fire & Marine Insurance Co., Ltd. All Rights Reserved.</p>
      </motion.div>
    </main>
  );
}
