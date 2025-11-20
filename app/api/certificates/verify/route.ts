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

        if (currentBlock.is_valid === false) {
            return NextResponse.json({
                success: true,
                valid: false,
                message:
                    "ALERT: Dokumen ini telah ditandai INVALID oleh sistem (Tampered Record).",
                data: currentBlock,
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

        const dataString = `${previousHash}-${currentBlock.hash}-${sortedMetadata}-${currentBlock.issuer}-${normalizedTimestamp}`;
        const recalculatedTxHash = ethers.id(dataString);

        const isIntegrityValid = recalculatedTxHash === currentBlock.tx_hash;

        const { data: nextBlock } = await supabase
            .from("certificates")
            .select("*")
            .gt("timestamp", currentBlock.timestamp)
            .order("timestamp", { ascending: true })
            .limit(1)
            .maybeSingle();

        if (!isIntegrityValid) {
            console.error(
                `[SECURITY] Tampering detected on Block ID: ${currentBlock.id}`
            );

            await supabase
                .from("certificates")
                .update({ is_valid: false })
                .eq("id", currentBlock.id);

            if (nextBlock) {
                console.error(
                    `[SECURITY] Invalidating Next Block ID: ${nextBlock.id} due to broken chain.`
                );
                await supabase
                    .from("certificates")
                    .update({ is_valid: false })
                    .eq("id", nextBlock.id);
            }

            return NextResponse.json({
                success: true,
                valid: false,
                message:
                    "TAMPER DETECTED! Data integrity check failed. System has flagged this record and the next block as INVALID.",
                debug: {
                    stored: currentBlock.tx_hash,
                    calculated: recalculatedTxHash,
                },
            });
        }

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

            const nextDataString = `${currentBlock.tx_hash}-${nextBlock.hash}-${nextSortedMetadata}-${nextBlock.issuer}-${nextNormalizedTimestamp}`;
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
            integrity: isIntegrityValid,
            chainStatus: {
                connected: isChainConnected,
                message: nextBlockMessage,
                previousBlockFound: !!prevBlock,
            },
            data: {
                id: currentBlock.id,
                hash: currentBlock.hash,
                metadata: currentBlock.metadata,
                timestamp: currentBlock.timestamp,
                txHash: currentBlock.tx_hash,
                issuer: currentBlock.issuer,
                isValid: currentBlock.is_valid,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
