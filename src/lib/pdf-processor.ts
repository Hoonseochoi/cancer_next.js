// Top-level import removed. Using dynamic import in extractTextFromPDF.
// import * as pdfjsLib from 'pdfjs-dist'; 


import { ExtractedCoverage } from "@/types";



export async function extractTextFromPDF(file: File, onProgress?: (progress: number, message: string) => void): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist');

    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    const startPage = Math.min(3, pdf.numPages);
    const endPage = Math.min(6, pdf.numPages); // Adjust range as per original logic
    const totalPagesToProcess = endPage - startPage + 1;

    for (let i = startPage; i <= endPage; i++) {
        onProgress?.(Math.round(((i - startPage) / totalPagesToProcess) * 100), `${i}페이지 분석 중...`);

        try {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();

            // @ts-ignore
            const items: any[] = content.items;

            if (items.length > 0) {
                // Sort items by Y (top to bottom) then X (left to right)
                // Note: PDF coordinate system has (0,0) at bottom-left, so higher Y is higher up on page
                const mappedItems = items.map((item: any) => ({
                    str: item.str,
                    x: item.transform[4],
                    y: item.transform[5],
                    w: item.width,
                    h: item.height,
                    hasEOL: item.hasEOL
                }));

                mappedItems.sort((a, b) => {
                    if (Math.abs(a.y - b.y) < 5) {
                        return a.x - b.x;
                    }
                    return b.y - a.y; // Descending Y for top-to-bottom
                });

                let lastY = mappedItems[0].y;
                let lastX = mappedItems[0].x;
                let pageText = "";

                for (const item of mappedItems) {
                    if (Math.abs(item.y - lastY) > 8) {
                        pageText += "\n";
                    } else if (item.x - lastX > 5) {
                        pageText += " ";
                    }
                    pageText += item.str;
                    lastY = item.y;
                    lastX = item.x + item.w;
                }
                fullText += pageText + '\n';
            }
        } catch (error) {
            console.error(`Error processing page ${i}:`, error);
        }
    }

    onProgress?.(100, "분석 완료");
    return fullText;
}

export function extractRawCoverages(text: string): ExtractedCoverage[] {
    if (!text) return [];

    const lines = text.split('\n');
    let targetLines = lines;
    let startIndex = -1;
    let endIndex = -1;

    // Keywords defined in original script.js
    const startKeywords = ["가입담보리스트", "가입담보", "담보사항"];
    const endKeywords = ["주의사항", "유의사항", "알아두실"];

    // Find range
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/\s+/g, '');
        if (startIndex === -1 && line.length < 40 && startKeywords.some(k => line.includes(k))) {
            startIndex = i;
        } else if (endIndex === -1 && startIndex !== -1 && line.length < 40 && endKeywords.some(k => line.includes(k))) {
            endIndex = i;
            break;
        }
    }

    if (startIndex !== -1) {
        if (endIndex === -1) endIndex = lines.length;
        targetLines = lines.slice(startIndex, endIndex);
    }

    // Line Merging Logic
    const amountRegex = /[0-9,]+(?:억|천|백|십)*(?:만원|억원|만|억)|세부보장참조/;
    const mergedLines: string[] = [];
    let pendingLine = '';

    for (const line of targetLines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (pendingLine) { mergedLines.push(pendingLine); pendingLine = ''; }
            continue;
        }

        const hasAmount = amountRegex.test(trimmed);

        if (pendingLine) {
            pendingLine += ' ' + trimmed;
            if (hasAmount || amountRegex.test(pendingLine)) {
                mergedLines.push(pendingLine);
                pendingLine = '';
            }
        } else {
            if (hasAmount) {
                mergedLines.push(trimmed);
            } else if (trimmed.length < 5 || /^\d+$/.test(trimmed)) {
                mergedLines.push(trimmed);
            } else {
                pendingLine = trimmed;
            }
        }
    }
    if (pendingLine) mergedLines.push(pendingLine);

    // Extraction Logic
    const blacklist = [
        "해당 상품은", "경우", "따라", "법에", "지급하여", "포함되어", "보호법",
        "해약환급금", "예시표", "적용이율", "최저보증", "평균공시",
        "가입금액인", "00만원", "00원", "합계", "점검",
        "참고", "확인하시기", "바랍니다", "입니다", "됩니다",
        "최초계약", "경과시점", "감액적용", "면책",
        "법률상", "부담하여", "손해를", "배상책임을",
        "이전 진단", "이전 수술", "이전 치료",
        "같은 질병", "같은 종류", "반은 경",
        "※", "보장개시", "납입면제",
        "남성", "여성", "만기", "가입금액"
    ];

    const results: ExtractedCoverage[] = [];

    mergedLines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (blacklist.some(word => trimmed.includes(word))) return;
        if (trimmed.startsWith("세부보장")) return;

        let match = trimmed.match(/([0-9,]+(?:억|천|백|십)*(?:만원|억원|만|억))/);
        if (!match) match = trimmed.match(/([0-9,]+(?:천|백|십)?원)/);
        if (!match && trimmed.includes('세부보장참조')) {
            const refMatch = trimmed.match(/세부보장참조/);
            if (refMatch) {
                match = refMatch;
                // Hack to treat it as match
                (match as any)[1] = '세부보장참조';
            }
        }

        if (match) {
            const amountStr = match[1];
            let namePart = trimmed.substring(0, match.index).trim();

            // Name Cleaning (from original script)
            namePart = namePart.replace(/^[\d]+(년|세|월)\s*[\/]?\s*[\d]*(년|세|월)?\s*/, '').trim();
            namePart = namePart.replace(/^[\d]+\s+/, '').trim();

            const categoryKeywords = ["기본계약", "3대진단", "치료비", "수술비", "입원비", "배상책임", "후유장해", "기타", "2대진단", "질병", "상해", "운전자"];
            for (const key of categoryKeywords) {
                const regex = new RegExp('^' + key + '(?=[\\s\\d])');
                if (regex.test(namePart)) namePart = namePart.replace(regex, '').trim();
            }
            namePart = namePart.replace(/^[\d]+\s+/, '');
            namePart = namePart.replace(/^[ㄴ\-•·\s]+/, '');
            namePart = namePart.replace(/^[\d]+\s+/, '');
            namePart = namePart.replace(/[.\s]+$/, '');
            namePart = namePart.replace(/세부보장참조/g, '').trim();
            namePart = namePart.replace(/^\([^)]*\)/, '').trim();
            namePart = namePart.replace(/([가-힣])\d+$/, '$1').trim();

            // Suffix parsing
            let suffix = trimmed.substring((match.index || 0) + match[0].length).trim();
            let premium = "-";
            let period = "-";

            const premiumMatch = suffix.match(/([0-9,]+)/);
            if (premiumMatch) {
                premium = premiumMatch[1] + "원";
                suffix = suffix.substring(premiumMatch.index! + premiumMatch[0].length).trim();
            }

            const periodMatch = suffix.match(/([0-9]+\s*년\s*\/?[^]*)/);
            if (periodMatch) {
                period = periodMatch[1].trim();
            }

            if (namePart.length > 1 && namePart.length < 120) {
                const lastChar = namePart.slice(-1);
                if (!['다', '요', '음', '함', '는', '은'].includes(lastChar)) {
                    results.push({
                        id: (startIndex === -1 ? 0 : startIndex) + idx,
                        name: namePart,
                        amount: amountStr,
                        premium: premium,
                        period: period,
                        original: trimmed
                    });
                }
            }
        }
    });

    return results;
}
