import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { count, error: countError } = await supabase
            .from("certificates")
            .select("*", { count: "exact", head: true });

        if (countError) throw new Error(countError.message);

        const { data, error } = await supabase
            .from("certificates")
            .select("*")
            .order("timestamp", { ascending: false })
            .range(from, to);

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
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
