import { SupabaseClient } from "@supabase/supabase-js";
import { CertificateRecord, CertificateMetadata } from "@/lib/types";
import { ethers } from "ethers";

export const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return `0x${hashHex}`;
};

export const issueCertificateDirect = async (
    supabase: SupabaseClient,
    metadata: CertificateMetadata,
    fileHash: string,
    issuerId: string
): Promise<CertificateRecord> => {
    const { data: existing, error: checkError } = await supabase
        .from("certificates")
        .select("hash")
        .eq("hash", fileHash)
        .maybeSingle();

    if (checkError) throw new Error(checkError.message);

    if (existing) {
        throw new Error(
            "This document has already been registered on the blockchain."
        );
    }

    const txHash = ethers.id(`${Date.now()}-${Math.random()}`);

    const newRecord = {
        id: crypto.randomUUID(),
        hash: fileHash,
        metadata: metadata,
        timestamp: Date.now(),
        tx_hash: txHash,
        issuer: issuerId,
        is_valid: true,
    };

    const { data, error } = await supabase
        .from("certificates")
        .insert([newRecord])
        .select()
        .single();

    if (error) {
        console.error("Supabase Insert Error:", error);
        throw new Error(error.message || "Failed to issue certificate.");
    }

    return {
        id: data.id,
        hash: data.hash,
        metadata: data.metadata,
        timestamp: data.timestamp,
        txHash: data.tx_hash,
        issuer: data.issuer,
    };
};

export const verifyCertificateDirect = async (
    supabase: SupabaseClient,
    fileHash: string
): Promise<CertificateRecord | null> => {
    const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("hash", fileHash)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
        id: data.id,
        hash: data.hash,
        metadata: data.metadata,
        timestamp: data.timestamp,
        txHash: data.tx_hash,
        issuer: data.issuer,
    };
};

export const getRecentCertificates = async (
    supabase: SupabaseClient
): Promise<CertificateRecord[]> => {
    const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching history:", error);
        return [];
    }

    return data.map((d) => ({
        id: d.id,
        hash: d.hash,
        metadata: d.metadata,
        timestamp: d.timestamp,
        txHash: d.tx_hash,
        issuer: d.issuer,
        isValid: d.is_valid,
    }));
};
