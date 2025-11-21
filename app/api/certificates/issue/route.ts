import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
    try {
        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { success: false, error: "Server Key Missing" },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const formData = await req.formData();

        const file = formData.get("file") as File;
        const metadataString = formData.get("metadata") as string;
        const hash = formData.get("hash") as string;
        const issuerId = formData.get("issuerId") as string;

        if (!file || !metadataString || !hash || !issuerId) {
            return NextResponse.json(
                { success: false, error: "Data tidak lengkap" },
                { status: 400 }
            );
        }

        let metadata = JSON.parse(metadataString);

        const { data: existing } = await supabase
            .from("certificates")
            .select("hash")
            .eq("hash", hash)
            .maybeSingle();

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Dokumen ini sudah terdaftar di sistem.",
                },
                { status: 409 }
            );
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${hash}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("certificates")
            .upload(fileName, file, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError)
            throw new Error("Gagal upload file: " + uploadError.message);

        const { data: lastBlock } = await supabase
            .from("certificates")
            .select("tx_hash")
            .order("timestamp", { ascending: false })
            .limit(1)
            .maybeSingle();

        const previousHash =
            lastBlock?.tx_hash ||
            "0x0000000000000000000000000000000000000000000000000000000000000000";
        const timestamp = new Date().toISOString();

        const sortedMetadata = JSON.stringify(
            metadata,
            Object.keys(metadata).sort()
        );

        const dataString = `${previousHash}-${hash}-${sortedMetadata}-${issuerId}-${timestamp}-${process.env.SECRET_KEY}`;
        const txHash = ethers.id(dataString);

        const newRecord = {
            hash: hash,
            metadata: metadata,
            timestamp: timestamp,
            tx_hash: txHash,
            issuer: issuerId,
            is_valid: true,
        };

        const { data, error } = await supabase
            .from("certificates")
            .insert([newRecord])
            .select()
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({
            success: true,
            data: {
                id: data.id,
                hash: data.hash,
                metadata: data.metadata,
                timestamp: data.timestamp,
                txHash: data.tx_hash,
                issuer: data.issuer,
                isValid: data.is_valid,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
