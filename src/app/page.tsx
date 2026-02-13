"use client";

import { useState } from "react";
import { HeroGeometric } from "@/components/ui/HeroGeometric";
import { PDFUploader } from "@/components/Analyzer/PDFUploader";
import { AnalysisResults, type CoverageItem, type AnalysisSummary } from "@/components/Analyzer/AnalysisResults";
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
      await new Promise(resolve => setTimeout(resolve, 800));

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
    <main className="min-h-screen bg-meritz-bg selection:bg-meritz-red/20">
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
          {isAnalyzing && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-meritz-red/10 shadow-sm">
                <div className="w-4 h-4 rounded-full border-2 border-meritz-red border-t-transparent animate-spin" />
                <span className="text-sm font-medium text-meritz-text/80">{statusText} ({progress}%)</span>
              </div>
            </div>
          )}
        </div>
      </HeroGeometric>

      {analysisResult && (
        <div id="results-section" className="relative z-20 -mt-20 px-4 pb-20">
          <AnalysisResults
            items={analysisResult.items}
            summary={analysisResult.summary}
          />
        </div>
      )}

      {/* Footer / Copyright */}
      <div className="py-8 text-center text-meritz-text/30 text-xs text-balance">
        <p>본 분석 결과는 단순 참고용이며, 실제 가입 설계 내용과 다를 수 있습니다.</p>
        <p className="mt-1">© 2026 Meritz Fire & Marine Insurance Co., Ltd. All Rights Reserved.</p>
      </div>
    </main>
  );
}
