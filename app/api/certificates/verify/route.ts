import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { hash } = body;

        if (!hash) {
            return NextResponse.json(
                { success: false, error: "Hash file diperlukan" },
                { status: 400 }
            );
        }

        const { data: currentBlock, error } = await supabase
            .from("certificates")
            .select("*")
            .eq("hash", hash)
            .maybeSingle();

        if (error) throw new Error(error.message);

        if (!currentBlock) {
            return NextResponse.json({
                success: true,
                valid: false,
                message: "Dokumen tidak ditemukan di ledger.",
            });
        }

        const { data: prevBlock } = await supabase
            .from("certificates")
            .select("tx_hash")
            .lt("timestamp", currentBlock.timestamp)
            .order("timestamp", { ascending: false })
            .limit(1)
            .maybeSingle();

        const previousHash =
            prevBlock?.tx_hash ||
            "0x0000000000000000000000000000000000000000000000000000000000000000";

        let normalizedTimestamp = currentBlock.timestamp;
        if (
            typeof normalizedTimestamp === "string" &&
            !normalizedTimestamp.endsWith("Z")
        ) {
            normalizedTimestamp += "Z";
        }

        const sortedMetadata = JSON.stringify(
            currentBlock.metadata,
            Object.keys(currentBlock.metadata).sort()
        );

        const secretKey =
            process.env.LEDGER_SECRET_KEY || process.env.SECRET_KEY || "";

        const dataString = `${previousHash}-${currentBlock.hash}-${sortedMetadata}-${currentBlock.issuer}-${normalizedTimestamp}-${secretKey}`;
        const recalculatedTxHash = ethers.id(dataString);

        const isIntegrityValid = recalculatedTxHash === currentBlock.tx_hash;
        const isMarkedInvalid = currentBlock.is_valid === false;

        if (!isIntegrityValid || isMarkedInvalid) {
            console.error(
                `[SECURITY] Tampering detected/confirmed on Block ID: ${currentBlock.id}`
            );

            if (!isMarkedInvalid) {
                await supabase
                    .from("certificates")
                    .update({ is_valid: false })
                    .eq("id", currentBlock.id);
            }

            return NextResponse.json({
                success: true,
                valid: false,
                tampered: true,
                message:
                    "PERINGATAN KRITIS: Data ditemukan tetapi Integritas Blockchain RUSAK. Data ini kemungkinan telah dimanipulasi secara ilegal.",
                data: {
                    id: currentBlock.id,
                    hash: currentBlock.hash,
                    metadata: currentBlock.metadata,
                    timestamp: currentBlock.timestamp,
                    txHash: currentBlock.tx_hash,
                    issuer: currentBlock.issuer,
                    isValid: false,
                },
                debug: {
                    stored: currentBlock.tx_hash,
                    calculated: recalculatedTxHash,
                },
            });
        }

        const { data: nextBlock } = await supabase
            .from("certificates")
            .select("*")
            .gt("timestamp", currentBlock.timestamp)
            .order("timestamp", { ascending: true })
            .limit(1)
            .maybeSingle();

        let isChainConnected = true;
        let nextBlockMessage = "Latest Block (Head)";

        if (nextBlock) {
            let nextNormalizedTimestamp = nextBlock.timestamp;
            if (
                typeof nextNormalizedTimestamp === "string" &&
                !nextNormalizedTimestamp.endsWith("Z")
            ) {
                nextNormalizedTimestamp += "Z";
            }
            const nextSortedMetadata = JSON.stringify(
                nextBlock.metadata,
                Object.keys(nextBlock.metadata).sort()
            );
            const nextDataString = `${currentBlock.tx_hash}-${nextBlock.hash}-${nextSortedMetadata}-${nextBlock.issuer}-${nextNormalizedTimestamp}-${secretKey}`;
            const recalculatedNextHash = ethers.id(nextDataString);

            if (recalculatedNextHash === nextBlock.tx_hash) {
                nextBlockMessage = "Connected to Next Block";
            } else {
                isChainConnected = false;
                nextBlockMessage = "Broken Link to Next Block";
            }
        }

        return NextResponse.json({
            success: true,
            valid: true,
            integrity: true,
            chainStatus: {
                connected: isChainConnected,
                message: nextBlockMessage,
            },
            data: {
                id: currentBlock.id,
                hash: currentBlock.hash,
                metadata: currentBlock.metadata,
                timestamp: currentBlock.timestamp,
                txHash: currentBlock.tx_hash,
                issuer: currentBlock.issuer,
                isValid: true,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
