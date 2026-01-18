import { sql } from "@/app/lib/sql";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { user, category, month } = body;

        if (!category || !month) {
            return NextResponse.json({ error: "Missing category or month" }, { status: 400 });
        }

        // We only delete from the overrides table
        await sql`
            DELETE FROM budget_overrides
            WHERE "user"=${user} 
            AND category=${category} 
            AND month=${month}
        `;

        return new Response("ok", { status: 200 });
    } catch (err) {
        console.error("Override Delete Error:", err);
        return new Response("Error resetting override", { status: 500 });
    }
}