export interface ExtractedCoverage {
    id: number;
    name: string;
    amount: string;
    premium: string;
    period: string;
    original: string;
}

export interface CoverageItem extends ExtractedCoverage {
    // Analysis fields (populated by logic)
    status?: 'good' | 'warning' | 'missing';
    matchType?: string;
    standardAmount?: string;
    diff?: number;
    message?: string;
    subDetails?: { name: string, amount: string }[];
}

export interface SummaryGroup {
    name: string;
    totalMin: number;
    totalMax: number;
    count: number;
    items: {
        name: string;
        amount: string;
    }[];
}

export interface AnalysisSummary {
    totalItems: number;
    matchedItems: number;
    missingItems: number;
    totalPremium: string;
    groups: SummaryGroup[];
}
