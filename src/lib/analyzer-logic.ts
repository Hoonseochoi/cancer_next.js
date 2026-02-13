import { ExtractedCoverage, CoverageItem, AnalysisSummary } from "@/types";

// ── Helper: Parse Korean Amount ──
function parseKoAmount(str: string): number {
    if (!str) return 0;
    // Remove "원", ",", " "
    let clean = str.replace(/[원,\s]/g, '');
    let val = 0;

    // Handle cases like "1000만(3000만)" -> take first number
    if (clean.includes('(')) {
        clean = clean.split('(')[0];
    }

    // Check units
    if (clean.includes('억')) {
        let parts = clean.split('억');
        let uk = parseInt(parts[0]) || 0;
        let rest = parts[1] || '';
        val += uk * 10000; // 만원 단위로 계산 (1억 = 10000만)
        if (rest.includes('천')) {
            val += (parseInt(rest.replace('천', '')) || 0) * 1000;
        } else if (rest.includes('만')) {
            val += parseInt(rest.replace('만', '')) || 0;
        }
    } else if (clean.includes('천만')) {
        val = (parseInt(clean.replace('천만', '')) || 0) * 1000;
    } else if (clean.includes('백만')) {
        val = (parseInt(clean.replace('백만', '')) || 0) * 100;
    } else if (clean.includes('만')) {
        val = parseInt(clean.replace('만', '')) || 0;
    } else {
        val = parseInt(clean) || 0;
    }
    return val; // 만원 단위 반환
}

function formatKoAmount(val: number): string {
    if (val === 0) return "0원";
    let uk = Math.floor(val / 10000);
    let man = val % 10000;
    let result = "";
    if (uk > 0) result += `${uk}억 `;
    if (man > 0) result += `${man.toLocaleString()}만`;
    return result.trim() + "원";
}

// ── Coverage Detail Dictionary (Ported from script.js) ──
// Types for the map
type VariantData = {
    [amount: string]: { name: string; amount: string; maxAmount?: string; sub?: string[]; hiddenInDetail?: boolean }[];
};

type CoverageDetail =
    | { type: 'variant'; data: VariantData }
    | { type: 'passthrough'; displayName: string }
    | { type: '26jong'; detailName: string; summaryItems: { name: string; targetName?: string }[] };

const coverageDetailsMap: Record<string, CoverageDetail> = {
    // 4. 비급여(상급종합병원 포함)형
    "암 통합치료비(비급여(전액본인부담 포함), 암중점치료기관(상급종합병원 포함))": {
        "type": "variant",
        "data": {
            "8000": [
                { name: "(매회) (비급여)다빈치로봇수술비", amount: "1,000만" },
                { name: "(연1회) (비급여) 표적항암약물치료비", amount: "3,000만" },
                { name: "(연1회) (비급여) 면역항암약물치료비", amount: "6,000만" },
                { name: "(연1회) (비급여) 양성자방사선 치료비", amount: "3,000만" }
            ],
            "5000": [
                { name: "(매회) (비급여)다빈치로봇수술비", amount: "750만" },
                { name: "(연1회) (비급여) 표적항암약물치료비", amount: "2,000만" },
                { name: "(연1회) (비급여) 면역항암약물치료비", amount: "4,000만" },
                { name: "(연1회) (비급여) 양성자방사선 치료비", amount: "2,000만" }
            ],
            "2000": [
                { name: "(매회) (비급여)다빈치로봇수술비", amount: "500만" },
                { name: "(연1회) (비급여) 표적항암약물치료비", amount: "1,000만" },
                { name: "(연1회) (비급여) 면역항암약물치료비", amount: "2,000만" },
                { name: "(연1회) (비급여) 양성자방사선 치료비", amount: "1,000만" }
            ]
        }
    },
    // 1. 기본형
    "암 통합치료비(기본형)(암중점치료기관(상급종합병원 포함))": {
        "type": "variant",
        "data": {
            "10000": [
                { name: "(매회) (급여/비급여) 암 수술비", amount: "1,000만" },
                { name: "(매회) 다빈치 로봇 수술비", amount: "2,000만", sub: ["(매회) (급여/비급여) 암 수술비 1,000만", "(매회) (비급여) 다빈치 로봇 수술 1,000만"] },
                { name: "(연1회) (급여/비급여) 항암 약물 치료비", amount: "1,000만" },
                { name: "(연1회) (급여/비급여) 항암 방사선 치료비", amount: "1,000만" },
                { name: "(연1회) 표적 항암 약물 치료비", amount: "4,000만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 1,000만", "(연1회) (비급여) 표적 항암 약물 치료비 3,000만"] },
                { name: "(연1회) 면역 항암 약물 치료비", amount: "7,000만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 1,000만", "(연1회) (비급여) 표적 항암 약물 치료비 3,000만", "(연1회) (비급여) 면역 항암 약물 치료비 3,000만"] },
                { name: "(연1회) 양성자 방사선 치료비", amount: "4,000만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 1,000만", "(연1회) (비급여) 양성자 방사선 치료비 3,000만"] },
                { name: "(연1회) 중입자 방사선 치료비", amount: "1,000만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 1,000만"] },
                { name: "(연1회) 세기조절방사선치료비", amount: "1,000만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 1,000만"] }
            ],
            "8000": [
                { name: "(매회) (급여/비급여) 암 수술비", amount: "750만" },
                { name: "(매회) 다빈치 로봇 수술비", amount: "1,500만", sub: ["(매회) (급여/비급여) 암 수술비 750만", "(매회) (비급여) 다빈치 로봇 수술 750만"] },
                { name: "(연1회) (급여/비급여) 항암 약물 치료비", amount: "750만" },
                { name: "(연1회) (급여/비급여) 항암 방사선 치료비", amount: "750만" },
                { name: "(연1회) 표적 항암 약물 치료비", amount: "2,750만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 750만", "(연1회) (비급여) 표적 항암 약물 치료비 2,000만"] },
                { name: "(연1회) 면역 항암 약물 치료비", amount: "4,750만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 750만", "(연1회) (비급여) 표적 항암 약물 치료비 2,000만", "(연1회) (비급여) 면역 항암 약물 치료비 2,000만"] },
                { name: "(연1회) 양성자 방사선 치료비", amount: "2,750만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 750만", "(연1회) (비급여) 양성자 방사선 치료비 2,000만"] },
                { name: "(연1회) 중입자 방사선 치료비", amount: "750만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 750만"] },
                { name: "(연1회) 세기조절방사선치료비", amount: "750만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 750만"] }
            ],
            "4000": [
                { name: "(매회) (급여/비급여) 암 수술비", amount: "500만" },
                { name: "(매회) 다빈치 로봇 수술비", amount: "1,000만", sub: ["(매회) (급여/비급여) 암 수술비 500만", "(매회) (비급여) 다빈치 로봇 수술 500만"] },
                { name: "(연1회) (급여/비급여) 항암 약물 치료비", amount: "500만" },
                { name: "(연1회) (급여/비급여) 항암 방사선 치료비", amount: "500만" },
                { name: "(연1회) 표적 항암 약물 치료비", amount: "1,500만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 500만", "(연1회) (비급여) 표적 항암 약물 치료비 1,000만"] },
                { name: "(연1회) 면역 항암 약물 치료비", amount: "2,500만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 500만", "(연1회) (비급여) 표적 항암 약물 치료비 1,000만", "(연1회) (비급여) 면역 항암 약물 치료비 1,000만"] },
                { name: "(연1회) 양성자 방사선 치료비", amount: "1,500만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 500만", "(연1회) (비급여) 양성자 방사선 치료비 1,000만"] },
                { name: "(연1회) 중입자 방사선 치료비", amount: "500만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 500만"] },
                { name: "(연1회) 세기조절방사선치료비", amount: "500만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 500만"] }
            ]
        }
    },
    // 1-1. 실속형
    "암 통합치료비(실속형)(암중점치료기관(상급종합병원 포함))": {
        "type": "variant",
        "data": {
            "7000": [
                { name: "(매회) (급여/비급여) 암 수술비", amount: "1,000만" },
                { name: "(매회) 다빈치 로봇 수술비", amount: "1,000만", sub: ["(매회) (급여/비급여) 암 수술비 1,000만"] },
                { name: "(연1회) (급여/비급여) 항암 약물 치료비", amount: "1,000만" },
                { name: "(연1회) (급여/비급여) 항암 방사선 치료비", amount: "1,000만" },
                { name: "(연1회) 표적 항암 약물 치료비", amount: "2,000만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 1,000만", "(연1회) (비급여) 표적 항암 약물 치료비 1,000만"] },
                { name: "(연1회) 면역 항암 약물 치료비", amount: "3,000만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 1,000만", "(연1회) (비급여) 표적 항암 약물 치료비 1,000만", "(연1회) (비급여) 면역 항암 약물 치료비 1,000만"] },
                { name: "(연1회) 양성자 방사선 치료비", amount: "2,000만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 1,000만", "(연1회) (비급여) 양성자 방사선 치료비 1,000만"] },
                { name: "(연1회) 중입자 방사선 치료비", amount: "1,000만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 1,000만"] },
                { name: "(연1회) 세기조절방사선치료비", amount: "1,000만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 1,000만"] }
            ],
            "5000": [
                { name: "(매회) (급여/비급여) 암 수술비", amount: "750만" },
                { name: "(매회) 다빈치 로봇 수술비", amount: "750만", sub: ["(매회) (급여/비급여) 암 수술비 750만"] },
                { name: "(연1회) (급여/비급여) 항암 약물 치료비", amount: "750만" },
                { name: "(연1회) (급여/비급여) 항암 방사선 치료비", amount: "750만" },
                { name: "(연1회) 표적 항암 약물 치료비", amount: "1,500만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 750만", "(연1회) (비급여) 표적 항암 약물 치료비 750만"] },
                { name: "(연1회) 면역 항암 약물 치료비", amount: "2,150만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 750만", "(연1회) (비급여) 표적 항암 약물 치료비 750만", "(연1회) (비급여) 면역 항암 약물 치료비 750만"] },
                { name: "(연1회) 양성자 방사선 치료비", amount: "1,500만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 750만", "(연1회) (비급여) 양성자 방사선 치료비 750만"] },
                { name: "(연1회) 중입자 방사선 치료비", amount: "750만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 750만"] },
                { name: "(연1회) 세기조절방사선치료비", amount: "750만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 750만"] }
            ],
            "3000": [
                { name: "(매회) (급여/비급여) 암 수술비", amount: "500만" },
                { name: "(매회) 다빈치 로봇 수술비", amount: "500만", sub: ["(매회) (급여/비급여) 암 수술비 500만"] },
                { name: "(연1회) (급여/비급여) 항암 약물 치료비", amount: "500만" },
                { name: "(연1회) (급여/비급여) 항암 방사선 치료비", amount: "500만" },
                { name: "(연1회) 표적 항암 약물 치료비", amount: "1,000만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 500만", "(연1회) (비급여) 표적 항암 약물 치료비 500만"] },
                { name: "(연1회) 면역 항암 약물 치료비", amount: "1,500만", sub: ["(연1회) (급여/비급여) 항암 약물 치료비 500만", "(연1회) (비급여) 표적 항암 약물 치료비 500만", "(연1회) (비급여) 면역 항암 약물 치료비 500만"] },
                { name: "(연1회) 양성자 방사선 치료비", amount: "1,000만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 500만", "(연1회) (비급여) 양성자 방사선 치료비 500만"] },
                { name: "(연1회) 중입자 방사선 치료비", amount: "500만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 500만"] },
                { name: "(연1회) 세기조절방사선치료비", amount: "500만", sub: ["(연1회) (급여/비급여) 항암 방사선 치료비 500만"] }
            ]
        }
    },
    // 2. 비급여형
    "암 통합치료비Ⅱ(비급여)": {
        "type": "variant",
        "data": {
            "10000": [
                { name: "(매회) (비급여) 암 수술비", amount: "1,000만" },
                { name: "(매회) (비급여) 다빈치 로봇 수술비", amount: "2,000만", sub: ["(매회) (비급여) 암 수술비 1,000만", "(매회) (비급여) 다빈치 로봇수술 1,000만"] },
                { name: "(연1회) (비급여) 항암 방사선 치료비", amount: "1,000만" },
                { name: "(연1회) (비급여) 항암 약물 치료비", amount: "1,000만" },
                { name: "(연1회) (비급여) 표적 항암 약물 치료비", amount: "4,000만", sub: ["(연1회) (비급여) 항암 약물 치료비 1,000만", "(연1회) (비급여) 표적 항암 약물 치료비 3,000만"] },
                { name: "(연1회) (비급여) 면역 항암 약물 치료비", amount: "7,000만", sub: ["(연1회) (비급여) 항암 약물 치료비 1,000만", "(연1회) (비급여) 표적 항암 약물 치료비 3,000만", "(연1회) (비급여) 면역 항암 약물 치료비 3,000만"] },
                { name: "(연1회) (비급여) 양성자 방사선 치료비", amount: "4,000만", sub: ["(연1회) (비급여) 항암 방사선 치료비 1,000만", "(연1회) (비급여) 양성자 방사선 치료비 3,000만"] },
                { name: "(연1회) 중입자 방사선 치료비", amount: "1,000만", sub: ["(연1회) (비급여) 항암 방사선 치료비 1,000만"] }
            ],
            "7000": [
                { name: "(매회) (비급여) 암 수술비", amount: "750만" },
                { name: "(매회) (비급여) 다빈치 로봇 수술비", amount: "1,500만", sub: ["(매회) (비급여) 암 수술비 750만", "(매회) (비급여) 다빈치 로봇수술 750만"] },
                { name: "(연1회) (비급여) 항암방사선 치료비", amount: "750만" },
                { name: "(연1회) (비급여) 항암 약물 치료비", amount: "750만" },
                { name: "(연1회) (비급여) 표적항암약물치료비", amount: "2,750만", sub: ["(연1회) (비급여) 항암 약물 치료비 750만", "(연1회) (비급여) 표적항암약물 치료비 2,000만"] },
                { name: "(연1회) (비급여) 면역항암 약물 치료비", amount: "4,750만", sub: ["(연1회) (비급여) 항암약물 치료비 750만", "(연1회) (비급여) 표적항암 약물치료비 2,000만", "(연1회) (비급여) 면역항암 약물 치료비 2,000만"] },
                { name: "(연1회) (비급여) 양성자 방사선 치료비", amount: "2,750만", sub: ["(연1회) (비급여) 항암방사선 치료비 750만", "(연1회) (비급여) 양성자 방사선 치료비 2,000만"] },
                { name: "(연1회) 중입자 방사선 치료비", amount: "750만", sub: ["(연1회) (비급여) 항암 방사선 치료비 750만"] }
            ],
            "4000": [
                { name: "(매회) (비급여) 암 수술비", amount: "500만" },
                { name: "(매회) (비급여) 다빈치 로봇 수술비", amount: "1,000만", sub: ["(매회) (비급여) 암 수술비 500만", "(매회) (비급여) 다빈치 로봇수술 500만"] },
                { name: "(연1회) (비급여) 항암방사선 치료비", amount: "500만" },
                { name: "(연1회) (비급여) 항암 약물 치료비", amount: "500만" },
                { name: "(연1회) (비급여) 표적항암약물치료비", amount: "1,500만", sub: ["(연1회) (비급여) 항암 약물 치료비 500만", "(연1회) (비급여) 표적항암약물 치료비 1,000만"] },
                { name: "(연1회) (비급여) 면역항암 약물 치료비", amount: "2,500만", sub: ["(연1회) (비급여) 항암약물 치료비 500만", "(연1회) (비급여) 표적항암 약물치료비 1,000만", "(연1회) (비급여) 면역항암 약물 치료비 1,000만"] },
                { name: "(연1회) (비급여) 양성자 방사선 치료비", amount: "1,500만", sub: ["(연1회) (비급여) 항암방사선 치료비 500만", "(연1회) (비급여) 양성자 방사선 치료비 1,000만"] },
                { name: "(연1회) 중입자 방사선 치료비", amount: "500만", sub: ["(연1회) (비급여) 항암 방사선 치료비 500만"] }
            ]
        }
    },
    // 3. 암 통합치료비 III (Range Type)
    "암진단및치료비(암 통합치료비III)": {
        "type": "variant",
        "data": {
            "5000": [
                { name: "(연1회) 표적항암약물치료비", amount: "2,000만(3,000만)", maxAmount: "3,000만" },
                { name: "(연1회) 면역항암약물치료비", amount: "2,000만(3,000만)", maxAmount: "3,000만", hiddenInDetail: true },
                { name: "(연1회) 양성자 방사선 치료비", amount: "2,000만(3,000만)", maxAmount: "3,000만" }
            ],
            "4000": [
                { name: "(연1회) 표적항암약물치료비", amount: "1,000만(3,000만)", maxAmount: "3,000만" },
                { name: "(연1회) 면역항암약물치료비", amount: "1,000만(3,000만)", maxAmount: "3,000만", hiddenInDetail: true },
                { name: "(연1회) 양성자 방사선 치료비", amount: "1,000만(3,000만)", maxAmount: "3,000만" }
            ]
        }
    },
    // 4. 10년갱신 개별 담보 (passthrough)
    "항암중입자방사선치료비": { type: "passthrough", displayName: "(최초1회) 중입자방사선치료비" },
    "항암세기조절방사선치료비": { type: "passthrough", displayName: "(10년갱신)(최초1회) 세기조절방사선치료비" },
    "특정면역항암약물허가치료비": { type: "passthrough", displayName: "(10년갱신)(최초1회) 면역항암약물치료비" },
    "표적항암약물허가치료비": { type: "passthrough", displayName: "(10년갱신)(최초1회) 표적항암약물치료비" },
    "항암양성자방사선치료비": { type: "passthrough", displayName: "(10년갱신)(최초1회) 양성자방사선치료비" },
    "다빈치로봇암수술비": { type: "passthrough", displayName: "(10년갱신)(최초1회) 다빈치 로봇 수술비" },
    // 26종
    "26종항암방사선및약물치료비": {
        type: "26jong",
        detailName: "26종 항암방사선 및 약물 치료비",
        summaryItems: [
            { name: "(최대 26회) 26종 항암 방사선 치료비", targetName: "항암방사선치료비" },
            { name: "(최대 26회) 26종 항암 약물 치료비", targetName: "항암약물치료비" },
            { name: "(최대 26회) 26종항암방사선치료비", targetName: "표적항암약물치료비" },
            { name: "(최대 26회) 26종항암방사선치료비", targetName: "면역항암약물치료비" },
            { name: "(최대 26회) 26종항암방사선치료비", targetName: "양성자방사선치료비" },
            { name: "(최대 26회) 26종항암방사선치료비", targetName: "중입자방사선치료비" }
        ]
    }
};

function findDetails(itemName: string): CoverageDetail | undefined {
    let details = coverageDetailsMap[itemName];
    if (!details) {
        if (itemName.includes("암 통합치료비") && (itemName.includes("III") || itemName.includes("Ⅲ"))) {
            details = coverageDetailsMap["암진단및치료비(암 통합치료비III)"];
        }
        else if (itemName.includes("암 통합치료비") && itemName.includes("주요치료")) {
            details = coverageDetailsMap["암 통합치료비(주요치료)(비급여(전액본인부담 포함), 암중점치료기관(상급 종합병원 포함))"];
        }
        else if (itemName.includes("암 통합치료비") && itemName.includes("비급여") && itemName.includes("전액본인부담")) {
            details = coverageDetailsMap["암 통합치료비(비급여(전액본인부담 포함), 암중점치료기관(상급종합병원 포함))"];
        }
        else if (itemName.includes("암 통합치료비") && (itemName.includes("Ⅱ") || itemName.includes("II")) && itemName.includes("비급여")) {
            details = coverageDetailsMap["암 통합치료비Ⅱ(비급여)"];
        }
        else if (itemName.includes("암 통합치료비") && itemName.includes("기본형")) {
            details = coverageDetailsMap["암 통합치료비(기본형)(암중점치료기관(상급종합병원 포함))"];
        }
        else if (itemName.includes("암 통합치료비") && itemName.includes("실속형")) {
            details = coverageDetailsMap["암 통합치료비(실속형)(암중점치료기관(상급종합병원 포함))"];
        }
        else if (itemName.includes("중입자방사선")) {
            details = coverageDetailsMap["항암중입자방사선치료비"];
        } else if (itemName.includes("세기조절방사선")) {
            details = coverageDetailsMap["항암세기조절방사선치료비"];
        } else if (itemName.includes("면역항암약물") || itemName.includes("면역항암")) {
            details = coverageDetailsMap["특정면역항암약물허가치료비"];
        } else if (itemName.includes("표적항암약물") || itemName.includes("표적항암")) {
            details = coverageDetailsMap["표적항암약물허가치료비"];
        } else if (itemName.includes("양성자방사선") || itemName.includes("양성자")) {
            details = coverageDetailsMap["항암양성자방사선치료비"];
        } else if (itemName.includes("26종")) {
            details = coverageDetailsMap["26종항암방사선및약물치료비"];
        } else if (itemName.includes("다빈치") && itemName.includes("로봇")) {
            if (!itemName.includes("특정암") || itemName.includes("제외")) {
                details = coverageDetailsMap["다빈치로봇암수술비"];
            }
        }
    }
    return details;
}

export function analyzeCoverages(extractedItems: ExtractedCoverage[]): { items: CoverageItem[]; summary: AnalysisSummary } {
    let grandTotalMin = 0;

    // Process items for display
    const processedItems: CoverageItem[] = extractedItems.map(item => {
        const details = findDetails(item.name);

        // Match status based on map exactness
        let status: 'good' | 'warning' | 'missing' = 'good';
        if (!details) status = 'warning';

        let subDetails: { name: string, amount: string }[] | undefined;

        if (details) {
            if (details.type === '26jong') {
                subDetails = details.summaryItems.map(d => ({
                    name: d.name,
                    amount: item.amount // 26jong usually shares the same amount for sub-items
                }));
            } else if (details.type === 'variant') {
                const amountVal = parseKoAmount(item.amount);
                // Try to find variant data
                let variantData = details.data[amountVal.toString()];
                // Fallback logic for approximation
                if (!variantData) {
                    if (amountVal > 6000) variantData = details.data["8000"] || details.data["10000"];
                    else if (amountVal > 3000) variantData = details.data["5000"] || details.data["4000"];
                    else if (amountVal > 1000) variantData = details.data["2000"] || details.data["1000"];
                    if (!variantData && details.data["10000"]) variantData = details.data["10000"];
                }

                if (variantData) {
                    // Check if any variant item has 'sub' property
                    const subs = variantData.flatMap(v => v.sub ? v.sub.map(s => ({ name: s, amount: '-' })) : []);
                    if (subs.length > 0) {
                        subDetails = subs;
                    }
                }
            }
        }

        return {
            ...item,
            status,
            matchType: details ? details.type : 'unknown',
            subDetails
        };
    });

    // Calculate Summary logic (Hierarchical)
    const summaryMap = new Map<string, { totalMin: number, totalMax: number, count: number, items: { name: string, amount: string }[] }>();
    let first26SummaryFound = false;

    processedItems.forEach(item => {
        let details = findDetails(item.name);

        if (details && details.type === 'variant') {
            const amountVal = parseKoAmount(item.amount);
            let variantData = details.data[amountVal.toString()];
            if (!variantData) {
                if (amountVal > 6000) variantData = details.data["8000"] || details.data["10000"];
                else if (amountVal > 3000) variantData = details.data["5000"] || details.data["4000"];
                else if (amountVal > 1000) variantData = details.data["2000"] || details.data["1000"];
                if (!variantData && details.data["10000"]) variantData = details.data["10000"];
            }
            if (variantData) {
                variantData.forEach(det => {
                    addToSummary(summaryMap, det.name, det.amount, det.maxAmount, undefined, item.name); // Pass original source name
                });
            }
        }
        else if (details && details.type === 'passthrough') {
            addToSummary(summaryMap, details.displayName, item.amount, undefined, undefined, item.name);
        }
        else if (details && details.type === '26jong') {
            if (!first26SummaryFound) {
                first26SummaryFound = true;
                details.summaryItems.forEach(d => {
                    addToSummary(summaryMap, d.name, item.amount, undefined, d.targetName, item.name);
                });
            }
        }
    });

    summaryMap.forEach((val) => {
        grandTotalMin += val.totalMin;
    });

    const groups = Array.from(summaryMap.entries()).map(([name, data]) => ({
        name,
        totalMin: data.totalMin,
        totalMax: data.totalMax,
        count: data.count,
        items: data.items
    }));

    return {
        items: processedItems,
        summary: {
            totalItems: extractedItems.length,
            matchedItems: processedItems.filter(i => i.status === 'good').length,
            missingItems: processedItems.filter(i => i.status === 'warning').length,
            totalPremium: formatKoAmount(grandTotalMin),
            groups
        }
    };
}

function addToSummary(map: Map<string, any>, name: string, amount: string, maxAmount?: string, groupingName?: string, sourceName?: string) {
    let groupingSource = groupingName || name;
    let normalizedName = groupingSource;

    if (!groupingName) {
        if (groupingSource.includes("표적")) normalizedName = "표적항암약물치료비";
        else if (groupingSource.includes("면역")) normalizedName = "면역항암약물치료비";
        else if (groupingSource.includes("양성자")) normalizedName = "양성자방사선치료비";
        else if (groupingSource.includes("중입자")) normalizedName = "중입자방사선치료비";
        else if (groupingSource.includes("다빈치") || groupingSource.includes("로봇")) normalizedName = "다빈치로봇수술비";
        else if (groupingSource.includes("세기조절")) normalizedName = "세기조절방사선치료비";
        else if (groupingSource.includes("수술") && groupingSource.includes("암")) normalizedName = "암수술비";
        else if (groupingSource.includes("약물")) normalizedName = "항암약물치료비";
        else if (groupingSource.includes("방사선")) normalizedName = "항암방사선치료비";
    }

    if (!map.has(normalizedName)) {
        map.set(normalizedName, { totalMin: 0, totalMax: 0, count: 0, items: [] });
    }

    const group = map.get(normalizedName);
    const valMin = parseKoAmount(amount);
    const valMax = maxAmount ? parseKoAmount(maxAmount) : valMin;

    group.totalMin += valMin;
    group.totalMax += valMax;
    group.count += 1;

    // Add breakdown item
    group.items.push({
        name: sourceName || name, // Prefer source name (e.g. from PDF) if available, else standard name
        amount: amount
    });
}
