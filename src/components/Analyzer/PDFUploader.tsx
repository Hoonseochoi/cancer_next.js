"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFUploaderProps {
    onFileSelected: (file: File) => void;
    isAnalyzing?: boolean;
}

export function PDFUploader({ onFileSelected, isAnalyzing = false }: PDFUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const validateAndSetFile = (selectedFile: File) => {
        if (selectedFile.type !== "application/pdf") {
            setError("PDF 파일만 업로드 가능합니다.");
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            setError("파일 크기는 10MB 이하여야 합니다.");
            return;
        }
        setError(null);
        setFile(selectedFile);
        onFileSelected(selectedFile);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    }, [onFileSelected]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const clearFile = () => {
        setFile(null);
        setError(null);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <label
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 backdrop-blur-sm",
                                isDragOver
                                    ? "border-meritz-red bg-meritz-red/5 scale-105"
                                    : "border-meritz-gray/30 bg-white/50 hover:bg-white/80 hover:border-meritz-red/50"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                <motion.div
                                    animate={isDragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                                    className="mb-4 text-meritz-gray"
                                >
                                    <UploadCloud size={48} className={isDragOver ? "text-meritz-red" : ""} />
                                </motion.div>
                                <p className="mb-2 text-lg font-bold text-meritz-text">
                                    가입제안서 PDF 업로드
                                </p>
                                <p className="text-sm text-meritz-text/60">
                                    파일을 드래그하거나 클릭하여 선택하세요
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={handleFileInput}
                            />
                        </label>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-2 mt-3 text-sm text-meritz-red font-medium justify-center"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="file-preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full p-6 bg-white rounded-3xl shadow-xl border border-meritz-gray/10"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-meritz-red/10 rounded-2xl">
                                <FileText size={32} className="text-meritz-red" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-meritz-text truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-meritz-text/50 mt-1">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {isAnalyzing && (
                                    <div className="mt-3">
                                        <div className="h-1.5 w-full bg-meritz-bg rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-meritz-red"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-meritz-red mt-1.5 font-medium animate-pulse">
                                            정밀 분석 중...
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!isAnalyzing && (
                                <button
                                    onClick={clearFile}
                                    className="p-1.5 hover:bg-meritz-bg rounded-full transition-colors text-meritz-gray hover:text-meritz-text"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
