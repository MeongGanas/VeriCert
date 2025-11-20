export enum UserRole {
  ISSUER = "ISSUER",
  VERIFIER = "VERIFIER",
  NONE = "NONE",
}

export interface CertificateMetadata {
  recipientName: string;
  recipientId: string;
  issuerName: string;
  issueDate: string;
  certificateTitle: string;
  additionalInfo: string;
  description?: string;
}

export interface CertificateRecord {
  id: string;
  hash: string;
  metadata: CertificateMetadata;
  timestamp: number;
  txHash: string;
  issuer: string;
  isValid?: boolean;
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
