import { sql } from "@/app/lib/sql";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { user, month } = await req.json();

    try {
        // Fetch user transactions from database
        const transactions = await sql`
            SELECT date, category, detail, amount 
            FROM transactions
            WHERE "user" = ${user} AND TO_CHAR(date, 'YYYY-MM') = ${month}
            ORDER BY date DESC
        `;

        return Response.json(transactions, { status: 200 });
    }
    catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }
}