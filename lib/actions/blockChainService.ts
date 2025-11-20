import { CertificateRecord, CertificateMetadata } from "@/lib/types";

export const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return `0x${hashHex}`;
};

export const issueCertificateAPI = async (
    metadata: CertificateMetadata,
    fileHash: string,
    issuerId: string,
    file: File
): Promise<CertificateRecord> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("hash", fileHash);
    formData.append("issuerId", issuerId);
    formData.append("metadata", JSON.stringify(metadata));

    const response = await fetch("/api/certificates/issue", {
        method: "POST",
        body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.error || "Gagal menerbitkan sertifikat via API."
        );
    }

    return result.data;
};

export const verifyCertificateAPI = async (
    fileHash: string
): Promise<CertificateRecord | null> => {
    const response = await fetch("/api/certificates/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            hash: fileHash,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Gagal memverifikasi dokumen.");
    }

    if (!result.valid) {
        return null;
    }

    return result.data;
};

export const getRecentCertificatesAPI = async (): Promise<
    CertificateRecord[]
> => {
    const response = await fetch("/api/certificates/recent", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        console.error("API History Error:", result.error);
        return [];
    }

    return result.data;
};
