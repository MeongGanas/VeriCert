export enum UserRole {
    ISSUER = "ISSUER",
    VERIFIER = "VERIFIER",
    NONE = "NONE",
}

export interface CertificateMetadata {
    studentName: string;
    studentId: string;
    institution: string;
    graduationDate: string;
    degree: string;
    gpa: string;
    description?: string;
}

export interface CertificateRecord {
    id: string;
    hash: string;
    metadata: CertificateMetadata;
    timestamp: number;
    txHash: string;
    issuer: string;
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
