export interface CertificateMetadata {
    name: string;
    institution: string;
    achievment: string;
    eventDate: string;
    description?: string;
}

export interface CertificateRecord {
    id: string;
    hash: string;
    metadata: CertificateMetadata;
    timestamp: number;
    txHash: string;
    issuer: string;
    isValid: string;
}

export interface VerificationResult {
    isValid: boolean;
    record?: CertificateRecord;
    checkedAt: number;
}

export enum GemAIStatus {
    IDLE = "IDLE",
    ANALYZING = "ANALYZING",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
}
