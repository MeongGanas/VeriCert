import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("certificates")
            .select("*")
            .order("timestamp", { ascending: false })
            .limit(10);

        if (error) {
            throw new Error(error.message);
        }

        const formattedData = data.map((record) => ({
            id: record.id,
            hash: record.hash,
            metadata: record.metadata,
            timestamp: record.timestamp,
            txHash: record.tx_hash,
            issuer: record.issuer,
            isValid: record.is_valid,
        }));

        return NextResponse.json({
            success: true,
            data: formattedData,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
